import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoBlockingViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([]);
}

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

    await expectNoBlockingViolations(page);
  });
}

test("open desktop agent navigation has no serious or critical axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/agents/testing");
  await page.getByRole("button", { name: "SDLC Agents" }).click();
  await expect(page.locator("#desktop-agents-navigation")).toBeVisible();
  await expectNoBlockingViolations(page);
});

test("open mobile agent navigation has no serious or critical axe violations", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/agents/testing");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const mobileNavigation = page.locator("#mobile-navigation");
  await mobileNavigation.getByRole("button", { name: "SDLC Agents" }).click();
  await expect(page.locator("#mobile-agents-navigation")).toBeVisible();
  await expectNoBlockingViolations(page);
});

test("contact client-validation state has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "The enquiry was not sent" }),
  ).toBeVisible();
  await expectNoBlockingViolations(page);
});

test("contact submitting state has no serious or critical axe violations", async ({ page }) => {
  let releaseRequest!: () => void;
  await page.route("**/api/contact", async (route) => {
    await new Promise<void>((resolve) => { releaseRequest = resolve; });
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, requestId: "contact_axe", message: "Delivered." }),
    });
  });
  await page.goto("/contact");
  await fillAccessibleContactForm(page);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.getByRole("button", { name: /Sending enquiry/ })).toBeDisabled();
  await expectNoBlockingViolations(page);
  releaseRequest();
  await expect(page.getByText("Enquiry delivered")).toBeVisible();
});

for (const state of ["success", "failure"] as const) {
  test(`contact ${state} state has no serious or critical axe violations`, async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: state === "success" ? 202 : 503,
        contentType: "application/json",
        body: JSON.stringify(
          state === "success"
            ? { ok: true, requestId: "contact_axe_success", message: "Delivered." }
            : {
                ok: false,
                requestId: "contact_axe_failure",
                code: "service_unavailable",
                message: "Contact delivery is temporarily unavailable.",
              },
        ),
      });
    });
    await page.goto("/contact");
    await fillAccessibleContactForm(page);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const stateMessage =
      state === "success"
        ? page.getByRole("status")
        : page.getByRole("alert").filter({ hasText: "The enquiry was not sent" });
    await expect(stateMessage).toBeVisible();
    await expectNoBlockingViolations(page);
  });
}

async function fillAccessibleContactForm(page: Page) {
  await page.getByLabel("Product or service interest").selectOption("ai-software-engineer");
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Work email").fill("ada@example.com");
  await page.getByLabel("Company name").fill("Analytical Engines Ltd");
  await page
    .getByLabel("What problem are you trying to solve?")
    .fill("We are evaluating a governed planning and testing workflow.");
  await page.getByRole("checkbox", { name: /I have read/ }).check();
}
