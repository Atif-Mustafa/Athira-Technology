import { describe, expect, it } from "vitest";
import {
  getHighestAppRole,
  parseAppRole,
  roleCanAccessDashboard,
} from "@/server/auth/roles";

describe("application roles", () => {
  it("parses only the minimal supported role set", () => {
    expect(parseAppRole("admin")).toBe("admin");
    expect(parseAppRole("editor")).toBe("editor");
    expect(parseAppRole("viewer")).toBe("viewer");
    expect(parseAppRole("owner")).toBeNull();
    expect(parseAppRole(null)).toBeNull();
  });

  it("selects the highest valid role when a user has multiple rows", () => {
    expect(getHighestAppRole(["viewer", "editor"])).toBe("editor");
    expect(getHighestAppRole(["viewer", "admin", "invalid"])).toBe("admin");
    expect(getHighestAppRole(["invalid"])).toBeNull();
  });

  it("allows every valid role to read the baseline dashboard", () => {
    expect(roleCanAccessDashboard("admin")).toBe(true);
    expect(roleCanAccessDashboard("editor")).toBe(true);
    expect(roleCanAccessDashboard("viewer")).toBe(true);
    expect(roleCanAccessDashboard(null)).toBe(false);
  });
});
