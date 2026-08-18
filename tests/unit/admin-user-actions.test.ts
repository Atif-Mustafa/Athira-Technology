import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminRoleMock,
  createAdminClientMock,
  createServerClientMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  requireAdminRoleMock: vi.fn(),
  createAdminClientMock: vi.fn(),
  createServerClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/server/auth/guards", () => ({ requireAdminRole: requireAdminRoleMock }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClientForAdmin: createAdminClientMock,
  SupabaseAdminConfigurationError: class SupabaseAdminConfigurationError extends Error {},
}));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: createServerClientMock }));

import { changeUserRoleAction, inviteUserAction, setUserStatusAction } from "@/app/admin/users/actions";

const admin = {
  configurationAvailable: true as const,
  user: { id: "11111111-1111-4111-8111-111111111111", email: "admin@example.com" },
  profile: { display_name: "Ada", status: "active" as const },
  role: "admin" as const,
  issue: null,
};

function form(values: Record<string, string>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}

describe("admin user-management server actions", () => {
  beforeEach(() => {
    requireAdminRoleMock.mockResolvedValue(admin);
    createAdminClientMock.mockReset();
    createServerClientMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rejects malformed invitations before reaching the privileged client", async () => {
    await expect(inviteUserAction({ kind: "idle" }, form({ email: "not-an-email", role: "admin" }))).resolves.toEqual({
      kind: "error",
      message: "Enter a valid email, display name, and supported role.",
    });
    expect(createAdminClientMock).not.toHaveBeenCalled();
  });

  it("rejects self-demotion and self-disable before calling mutation RPCs", async () => {
    await expect(changeUserRoleAction({ kind: "idle" }, form({ userId: admin.user.id, role: "viewer" }))).resolves.toEqual({
      kind: "error",
      message: "You cannot demote yourself.",
    });
    await expect(setUserStatusAction({ kind: "idle" }, form({ userId: admin.user.id, status: "disabled" }))).resolves.toEqual({
      kind: "error",
      message: "You cannot disable your own access.",
    });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("maps duplicate invitation errors to a safe message", async () => {
    createAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          inviteUserByEmail: vi.fn().mockResolvedValue({ error: { status: 422, message: "provider detail: already registered" } }),
        },
      },
    });

    await expect(inviteUserAction({ kind: "idle" }, form({ email: "ada@example.com", role: "viewer" }))).resolves.toEqual({
      kind: "error",
      message: "That email already has an account or pending invitation.",
    });
  });
});
