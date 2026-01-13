#!/usr/bin/env node

/**
 * Setup script to install Claude Code hooks for companion
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const HOOKS_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'hooks');
const EMIT_SCRIPT = path.join(HOOKS_DIR, 'emit-event.sh');

// Hook configuration for companion
const COMPANION_HOOKS = {
  SessionStart: [
    {
      matcher: '',
      hooks: [{ type: 'command', command: EMIT_SCRIPT }]
    }
  ],
  PreToolUse: [
    {
      matcher: '',
      hooks: [{ type: 'command', command: EMIT_SCRIPT }]
    }
  ],
  PostToolUse: [
    {
      matcher: '',
      hooks: [{ type: 'command', command: EMIT_SCRIPT }]
    }
  ],
  UserPromptSubmit: [
    {
      matcher: '',
      hooks: [{ type: 'command', command: EMIT_SCRIPT }]
    }
  ],
  Stop: [
    {
      matcher: '',
      hooks: [{ type: 'command', command: EMIT_SCRIPT }]
    }
  ]
};

function loadSettings() {
  if (!fs.existsSync(CLAUDE_SETTINGS_PATH)) {
    return {};
  }
  const content = fs.readFileSync(CLAUDE_SETTINGS_PATH, 'utf8');
  return JSON.parse(content);
}

function saveSettings(settings) {
  const dir = path.dirname(CLAUDE_SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

function mergeHooks(existing, companion) {
  const merged = { ...existing };

  for (const [eventName, hookConfigs] of Object.entries(companion)) {
    if (!merged[eventName]) {
      merged[eventName] = [];
    }

    // Check if our hook is already installed
    const alreadyInstalled = merged[eventName].some(config =>
      config.hooks?.some(h => h.command?.includes('emit-event.sh'))
    );

    if (!alreadyInstalled) {
      merged[eventName].push(...hookConfigs);
    }
  }

  return merged;
}

function main() {
  const args = process.argv.slice(2);
  const uninstall = args.includes('--uninstall');

  // Make hook script executable
  fs.chmodSync(EMIT_SCRIPT, 0o755);

  const settings = loadSettings();

  if (uninstall) {
    // Remove our hooks
    if (settings.hooks) {
      for (const eventName of Object.keys(settings.hooks)) {
        settings.hooks[eventName] = settings.hooks[eventName].filter(config =>
          !config.hooks?.some(h => h.command?.includes('emit-event.sh'))
        );
        if (settings.hooks[eventName].length === 0) {
          delete settings.hooks[eventName];
        }
      }
      if (Object.keys(settings.hooks).length === 0) {
        delete settings.hooks;
      }
    }
    saveSettings(settings);
    console.log('Companion hooks uninstalled from ~/.claude/settings.json');
    return;
  }

  // Install hooks
  settings.hooks = mergeHooks(settings.hooks || {}, COMPANION_HOOKS);
  saveSettings(settings);

  console.log('Companion hooks installed to ~/.claude/settings.json');
  console.log('');
  console.log('Hooks configured for:');
  console.log('  - SessionStart');
  console.log('  - PreToolUse');
  console.log('  - PostToolUse');
  console.log('  - UserPromptSubmit');
  console.log('  - Stop');
  console.log('');
  console.log('Start the companion with: npm start');
  console.log('Then start a new Claude Code session in another terminal.');
}

main();
