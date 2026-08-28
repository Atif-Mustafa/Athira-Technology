import { describe, expect, it } from "vitest";
import { canManageEnquiries } from "@/server/enquiries/guards";
import {
  enquiryNoteSchema,
  enquiryPrioritySchema,
  enquiryStatusSchema,
  parseEnquiryListParams,
} from "@/server/enquiries/schema";

function context(role: "admin" | "editor" | "viewer") {
  return { role } as Parameters<typeof canManageEnquiries>[0];
}

describe("admin enquiry workflow validation", () => {
  it("enforces the role permission matrix", () => {
    expect(canManageEnquiries(context("admin"))).toBe(true);
    expect(canManageEnquiries(context("editor"))).toBe(true);
    expect(canManageEnquiries(context("viewer"))).toBe(false);
  });

  it("accepts only the bounded status and priority lifecycle values", () => {
    expect(enquiryStatusSchema.safeParse("in_progress").success).toBe(true);
    expect(enquiryStatusSchema.safeParse("deleted").success).toBe(false);
    expect(enquiryPrioritySchema.safeParse("high").success).toBe(true);
    expect(enquiryPrioritySchema.safeParse("urgent").success).toBe(false);
  });

  it("bounds internal notes and search input", () => {
    expect(enquiryNoteSchema.safeParse("Internal follow-up").success).toBe(true);
    expect(enquiryNoteSchema.safeParse(" ").success).toBe(false);
    expect(enquiryNoteSchema.safeParse("x".repeat(4001)).success).toBe(false);
    expect(parseEnquiryListParams({ q: "x".repeat(101) }).query).toHaveLength(100);
  });

  it("normalizes pagination and rejects malformed filters", () => {
    expect(parseEnquiryListParams({ page: "2", q: "  ada  " })).toMatchObject({
      page: 2,
      query: "ada",
      sort: "newest",
    });
    expect(parseEnquiryListParams({ page: "0" }).page).toBe(1);
    expect(parseEnquiryListParams({ status: "archived" }).status).toBe("all");
  });
});
