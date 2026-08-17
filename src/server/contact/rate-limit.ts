import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { ContactServerConfig } from "../env";

export const CONTACT_RATE_LIMIT_MAX = 3;
export const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export type ContactRateLimitResult = {
  available: boolean;
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export interface ContactRateLimiter {
  limit(identifier: string): Promise<ContactRateLimitResult>;
}

type LocalEntry = { count: number; resetAt: number };

export class InMemoryContactRateLimiter implements ContactRateLimiter {
  private readonly entries = new Map<string, LocalEntry>();

  constructor(private readonly now: () => number = Date.now) {}

  async limit(identifier: string): Promise<ContactRateLimitResult> {
    const currentTime = this.now();
    const existing = this.entries.get(identifier);
    const entry =
      !existing || existing.resetAt <= currentTime
        ? { count: 0, resetAt: currentTime + CONTACT_RATE_LIMIT_WINDOW_MS }
        : existing;

    entry.count += 1;
    this.entries.set(identifier, entry);

    return {
      available: true,
      allowed: entry.count <= CONTACT_RATE_LIMIT_MAX,
      limit: CONTACT_RATE_LIMIT_MAX,
      remaining: Math.max(0, CONTACT_RATE_LIMIT_MAX - entry.count),
      resetAt: entry.resetAt,
    };
  }
}

class UpstashContactRateLimiter implements ContactRateLimiter {
  private readonly limiter: Ratelimit;

  constructor(url: string, token: string) {
    const redis = new Redis({ url, token });
    this.limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(CONTACT_RATE_LIMIT_MAX, "15 m"),
      prefix: "athira:contact:v1",
      analytics: false,
      timeout: 2_000,
    });
  }

  async limit(identifier: string): Promise<ContactRateLimitResult> {
    try {
      const result = await this.limiter.limit(identifier);
      void result.pending.catch(() => undefined);

      if (result.reason === "timeout") {
        return {
          available: false,
          allowed: false,
          limit: CONTACT_RATE_LIMIT_MAX,
          remaining: 0,
          resetAt: Date.now() + CONTACT_RATE_LIMIT_WINDOW_MS,
        };
      }

      return {
        available: true,
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    } catch {
      return {
        available: false,
        allowed: false,
        limit: CONTACT_RATE_LIMIT_MAX,
        remaining: 0,
        resetAt: Date.now() + CONTACT_RATE_LIMIT_WINDOW_MS,
      };
    }
  }
}

export function createContactRateLimiter(
  config: ContactServerConfig,
): ContactRateLimiter {
  if (config.rateLimit.provider === "upstash") {
    return new UpstashContactRateLimiter(
      config.rateLimit.url,
      config.rateLimit.token,
    );
  }

  if (config.mode === "production") {
    throw new Error("Distributed contact rate limiting is unavailable.");
  }

  return new InMemoryContactRateLimiter();
}
