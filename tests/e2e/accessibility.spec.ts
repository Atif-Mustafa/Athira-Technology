import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const accessibilityRoutes = [
  { name: "homepage", path: "/" },
  { name: "AI Software Engineer", path: "/ai-software-engineer" },
  { name: "services", path: "/services" },
  { name: "pricing", path: "/pricing" },
  { name: "blog listing", path: "/blog" },
  { name: "blog article", path: "/blog/human-approval-in-ai-assisted-development" },
  { name: "contact demonstration", path: "/contact" },
  { name: "testing agent", path: "/agents/testing" },
  { name: "privacy draft", path: "/privacy" },
  { name: "admin dashboard demonstration", path: "/admin/dashboard" },
] as const;

for (const route of accessibilityRoutes) {
  test(`${route.name} has no serious or critical axe violations`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
  });
}
