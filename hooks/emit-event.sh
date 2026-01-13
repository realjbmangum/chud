#!/bin/bash
# Emit Claude Code hook events to C.H.U.D. socket
# This script receives JSON on stdin from Claude Code hooks

SOCKET_PATH="/tmp/chud.sock"
DEBUG_LOG="/tmp/chud-debug.log"

# Read the entire JSON input from stdin
input=$(cat)

# Debug: log what we received
echo "[$(date)] Received: $input" >> "$DEBUG_LOG"

# Only send if socket exists (companion is running)
if [ -S "$SOCKET_PATH" ]; then
  # Send the JSON to the socket with a newline
  echo "$input" | nc -U -w 1 "$SOCKET_PATH" 2>/dev/null || true
  echo "[$(date)] Sent to socket" >> "$DEBUG_LOG"
fi

# Always exit 0 so we don't block Claude Code
exit 0
