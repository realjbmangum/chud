/**
 * Terminal display renderer using ANSI escape codes
 */

// ANSI escape codes
const ESC = '\x1b';
const CLEAR = `${ESC}[2J`;
const HOME = `${ESC}[H`;
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;

// Colors
const RESET = `${ESC}[0m`;
const BOLD = `${ESC}[1m`;
const DIM = `${ESC}[2m`;
const CYAN = `${ESC}[36m`;
const GREEN = `${ESC}[32m`;
const YELLOW = `${ESC}[33m`;
const WHITE = `${ESC}[37m`;
const GRAY = `${ESC}[90m`;

// Box drawing characters
const BOX = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
};

const WIDTH = 30;

function formatNumber(num) {
  return num.toLocaleString();
}

function formatCost(cost) {
  return `$${cost.toFixed(2)}`;
}

function truncateSessionId(id) {
  if (id.length <= 8) return id;
  return id.slice(0, 8) + '...';
}

function renderProgressBar(completed, total, width = 14) {
  if (total === 0) return GRAY + '░'.repeat(width) + RESET;
  const filled = Math.round((completed / total) * width);
  const empty = width - filled;
  return GREEN + '▓'.repeat(filled) + GRAY + '░'.repeat(empty) + RESET;
}

function pad(str, len = WIDTH - 4) {
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, ''); // Remove ANSI codes for length calc
  const padding = Math.max(0, len - stripped.length);
  return str + ' '.repeat(padding);
}

function line(content) {
  return `${BOX.vertical} ${pad(content)} ${BOX.vertical}`;
}

function separator() {
  return `${BOX.vertical} ${DIM}${'─'.repeat(WIDTH - 4)}${RESET} ${BOX.vertical}`;
}

function emptyLine() {
  return `${BOX.vertical} ${' '.repeat(WIDTH - 4)} ${BOX.vertical}`;
}

export function createDisplay() {
  // Hide cursor on start
  process.stdout.write(HIDE_CURSOR);

  return {
    render(state) {
      const {
        model,
        sessionId,
        tokensIn,
        tokensOut,
        cost,
        elapsedFormatted,
        messageCount,
        todos,
        lastTool,
        status
      } = state;

      const todoPercent = todos.total > 0
        ? Math.round((todos.completed / todos.total) * 100)
        : 0;

      const lines = [
        `${BOX.topLeft}${BOX.horizontal} ${BOLD}${CYAN}Claude Companion${RESET} ${BOX.horizontal.repeat(WIDTH - 20)}${BOX.topRight}`,
        emptyLine(),
        line(`${DIM}MODEL${RESET}    ${BOLD}${WHITE}${model}${RESET}`),
        line(`${DIM}SESSION${RESET}  ${GRAY}${truncateSessionId(sessionId)}${RESET}`),
        emptyLine(),
        separator(),
        emptyLine(),
        line(`${DIM}TOKENS${RESET}   ${CYAN}${formatNumber(tokensIn)}${RESET} in`),
        line(`         ${CYAN}${formatNumber(tokensOut)}${RESET} out`),
        emptyLine(),
        line(`${DIM}COST${RESET}     ${YELLOW}${formatCost(cost)}${RESET}`),
        emptyLine(),
        line(`${DIM}TIME${RESET}     ${WHITE}${elapsedFormatted}${RESET}`),
        line(`${DIM}MESSAGES${RESET} ${WHITE}${messageCount}${RESET} exchanges`),
        emptyLine(),
        separator(),
        emptyLine(),
        todos.total > 0
          ? line(`${DIM}TODOS${RESET}    ${GREEN}${todos.completed}${RESET}/${todos.total} complete`)
          : line(`${DIM}TODOS${RESET}    ${GRAY}none${RESET}`),
        todos.total > 0
          ? line(`${renderProgressBar(todos.completed, todos.total)} ${todoPercent}%`)
          : emptyLine(),
        emptyLine(),
        separator(),
        emptyLine(),
        line(`${DIM}LAST TOOL${RESET}  ${WHITE}${lastTool || '-'}${RESET}`),
        line(`${DIM}STATUS${RESET}     ${status === 'Ready' ? GREEN : YELLOW}${status}${RESET}`),
        emptyLine(),
        `${BOX.bottomLeft}${BOX.horizontal.repeat(WIDTH - 2)}${BOX.bottomRight}`,
      ];

      process.stdout.write(HOME + CLEAR);
      process.stdout.write(lines.join('\n') + '\n');
    },

    clear() {
      process.stdout.write(SHOW_CURSOR + CLEAR + HOME);
    },
  };
}
