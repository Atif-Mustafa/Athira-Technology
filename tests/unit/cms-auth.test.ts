import { describe, expect, it } from "vitest";
import { canEditContent, type ContentViewerContext } from "@/server/cms/guards";

function context(role: "admin" | "editor" | "viewer", status: "active" | "disabled" = "active") {
  return {
    configurationAvailable: true,
    user: { id: "11111111-1111-4111-8111-111111111111" },
    profile: { display_name: role, status },
    role,
    issue: status === "active" ? null : "disabled",
  } as unknown as ContentViewerContext;
}

describe("CMS authorization matrix", () => {
  it("allows active admins and editors to mutate", () => {
    expect(canEditContent(context("admin"))).toBe(true);
    expect(canEditContent(context("editor"))).toBe(true);
  });

  it("keeps active viewers read-only", () => {
    expect(canEditContent(context("viewer"))).toBe(false);
  });

  it("never treats disabled roles as an editable context", () => {
    for (const role of ["admin", "editor", "viewer"] as const) {
      const disabled = context(role, "disabled");
      expect(disabled.profile.status).toBe("disabled");
      expect(disabled.issue).toBe("disabled");
    }
  });
});
