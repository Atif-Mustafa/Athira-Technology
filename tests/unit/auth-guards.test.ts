import { describe, expect, it } from "vitest";
import { decideAdminAccess, type AuthContext } from "@/server/auth/guards";

const baseContext: AuthContext = {
  configurationAvailable: true,
  user: { id: "user-1" } as AuthContext["user"],
  profile: { display_name: "Ada", status: "active" },
  role: "viewer",
  issue: null,
};

describe("admin access decisions", () => {
  it.each([
    ["configuration unavailable", { ...baseContext, configurationAvailable: false, user: null, role: null, issue: "configuration" }, "configuration"],
    ["anonymous", { ...baseContext, user: null, role: null, issue: "unauthenticated" }, "unauthenticated"],
    ["no role", { ...baseContext, role: null }, "forbidden"],
    ["invalid role lookup", { ...baseContext, role: null, issue: "role_lookup_failed" }, "forbidden"],
    ["disabled profile", { ...baseContext, role: null, issue: "disabled" }, "forbidden"],
  ] as const)("fails closed for %s", (_label, context, expected) => {
    expect(decideAdminAccess(context, ["admin", "editor", "viewer"])).toBe(expected);
  });

  it("allows admin, editor, and viewer dashboard access", () => {
    expect(decideAdminAccess({ ...baseContext, role: "admin" }, ["admin", "editor", "viewer"])).toBe("allowed");
    expect(decideAdminAccess({ ...baseContext, role: "editor" }, ["admin", "editor", "viewer"])).toBe("allowed");
    expect(decideAdminAccess(baseContext, ["admin", "editor", "viewer"])).toBe("allowed");
  });

  it("does not allow lower roles through an admin-only boundary", () => {
    expect(decideAdminAccess(baseContext, ["admin"])).toBe("forbidden");
    expect(decideAdminAccess({ ...baseContext, role: "editor" }, ["admin"])).toBe("forbidden");
  });
});
