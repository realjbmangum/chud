/**
 * Event handler for processing Claude Code hook events
 */

export function createEventHandler(state, transcriptReader) {
  return function handleEvent(event) {
    const { hook_event_name, tool_name, tool_input, tool_response, session_id, transcript_path } = event;

    // Set transcript path if provided (for reading stats)
    if (transcript_path && transcriptReader) {
      transcriptReader.setTranscriptPath(transcript_path);
    }

    switch (hook_event_name) {
      case 'SessionStart':
        state.setSession(session_id);
        state.setStatus('Session started');
        // Reset timer for new session
        state.update({ startTime: Date.now(), elapsedSeconds: 0 });
        break;

      case 'PreToolUse':
        state.setLastTool(tool_name);
        state.setStatus(`Running ${tool_name}...`);
        break;

      case 'PostToolUse':
        state.setStatus('Ready');

        // Handle TodoWrite to update todo progress
        if (tool_name === 'TodoWrite' && tool_input?.todos) {
          const todos = tool_input.todos;
          const total = todos.length;
          const completed = todos.filter(t => t.status === 'completed').length;
          state.setTodos(completed, total);
        }
        break;

      case 'UserPromptSubmit':
        state.incrementMessages();
        state.setStatus('Processing...');
        break;

      case 'Stop':
        state.setStatus('Ready');
        break;

      default:
        // Unknown event type, log for debugging
        break;
    }

    // Update session ID if present
    if (session_id && session_id !== '-') {
      state.update({ sessionId: session_id });
    }
  };
}
