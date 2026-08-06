import { describe, expect, it } from "vitest";
import {
  CONTACT_RATE_LIMIT_WINDOW_MS,
  InMemoryContactRateLimiter,
} from "@/server/contact/rate-limit";

describe("local contact rate limiter", () => {
  it("allows three requests, blocks the fourth, and reports retry timing", async () => {
    let now = 1_000;
    const limiter = new InMemoryContactRateLimiter(() => now);

    expect((await limiter.limit("hashed-client")).allowed).toBe(true);
    expect((await limiter.limit("hashed-client")).allowed).toBe(true);
    expect((await limiter.limit("hashed-client")).remaining).toBe(0);
    const blocked = await limiter.limit("hashed-client");
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetAt).toBe(1_000 + CONTACT_RATE_LIMIT_WINDOW_MS);

    now += CONTACT_RATE_LIMIT_WINDOW_MS;
    expect((await limiter.limit("hashed-client")).allowed).toBe(true);
  });

  it("keeps different hashed identifiers independent", async () => {
    const limiter = new InMemoryContactRateLimiter(() => 1_000);
    await limiter.limit("first");
    await limiter.limit("first");
    await limiter.limit("first");
    expect((await limiter.limit("first")).allowed).toBe(false);
    expect((await limiter.limit("second")).allowed).toBe(true);
  });
});
