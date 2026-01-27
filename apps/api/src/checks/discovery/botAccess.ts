import { Check, CheckStatus, CHECKS, CRITICAL_AI_BOTS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:botAccess');

export interface BotStatus {
  allowed: boolean;
  explicit: boolean; // Was there an explicit rule?
}

export interface BotAccessResult {
  check: Check;
  rawRobotsTxt: string | null;
  botStatuses: Record<string, BotStatus>;
}

// Fetch and parse robots.txt
async function fetchRobotsTxt(domain: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${domain}/robots.txt`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AgentPulseBot/1.0' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      log.debug({ domain, status: response.status }, 'robots.txt not found');
      return null;
    }

    return await response.text();
  } catch (error) {
    log.debug({ domain, error }, 'Failed to fetch robots.txt');
    return null;
  }
}

// Check if a specific bot is allowed
function isBotAllowed(robotsTxt: string, botName: string): BotStatus {
  const lines = robotsTxt.toLowerCase().split('\n');
  const botNameLower = botName.toLowerCase();

  let inBotSection = false;
  let inWildcardSection = false;
  let explicitRule = false;
  let allowed = true; // Default: allowed if no explicit block

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Skip comments and empty lines
    if (!line || line.startsWith('#')) continue;

    // Check for user-agent declarations
    if (line.startsWith('user-agent:')) {
      const agent = line.substring(11).trim();

      // Check if this section applies to our bot
      if (agent === botNameLower || agent === botName.toLowerCase()) {
        inBotSection = true;
        inWildcardSection = false;
      } else if (agent === '*') {
        inWildcardSection = true;
        inBotSection = false;
      } else {
        inBotSection = false;
        inWildcardSection = false;
      }
      continue;
    }

    // Process rules in applicable sections
    if (inBotSection || inWildcardSection) {
      if (line.startsWith('disallow:')) {
        const path = line.substring(9).trim();
        if (path === '/' || path === '') {
          if (inBotSection) {
            allowed = false;
            explicitRule = true;
          } else if (inWildcardSection && !explicitRule) {
            allowed = false;
          }
        }
      } else if (line.startsWith('allow:')) {
        const path = line.substring(6).trim();
        if (path === '/' || path === '') {
          if (inBotSection) {
            allowed = true;
            explicitRule = true;
          } else if (inWildcardSection && !explicitRule) {
            allowed = true;
          }
        }
      }
    }
  }

  return { allowed, explicit: explicitRule };
}

export async function checkBotAccess(domain: string): Promise<BotAccessResult> {
  const { id, name, category, maxScore } = CHECKS.D1;

  log.info({ domain }, 'Checking AI bot access');

  const robotsTxt = await fetchRobotsTxt(domain);
  const botStatuses: Record<string, BotStatus> = {};

  // Check each critical bot
  for (const bot of CRITICAL_AI_BOTS) {
    if (robotsTxt) {
      botStatuses[bot] = isBotAllowed(robotsTxt, bot);
    } else {
      // No robots.txt = all bots allowed
      botStatuses[bot] = { allowed: true, explicit: false };
    }
  }

  // Calculate score based on allowed bots
  const allowedCount = Object.values(botStatuses).filter(s => s.allowed).length;
  const totalBots = CRITICAL_AI_BOTS.length;
  const blockedBots = CRITICAL_AI_BOTS.filter((b: string) => !botStatuses[b]?.allowed);

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (allowedCount === totalBots) {
    status = 'pass';
    score = maxScore;
    details = robotsTxt
      ? `All ${totalBots} AI bots allowed`
      : 'No robots.txt found — all bots allowed by default';
  } else if (allowedCount >= totalBots * 0.7) {
    status = 'partial';
    score = Math.round(maxScore * 0.7);
    details = `${allowedCount}/${totalBots} bots allowed. Blocked: ${blockedBots.slice(0, 3).join(', ')}`;
  } else if (allowedCount > 0) {
    status = 'partial';
    score = Math.round(maxScore * 0.4);
    details = `Only ${allowedCount}/${totalBots} bots allowed. Major blocks: ${blockedBots.slice(0, 3).join(', ')}`;
  } else {
    status = 'fail';
    score = 0;
    details = 'All AI shopping bots are blocked in robots.txt';
  }

  log.info({ domain, allowedCount, totalBots, score }, 'Bot access check complete');

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score,
      maxScore,
      details,
      data: {
        robotsTxtFound: !!robotsTxt,
        allowedCount,
        totalBots,
        blockedBots,
        botStatuses,
      },
    },
    rawRobotsTxt: robotsTxt,
    botStatuses,
  };
}
