import { describe, expect, it } from "vitest";
import type { ContactServerConfig } from "@/server/env";
import {
  escapeHtml,
  mapResendErrorStatus,
  renderContactEmail,
} from "@/server/contact/email";

const config: ContactServerConfig = {
  mode: "test",
  siteOrigin: "http://localhost:3000",
  allowedOrigins: ["http://localhost:3000"],
  trustVercelHeaders: false,
  email: {
    apiKey: "re_test_key_long_enough",
    fromEmail: "contact@athira.test",
    toEmail: "recipient@athira.test",
  },
  rateLimit: { provider: "memory", hashSecret: "test-secret" },
};

describe("contact email rendering", () => {
  it("escapes every user-controlled HTML field while keeping plain text readable", () => {
    const message = renderContactEmail(
      {
        fullName: "Ada <script>alert(1)</script>",
        workEmail: "ada@example.com",
        companyName: "A & B",
        interest: "ai-software-engineer",
        projectStage: undefined,
        budgetRange: undefined,
        message: "Review <b>this</b> & reply.\nSecond line.",
        consent: true,
        website: "",
      },
      config,
      "contact_test_request",
      "2026-08-06T00:00:00.000Z",
    );

    expect(message.to).toBe("recipient@athira.test");
    expect(message.from).toBe("contact@athira.test");
    expect(message.replyTo).toBe("ada@example.com");
    expect(message.html).not.toContain("<script>");
    expect(message.html).not.toContain("<b>this</b>");
    expect(message.html).toContain("&lt;script&gt;");
    expect(message.html).toContain("A &amp; B");
    expect(message.text).toContain("Review <b>this</b> & reply.");
    expect(message.text).toContain("contact_test_request");
  });

  it("escapes quotes and apostrophes", () => {
    expect(escapeHtml(`\"quoted\" & 'single'`)).toBe(
      "&quot;quoted&quot; &amp; &#039;single&#039;",
    );
  });

  it("maps provider client errors separately from provider outages", () => {
    expect(mapResendErrorStatus(422)).toBe("rejected");
    expect(mapResendErrorStatus(503)).toBe("unavailable");
    expect(mapResendErrorStatus(null)).toBe("unavailable");
  });
});
