/**
 * Unix socket server for receiving events from Claude Code hooks
 */

import net from 'net';
import fs from 'fs';
import path from 'path';

const SOCKET_PATH = '/tmp/chud.sock';

export function createSocketServer(onEvent) {
  // Clean up existing socket file if it exists
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }

  const server = net.createServer((connection) => {
    let buffer = '';

    connection.on('data', (data) => {
      buffer += data.toString();

      // Process complete JSON messages (newline-delimited)
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.trim()) {
          try {
            const event = JSON.parse(line);
            onEvent(event);
          } catch (err) {
            // Silently ignore parse errors
          }
        }
      }
    });

    connection.on('error', () => {
      // Silently ignore connection errors
    });

    connection.on('end', () => {
      // Connection closed normally
    });
  });

  server.on('error', () => {
    // Silently ignore server errors
  });

  server.listen(SOCKET_PATH, () => {
    // Make socket accessible
    fs.chmodSync(SOCKET_PATH, 0o666);
  });

  return {
    close() {
      server.close();
      if (fs.existsSync(SOCKET_PATH)) {
        fs.unlinkSync(SOCKET_PATH);
      }
    },

    getSocketPath() {
      return SOCKET_PATH;
    },
  };
}
