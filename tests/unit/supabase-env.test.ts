import { describe, expect, it } from "vitest";
import { validateSupabasePublicEnvironment } from "@/server/env";

describe("Supabase environment validation", () => {
  it("accepts a valid local configuration", () => {
    expect(
      validateSupabasePublicEnvironment({
        NODE_ENV: "development",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      }),
    ).toEqual({
      success: true,
      config: {
        url: "http://localhost:54321",
        publishableKey: "sb_publishable_example",
      },
    });
  });

  it("reports missing public configuration without exposing values", () => {
    const result = validateSupabasePublicEnvironment({ NODE_ENV: "production" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toEqual([
        "NEXT_PUBLIC_SUPABASE_URL is required for Supabase authentication.",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for Supabase authentication.",
      ]);
      expect(result.issues.join(" ")).not.toContain("secret");
    }
  });

  it("rejects malformed or insecure production URLs", () => {
    const result = validateSupabasePublicEnvironment({
      NODE_ENV: "production",
      NEXT_PUBLIC_SUPABASE_URL: "http://supabase.example.test/project",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toContain("NEXT_PUBLIC_SUPABASE_URL must use HTTPS outside local development.");
      expect(result.issues).toContain(
        "NEXT_PUBLIC_SUPABASE_URL must be a Supabase project origin without credentials or a path.",
      );
    }
  });
});
