import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact/schema";

const validContact = {
  fullName: "  Ada Lovelace  ",
  workEmail: "  ADA@EXAMPLE.COM  ",
  companyName: "  Analytical Engines Ltd  ",
  interest: "ai-software-engineer",
  projectStage: "defining-pilot",
  budgetRange: "prototype-implementation",
  message: "  We are evaluating a governed planning and testing workflow.  ",
  consent: true,
  website: "",
} as const;

describe("contact schema", () => {
  it("normalizes whitespace and email casing", () => {
    const result = contactSchema.parse(validContact);

    expect(result).toMatchObject({
      fullName: "Ada Lovelace",
      workEmail: "ada@example.com",
      companyName: "Analytical Engines Ltd",
      message: "We are evaluating a governed planning and testing workflow.",
    });
  });

  it("accepts omitted optional stage, budget, and honeypot values", () => {
    const { projectStage, budgetRange, website, ...required } = validContact;
    void projectStage;
    void budgetRange;
    void website;

    const result = contactSchema.parse(required);

    expect(result.website).toBe("");
    expect(result).not.toHaveProperty("projectStage");
    expect(result).not.toHaveProperty("budgetRange");
  });

  it("rejects malformed email and missing consent", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      workEmail: "not-an-email",
      consent: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.workEmail).toBeDefined();
      expect(result.error.flatten().fieldErrors.consent).toBeDefined();
    }
  });

  it("enforces maximum lengths", () => {
    const result = contactSchema.safeParse({
      ...validContact,
      fullName: "a".repeat(101),
      companyName: "b".repeat(121),
      message: "c".repeat(3001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.error.flatten().fieldErrors)).toEqual(
        expect.arrayContaining(["fullName", "companyName", "message"]),
      );
    }
  });

  it("rejects unknown fields and retains a completed honeypot for neutral handling", () => {
    expect(
      contactSchema.safeParse({ ...validContact, unexpected: "value" }).success,
    ).toBe(false);
    expect(contactSchema.parse({ ...validContact, website: "spam.example" }).website).toBe(
      "spam.example",
    );
  });
});
