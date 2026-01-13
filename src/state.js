/**
 * State management for companion session data
 */

// Model pricing per 1M tokens (as of Jan 2025)
const MODEL_PRICING = {
  'opus-4.5': { input: 15, output: 75 },
  'opus-4': { input: 15, output: 75 },
  'sonnet-4': { input: 3, output: 15 },
  'sonnet-3.5': { input: 3, output: 15 },
  'haiku-3.5': { input: 0.25, output: 1.25 },
};

export function createState() {
  // Initialize with waiting state - will be populated by hooks
  let state = {
    model: 'waiting...',
    sessionId: '-',
    startTime: Date.now(),
    elapsedSeconds: 0,

    tokensIn: 0,
    tokensOut: 0,

    messageCount: 0,

    todos: {
      completed: 0,
      total: 0,
    },

    lastTool: '-',
    status: 'Waiting for session',
  };

  function calculateCost() {
    const pricing = MODEL_PRICING[state.model] || MODEL_PRICING['sonnet-4'];
    const inputCost = (state.tokensIn / 1_000_000) * pricing.input;
    const outputCost = (state.tokensOut / 1_000_000) * pricing.output;
    return inputCost + outputCost;
  }

  function formatElapsed(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return {
    get() {
      return {
        ...state,
        cost: calculateCost(),
        elapsedFormatted: formatElapsed(state.elapsedSeconds),
      };
    },

    updateTimer() {
      state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    },

    update(updates) {
      state = { ...state, ...updates };
    },

    setModel(model) {
      state.model = model;
    },

    addTokens(input, output) {
      state.tokensIn += input;
      state.tokensOut += output;
    },

    incrementMessages() {
      state.messageCount++;
    },

    setTodos(completed, total) {
      state.todos = { completed, total };
    },

    setLastTool(tool) {
      state.lastTool = tool;
    },

    setStatus(status) {
      state.status = status;
    },

    setSession(sessionId, startTime) {
      state.sessionId = sessionId;
      state.startTime = startTime || Date.now();
      state.elapsedSeconds = 0;
      state.tokensIn = 0;
      state.tokensOut = 0;
      state.messageCount = 0;
      state.todos = { completed: 0, total: 0 };
    },
  };
}
