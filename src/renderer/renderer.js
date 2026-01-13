/**
 * Renderer script - handles UI updates with visualizations
 */

// DOM elements
const elements = {
  statusDot: document.getElementById('status-dot'),
  model: document.getElementById('model'),
  modelBadge: document.getElementById('model-badge'),
  session: document.getElementById('session'),
  quotaSection: document.getElementById('quota-section'),
  quotaBar: document.getElementById('quota-bar'),
  quotaPercent: document.getElementById('quota-percent'),
  quotaDetail: document.getElementById('quota-detail'),
  quotaReset: document.getElementById('quota-reset'),
  tokenTotal: document.getElementById('token-total'),
  tokensIn: document.getElementById('tokens-in'),
  tokensOut: document.getElementById('tokens-out'),
  tokenBarIn: document.getElementById('token-bar-in'),
  tokenBarOut: document.getElementById('token-bar-out'),
  cost: document.getElementById('cost'),
  costBar: document.getElementById('cost-bar'),
  time: document.getElementById('time'),
  messages: document.getElementById('messages'),
  todosSection: document.getElementById('todos-section'),
  todosCount: document.getElementById('todos-count'),
  todosBar: document.getElementById('todos-bar'),
  activityIcon: document.getElementById('activity-icon'),
  status: document.getElementById('status'),
  lastToolContainer: document.getElementById('last-tool-container'),
  lastTool: document.getElementById('last-tool'),
};

// Track max tokens for bar scaling
let maxTokens = 10000;

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatCost(cost) {
  if (cost >= 100) return `$${cost.toFixed(0)}`;
  if (cost >= 10) return `$${cost.toFixed(1)}`;
  return `$${cost.toFixed(2)}`;
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function truncateSessionId(id) {
  if (!id || id === '-') return '-';
  if (id.length <= 8) return id;
  return id.slice(0, 8);
}

function updateUI(state) {
  const {
    model,
    sessionId,
    tokensIn,
    tokensOut,
    cost,
    elapsedSeconds,
    messageCount,
    todos,
    lastTool,
    status,
    usage
  } = state;

  // Status dot
  elements.statusDot.className = 'status-dot';
  if (status?.includes('Processing') || status?.includes('Running')) {
    elements.statusDot.classList.add('processing');
  } else if (status?.includes('Waiting') || model === 'waiting...') {
    elements.statusDot.classList.add('waiting');
  }

  // Model & Session
  elements.model.textContent = model || 'waiting...';
  elements.session.textContent = truncateSessionId(sessionId);

  // Update model badge color based on model
  if (model?.includes('opus')) {
    elements.modelBadge.style.background = 'linear-gradient(135deg, rgba(191, 90, 242, 0.25), rgba(10, 132, 255, 0.15))';
    elements.modelBadge.style.borderColor = 'rgba(191, 90, 242, 0.4)';
  } else if (model?.includes('sonnet')) {
    elements.modelBadge.style.background = 'linear-gradient(135deg, rgba(10, 132, 255, 0.25), rgba(90, 200, 250, 0.15))';
    elements.modelBadge.style.borderColor = 'rgba(10, 132, 255, 0.4)';
  } else if (model?.includes('haiku')) {
    elements.modelBadge.style.background = 'linear-gradient(135deg, rgba(48, 209, 88, 0.25), rgba(99, 224, 135, 0.15))';
    elements.modelBadge.style.borderColor = 'rgba(48, 209, 88, 0.4)';
  }

  // Quota section (API usage tracking)
  if (usage && usage.daily) {
    elements.quotaSection.classList.add('visible');

    // Assuming 100M tokens daily limit (this should be configurable or from API)
    const DAILY_LIMIT = 100_000_000;
    const usedTokens = usage.daily.totalTokens;
    const percent = Math.min(100, (usedTokens / DAILY_LIMIT) * 100);

    elements.quotaPercent.textContent = `${percent.toFixed(1)}%`;
    elements.quotaDetail.textContent = `${formatNumber(usedTokens)} tokens`;
    elements.quotaBar.style.width = `${percent}%`;

    // Color coding based on usage
    elements.quotaBar.className = 'quota-bar';
    elements.quotaPercent.className = 'quota-percent';
    if (percent >= 80) {
      elements.quotaBar.classList.add('critical');
      elements.quotaPercent.classList.add('critical');
    } else if (percent >= 60) {
      elements.quotaBar.classList.add('warning');
      elements.quotaPercent.classList.add('warning');
    }

    // Reset time
    if (usage.resetTime) {
      const resetDate = new Date(usage.resetTime);
      const hours = resetDate.getHours();
      const minutes = resetDate.getMinutes();
      elements.quotaReset.textContent = `Resets at ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      elements.quotaReset.textContent = 'Resets at 11pm';
    }
  } else {
    elements.quotaSection.classList.remove('visible');
  }

  // Tokens with bars
  const totalTokens = (tokensIn || 0) + (tokensOut || 0);
  elements.tokenTotal.textContent = formatNumber(totalTokens);
  elements.tokensIn.textContent = formatNumber(tokensIn || 0);
  elements.tokensOut.textContent = formatNumber(tokensOut || 0);

  // Update max for scaling (grow but don't shrink)
  maxTokens = Math.max(maxTokens, tokensIn || 0, tokensOut || 0, 10000);

  const inPercent = Math.min(100, ((tokensIn || 0) / maxTokens) * 100);
  const outPercent = Math.min(100, ((tokensOut || 0) / maxTokens) * 100);
  elements.tokenBarIn.style.width = `${Math.max(2, inPercent)}%`;
  elements.tokenBarOut.style.width = `${Math.max(2, outPercent)}%`;

  // Cost with bar (scale to $10 max for visual)
  elements.cost.textContent = formatCost(cost || 0);
  const costPercent = Math.min(100, ((cost || 0) / 10) * 100);
  elements.costBar.style.width = `${costPercent}%`;

  // Time & Messages
  elements.time.textContent = formatTime(elapsedSeconds || 0);
  elements.messages.textContent = messageCount || 0;

  // Todos
  if (todos && todos.total > 0) {
    elements.todosSection.classList.remove('hidden');
    elements.todosCount.textContent = `${todos.completed}/${todos.total}`;
    const todoPercent = Math.round((todos.completed / todos.total) * 100);
    elements.todosBar.style.width = `${todoPercent}%`;
  } else {
    elements.todosSection.classList.add('hidden');
  }

  // Activity & Tool
  elements.activityIcon.className = 'activity-icon';
  if (status?.includes('Processing') || status?.includes('Running')) {
    elements.activityIcon.classList.add('processing');
    elements.status.textContent = status;
  } else if (status?.includes('Waiting')) {
    elements.activityIcon.classList.add('waiting');
    elements.status.textContent = 'Waiting for session';
  } else {
    elements.status.textContent = status || 'Ready';
  }

  // Last tool
  if (lastTool && lastTool !== '-') {
    elements.lastToolContainer.classList.remove('hidden');
    elements.lastTool.textContent = lastTool;
  } else {
    elements.lastToolContainer.classList.add('hidden');
  }
}

// Listen for state updates from main process
window.companion.onStateUpdate((state) => {
  updateUI(state);
});

// Initial state
updateUI({
  model: 'waiting...',
  sessionId: '-',
  tokensIn: 0,
  tokensOut: 0,
  cost: 0,
  elapsedSeconds: 0,
  messageCount: 0,
  todos: { completed: 0, total: 0 },
  lastTool: '-',
  status: 'Waiting for session',
});

// Settings panel management
const settingsPanel = document.getElementById('settings-panel');
const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings');
const apiKeyInput = document.getElementById('api-key');
const showApiKeyBtn = document.getElementById('show-api-key');
const saveApiKeyBtn = document.getElementById('save-api-key');
const apiStatus = document.getElementById('api-status');
const quotaIndicator = document.getElementById('quota-indicator');
const quotaStatusText = document.getElementById('quota-status-text');

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.add('visible');
  loadApiKey();
});

closeSettingsBtn.addEventListener('click', () => {
  settingsPanel.classList.remove('visible');
});

showApiKeyBtn.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    showApiKeyBtn.textContent = 'Hide';
  } else {
    apiKeyInput.type = 'password';
    showApiKeyBtn.textContent = 'Show';
  }
});

saveApiKeyBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showApiStatus('Please enter an API key', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-ant')) {
    showApiStatus('Invalid key format. Must be an Anthropic API key (starts with sk-ant)', 'error');
    return;
  }

  saveApiKeyBtn.textContent = 'Saving...';
  saveApiKeyBtn.disabled = true;

  const result = await window.companion.saveApiKey(apiKey);

  if (result.success) {
    showApiStatus('API key saved successfully', 'success');
    quotaIndicator.classList.remove('inactive');
    quotaIndicator.classList.add('active');
    quotaStatusText.textContent = 'Quota tracking enabled';
  } else {
    showApiStatus(result.error || 'Failed to save API key', 'error');
  }

  saveApiKeyBtn.textContent = 'Save';
  saveApiKeyBtn.disabled = false;
});

async function loadApiKey() {
  const hasKey = await window.companion.hasApiKey();
  if (hasKey) {
    apiKeyInput.placeholder = '••••••••••••••••••••••••••';
    quotaIndicator.classList.remove('inactive');
    quotaIndicator.classList.add('active');
    quotaStatusText.textContent = 'Quota tracking enabled';
  } else {
    quotaIndicator.classList.add('inactive');
    quotaStatusText.textContent = 'No API key configured';
  }
}

function showApiStatus(message, type) {
  apiStatus.textContent = message;
  apiStatus.className = `api-status ${type}`;

  setTimeout(() => {
    apiStatus.className = 'api-status';
  }, 5000);
}

// Load initial API key status
loadApiKey();
