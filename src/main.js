/**
 * C.H.U.D. (Claude Heads Up Display) - Electron Main Process
 * Creates a floating, transparent overlay window for Claude Code
 */

import { app, BrowserWindow, ipcMain, screen, safeStorage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { createSocketServer } from './socket.js';
import { createTranscriptReader } from './transcript.js';
import { createUsageClient } from './usage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let socketServer = null;
let transcriptReader = null;
let statsInterval = null;
let usageClient = null;
let usageInterval = null;

// Session state
let sessionState = {
  model: 'waiting...',
  sessionId: '-',
  startTime: Date.now(),
  tokensIn: 0,
  tokensOut: 0,
  messageCount: 0,
  todos: { completed: 0, total: 0 },
  lastTool: '-',
  status: 'Waiting for session',
  usage: null, // Will contain { daily, weekly, resetTime }
};

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 280,
    height: 420,
    x: screenWidth - 300,
    y: 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Allow dragging the window
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // macOS specific: keep on top even with full screen apps
  if (process.platform === 'darwin') {
    mainWindow.setAlwaysOnTop(true, 'floating', 1);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function sendStateToRenderer() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const elapsed = Math.floor((Date.now() - sessionState.startTime) / 1000);
    mainWindow.webContents.send('state-update', {
      ...sessionState,
      elapsedSeconds: elapsed,
      cost: calculateCost(),
    });
  }
}

function calculateCost() {
  const pricing = {
    'opus-4.5': { input: 15, output: 75 },
    'opus-4': { input: 15, output: 75 },
    'sonnet-4': { input: 3, output: 15 },
    'sonnet-3.5': { input: 3, output: 15 },
    'haiku-3.5': { input: 0.25, output: 1.25 },
  };
  const p = pricing[sessionState.model] || pricing['sonnet-4'];
  return (sessionState.tokensIn / 1_000_000) * p.input + (sessionState.tokensOut / 1_000_000) * p.output;
}

function handleHookEvent(event) {
  const { hook_event_name, tool_name, tool_input, session_id, transcript_path } = event;

  if (transcript_path && transcriptReader) {
    transcriptReader.setTranscriptPath(transcript_path);
  }

  switch (hook_event_name) {
    case 'SessionStart':
      sessionState.sessionId = session_id || '-';
      sessionState.startTime = Date.now();
      sessionState.status = 'Session started';
      break;

    case 'PreToolUse':
      sessionState.lastTool = tool_name || '-';
      sessionState.status = `Running ${tool_name}...`;
      break;

    case 'PostToolUse':
      sessionState.status = 'Ready';
      if (tool_name === 'TodoWrite' && tool_input?.todos) {
        const todos = tool_input.todos;
        sessionState.todos = {
          total: todos.length,
          completed: todos.filter(t => t.status === 'completed').length,
        };
      }
      break;

    case 'UserPromptSubmit':
      sessionState.messageCount++;
      sessionState.status = 'Processing...';
      break;

    case 'Stop':
      sessionState.status = 'Ready';
      break;
  }

  if (session_id) {
    sessionState.sessionId = session_id;
  }

  sendStateToRenderer();
}

function pollTranscript() {
  const stats = transcriptReader.readStats();
  if (stats) {
    if (stats.model) sessionState.model = stats.model;
    sessionState.tokensIn = stats.tokensIn;
    sessionState.tokensOut = stats.tokensOut;
    sessionState.messageCount = stats.messageCount;
  }
}

// API Key storage (encrypted)
const CONFIG_DIR = path.join(os.homedir(), '.chud');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.enc');

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function saveApiKeyToFile(apiKey) {
  try {
    ensureConfigDir();
    const encrypted = safeStorage.encryptString(apiKey);
    fs.writeFileSync(CONFIG_FILE, encrypted);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function loadApiKeyFromFile() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const encrypted = fs.readFileSync(CONFIG_FILE);
    const decrypted = safeStorage.decryptString(encrypted);
    return decrypted;
  } catch (error) {
    return null;
  }
}

function hasApiKey() {
  return fs.existsSync(CONFIG_FILE);
}

// Usage polling
async function startUsagePolling() {
  const apiKey = loadApiKeyFromFile();
  if (!apiKey) {
    return;
  }

  usageClient = createUsageClient(apiKey);

  // Fetch immediately
  await pollUsage();

  // Then poll every 60 seconds
  usageInterval = setInterval(async () => {
    await pollUsage();
  }, 60000);
}

async function pollUsage() {
  if (!usageClient) return;

  const usage = await usageClient.fetchUsage();
  if (usage) {
    sessionState.usage = usage;
    sendStateToRenderer();
  }
}

function stopUsagePolling() {
  if (usageInterval) {
    clearInterval(usageInterval);
    usageInterval = null;
  }
  usageClient = null;
}

app.whenReady().then(() => {
  createWindow();

  // Initialize transcript reader
  transcriptReader = createTranscriptReader();

  // Try to connect to existing session
  const existingTranscript = transcriptReader.findLatestTranscript();
  if (existingTranscript) {
    transcriptReader.setTranscriptPath(existingTranscript);
    pollTranscript();
    sessionState.status = 'Connected to session';
  }

  // Start socket server for hook events
  socketServer = createSocketServer((event) => {
    handleHookEvent(event);
  });

  // Poll transcript for stats every 2 seconds
  statsInterval = setInterval(() => {
    pollTranscript();
    sendStateToRenderer();
  }, 2000);

  // Update timer every second
  setInterval(() => {
    sendStateToRenderer();
  }, 1000);

  // Start usage polling if API key exists
  startUsagePolling();

  // IPC handlers
  ipcMain.on('close-app', () => {
    app.quit();
  });

  ipcMain.on('minimize-app', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('save-api-key', async (event, apiKey) => {
    const result = saveApiKeyToFile(apiKey);
    if (result.success) {
      // Restart usage polling with new key
      stopUsagePolling();
      await startUsagePolling();
    }
    return result;
  });

  ipcMain.handle('has-api-key', async () => {
    return hasApiKey();
  });
});

app.on('window-all-closed', () => {
  if (socketServer) socketServer.close();
  if (statsInterval) clearInterval(statsInterval);
  stopUsagePolling();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
