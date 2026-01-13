/**
 * Usage API client for fetching Claude quota/usage data
 */

const API_BASE = 'https://api.anthropic.com/v1';
const API_VERSION = '2023-06-01';

export function createUsageClient(apiKey) {
  let cachedData = null;
  let lastFetch = 0;
  const CACHE_TTL = 60000; // 1 minute

  async function fetchUsage() {
    const now = Date.now();

    // Return cached data if fresh
    if (cachedData && (now - lastFetch) < CACHE_TTL) {
      return cachedData;
    }

    try {
      // Fetch today's usage (daily bucket)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dailyUrl = `${API_BASE}/organizations/usage_report/messages?` +
        `starting_at=${today.toISOString()}&` +
        `ending_at=${tomorrow.toISOString()}&` +
        `bucket_width=1d`;

      const dailyResponse = await fetch(dailyUrl, {
        headers: {
          'anthropic-version': API_VERSION,
          'x-api-key': apiKey,
        },
      });

      if (!dailyResponse.ok) {
        if (dailyResponse.status === 401) {
          throw new Error('API key unauthorized. Usage tracking requires an Admin API key (sk-ant-admin...)');
        }
        throw new Error(`API error: ${dailyResponse.status}`);
      }

      const dailyData = await dailyResponse.json();

      // Fetch this week's usage (for weekly total)
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

      const weekUrl = `${API_BASE}/organizations/usage_report/messages?` +
        `starting_at=${weekStart.toISOString()}&` +
        `ending_at=${tomorrow.toISOString()}&` +
        `bucket_width=1d`;

      const weeklyResponse = await fetch(weekUrl, {
        headers: {
          'anthropic-version': API_VERSION,
          'x-api-key': apiKey,
        },
      });

      const weeklyData = weeklyResponse.ok ? await weeklyResponse.json() : null;

      // Parse daily usage
      const dailyUsage = parseDailyUsage(dailyData);
      const weeklyUsage = weeklyData ? parseWeeklyUsage(weeklyData) : null;

      // Get rate limit info from headers
      const resetTime = dailyResponse.headers.get('anthropic-ratelimit-tokens-reset');

      cachedData = {
        daily: dailyUsage,
        weekly: weeklyUsage,
        resetTime: resetTime ? new Date(resetTime) : null,
        lastUpdated: now,
      };

      lastFetch = now;
      return cachedData;
    } catch (error) {
      // Silently fail - usage data is optional
      return null;
    }
  }

  function parseDailyUsage(data) {
    if (!data.data || data.data.length === 0) {
      return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    }

    const bucket = data.data[0];
    const inputTokens = (bucket.uncached_input_tokens || 0) +
                        (bucket.cache_read_input_tokens || 0) +
                        (bucket.cache_creation_input_tokens || 0);
    const outputTokens = bucket.output_tokens || 0;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  }

  function parseWeeklyUsage(data) {
    if (!data.data || data.data.length === 0) {
      return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    }

    let totalInput = 0;
    let totalOutput = 0;

    for (const bucket of data.data) {
      totalInput += (bucket.uncached_input_tokens || 0) +
                    (bucket.cache_read_input_tokens || 0) +
                    (bucket.cache_creation_input_tokens || 0);
      totalOutput += bucket.output_tokens || 0;
    }

    return {
      inputTokens: totalInput,
      outputTokens: totalOutput,
      totalTokens: totalInput + totalOutput,
    };
  }

  return {
    fetchUsage,
  };
}
