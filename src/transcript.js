/**
 * Transcript reader for extracting session data from Claude Code transcript files
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PROJECTS_DIR = path.join(CLAUDE_DIR, 'projects');

export function createTranscriptReader() {
  let currentTranscriptPath = null;
  let lastLineCount = 0;

  return {
    setTranscriptPath(transcriptPath) {
      currentTranscriptPath = transcriptPath;
      lastLineCount = 0;
    },

    /**
     * Read transcript and extract session stats
     */
    readStats() {
      if (!currentTranscriptPath || !fs.existsSync(currentTranscriptPath)) {
        return null;
      }

      try {
        const content = fs.readFileSync(currentTranscriptPath, 'utf8');
        const lines = content.trim().split('\n').filter(l => l.trim());

        let model = null;
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let messageCount = 0;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);

            // Extract model from assistant messages
            if (entry.type === 'assistant' && entry.message?.model) {
              model = entry.message.model;
            }

            // Count user messages
            if (entry.type === 'human' || entry.type === 'user') {
              messageCount++;
            }

            // Extract token usage
            if (entry.message?.usage) {
              const usage = entry.message.usage;
              if (usage.input_tokens) totalInputTokens += usage.input_tokens;
              if (usage.output_tokens) totalOutputTokens += usage.output_tokens;
            }

            // Also check for costUSD in summary entries
            if (entry.costUSD !== undefined) {
              // This is a summary entry, could extract cost directly
            }
          } catch (parseErr) {
            // Skip malformed lines
          }
        }

        lastLineCount = lines.length;

        return {
          model: normalizeModelName(model),
          tokensIn: totalInputTokens,
          tokensOut: totalOutputTokens,
          messageCount,
        };
      } catch (err) {
        return null;
      }
    },

    /**
     * Find the most recent transcript file
     */
    findLatestTranscript() {
      if (!fs.existsSync(PROJECTS_DIR)) {
        return null;
      }

      let latestFile = null;
      let latestTime = 0;

      const projectDirs = fs.readdirSync(PROJECTS_DIR);
      for (const dir of projectDirs) {
        const projectPath = path.join(PROJECTS_DIR, dir);
        if (!fs.statSync(projectPath).isDirectory()) continue;

        const files = fs.readdirSync(projectPath);
        for (const file of files) {
          if (!file.endsWith('.jsonl')) continue;

          const filePath = path.join(projectPath, file);
          const stat = fs.statSync(filePath);
          if (stat.mtimeMs > latestTime) {
            latestTime = stat.mtimeMs;
            latestFile = filePath;
          }
        }
      }

      return latestFile;
    },
  };
}

function normalizeModelName(model) {
  if (!model) return null;

  // Convert full model IDs to friendly names
  if (model.includes('opus-4-5') || model.includes('opus-4.5')) return 'opus-4.5';
  if (model.includes('opus-4') || model.includes('opus')) return 'opus-4';
  if (model.includes('sonnet-4')) return 'sonnet-4';
  if (model.includes('sonnet-3-5') || model.includes('sonnet-3.5')) return 'sonnet-3.5';
  if (model.includes('haiku')) return 'haiku-3.5';

  // Return shortened version
  return model.replace('claude-', '').replace('-20251101', '').replace('-20250514', '');
}
