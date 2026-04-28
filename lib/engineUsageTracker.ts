/**
 * Engine Usage Tracker — tracks local Gemini API usage for heat bar display.
 *
 * The Gemini API has no "check my quota" endpoint. Rate limits are:
 *   Free tier (approx): 15 RPM, 1500 RPD, 1M TPM
 *   Tier 1 (approx):    500 RPM, 10000 RPD, 4M TPM
 *
 * We track locally per-session and persist daily counts in localStorage.
 */

const STORAGE_KEY = 'apexsys_engine_usage';

interface UsageRecord {
  timestamp: number;
  tokens: number;
}

interface PersistedUsage {
  day: string; // YYYY-MM-DD
  requests: UsageRecord[];
  totalTokens: number;
}

export interface TokenUsageLike {
  totalTokenCount?: number;
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
}

// Conservative free-tier defaults
const DEFAULT_LIMITS = {
  rpm: 15,
  rpd: 1500,
  tpm: 1_000_000,
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const load = (): PersistedUsage => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { day: todayKey(), requests: [], totalTokens: 0 };
    const parsed: PersistedUsage = JSON.parse(raw);
    // Reset if it's a new day
    if (parsed.day !== todayKey()) {
      return { day: todayKey(), requests: [], totalTokens: 0 };
    }
    return parsed;
  } catch {
    return { day: todayKey(), requests: [], totalTokens: 0 };
  }
};

const save = (usage: PersistedUsage) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch { /* quota exceeded — ignore */ }
};

/** Record an API call. Call this after each Gemini request. */
export function recordApiCall(tokensUsed: number = 0) {
  const usage = load();
  const now = Date.now();
  const safeTokens = Number.isFinite(tokensUsed) ? Math.max(0, Math.floor(tokensUsed)) : 0;
  usage.requests.push({ timestamp: now, tokens: safeTokens });
  usage.totalTokens += safeTokens;
  save(usage);
}

export function resolveTokenCount(
  usage?: TokenUsageLike | null,
  fallbackText?: string
): number {
  if (usage && typeof usage.totalTokenCount === 'number' && usage.totalTokenCount > 0) {
    return Math.floor(usage.totalTokenCount);
  }

  const prompt = usage?.promptTokenCount || 0;
  const candidates = usage?.candidatesTokenCount || 0;
  const thoughts = usage?.thoughtsTokenCount || 0;
  const byParts = prompt + candidates + thoughts;
  if (byParts > 0) {
    return Math.floor(byParts);
  }

  if (!fallbackText) return 0;
  // Fallback conservative approximation (~4 chars/token)
  return Math.max(1, Math.ceil(fallbackText.length / 4));
}

export interface EngineUsageSnapshot {
  /** 0-1 ratio of RPM consumed */
  rpmRatio: number;
  /** 0-1 ratio of RPD consumed */
  rpdRatio: number;
  /** 0-1 ratio of TPM consumed */
  tpmRatio: number;
  /** The highest ratio across all dimensions (drives the heat bar) */
  heatLevel: number;
  /** Requests in last minute */
  rpm: number;
  /** Requests today */
  rpd: number;
  /** Tokens in last minute */
  tpm: number;
  /** Known limits */
  limits: typeof DEFAULT_LIMITS;
}

/** Get current usage snapshot */
export function getUsageSnapshot(): EngineUsageSnapshot {
  const usage = load();
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  const recentRequests = usage.requests.filter((r) => r.timestamp >= oneMinuteAgo);
  const rpm = recentRequests.length;
  const tpm = recentRequests.reduce((sum, r) => sum + r.tokens, 0);
  const rpd = usage.requests.length;

  const rpmRatio = Math.min(1, rpm / DEFAULT_LIMITS.rpm);
  const rpdRatio = Math.min(1, rpd / DEFAULT_LIMITS.rpd);
  const tpmRatio = Math.min(1, tpm / DEFAULT_LIMITS.tpm);
  const heatLevel = Math.max(rpmRatio, rpdRatio, tpmRatio);

  return { rpmRatio, rpdRatio, tpmRatio, heatLevel, rpm, rpd, tpm, limits: DEFAULT_LIMITS };
}

/** Clean up old entries (keep only today's). Called on load. */
export function pruneOldEntries() {
  const usage = load();
  if (usage.day !== todayKey()) {
    save({ day: todayKey(), requests: [], totalTokens: 0 });
  }
}

// Auto-prune on import
if (typeof window !== 'undefined') {
  pruneOldEntries();
}
