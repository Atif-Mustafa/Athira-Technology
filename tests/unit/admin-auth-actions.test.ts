import { describe, expect, it, vi } from "vitest";

const { redirectMock, getSupabaseServerConfigMock, createSupabaseServerClientMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getSupabaseServerConfigMock: vi.fn(),
  createSupabaseServerClientMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/server/env", () => ({
  getSupabaseServerConfig: getSupabaseServerConfigMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: createSupabaseServerClientMock,
}));

import { signInAction, signOutAction } from "@/app/admin/actions";

function form(values: Record<string, string>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}

describe("admin authentication server actions", () => {
  it("fails safely when Supabase configuration is absent", async () => {
    getSupabaseServerConfigMock.mockReturnValue({ success: false, issues: ["missing"] });

    await expect(signInAction({ kind: "idle" }, form({ email: "ada@example.com", password: "secret" }))).resolves.toEqual({
      kind: "configuration",
      message: "Admin authentication is not configured for this environment.",
    });
    expect(createSupabaseServerClientMock).not.toHaveBeenCalled();
  });

  it("returns a generic login failure without exposing provider details", async () => {
    getSupabaseServerConfigMock.mockReturnValue({ success: true, config: { url: "https://example.supabase.co", publishableKey: "public" } });
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: new Error("provider detail") }) },
    });

    await expect(signInAction({ kind: "idle" }, form({ email: "ada@example.com", password: "wrong" }))).resolves.toEqual({
      kind: "invalid",
      message: "The email or password could not be verified.",
    });
  });

  it("redirects successful login only to an internal admin path", async () => {
    getSupabaseServerConfigMock.mockReturnValue({ success: true, config: { url: "https://example.supabase.co", publishableKey: "public" } });
    createSupabaseServerClientMock.mockResolvedValue({
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }) },
    });

    await signInAction({ kind: "idle" }, form({ email: "ada@example.com", password: "correct", next: "https://evil.example" }));

    expect(redirectMock).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("calls Supabase signOut and returns to the login boundary", async () => {
    getSupabaseServerConfigMock.mockReturnValue({ success: true, config: { url: "https://example.supabase.co", publishableKey: "public" } });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    createSupabaseServerClientMock.mockResolvedValue({ auth: { signOut } });

    await signOutAction();

    expect(signOut).toHaveBeenCalledOnce();
    expect(redirectMock).toHaveBeenCalledWith("/admin/login?logged_out=1");
  });
});
