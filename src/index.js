#!/usr/bin/env node

/**
 * C.H.U.D. (Claude Heads Up Display)
 * Real-time session stats overlay for Claude Code terminal sessions
 */

import { createDisplay } from './display.js';
import { createState } from './state.js';
import { createSocketServer } from './socket.js';
import { createEventHandler } from './events.js';
import { createTranscriptReader } from './transcript.js';

// Initialize components
const state = createState();
const display = createDisplay();
const transcriptReader = createTranscriptReader();
const handleEvent = createEventHandler(state, transcriptReader);

// Start socket server to receive hook events
const socketServer = createSocketServer((event) => {
  handleEvent(event);
  display.render(state.get()); // Re-render on each event
});

// Poll transcript for stats every 2 seconds
const statsPollInterval = setInterval(() => {
  const stats = transcriptReader.readStats();
  if (stats) {
    if (stats.model) state.setModel(stats.model);
    state.update({
      tokensIn: stats.tokensIn,
      tokensOut: stats.tokensOut,
      messageCount: stats.messageCount,
    });
  }
}, 2000);

// Update display every second (for timer)
const timerInterval = setInterval(() => {
  state.updateTimer();
  display.render(state.get());
}, 1000);

// Try to find existing session on startup
const existingTranscript = transcriptReader.findLatestTranscript();
if (existingTranscript) {
  transcriptReader.setTranscriptPath(existingTranscript);
  const stats = transcriptReader.readStats();
  if (stats) {
    if (stats.model) state.setModel(stats.model);
    state.update({
      tokensIn: stats.tokensIn,
      tokensOut: stats.tokensOut,
      messageCount: stats.messageCount,
      status: 'Connected to session',
    });
  }
}

// Initial render
console.log(`Listening on ${socketServer.getSocketPath()}`);
setTimeout(() => {
  display.render(state.get());
}, 100);

// Handle clean exit
function cleanup() {
  clearInterval(timerInterval);
  clearInterval(statsPollInterval);
  socketServer.close();
  display.clear();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
