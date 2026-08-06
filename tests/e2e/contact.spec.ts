import { expect, test, type Page } from "@playwright/test";

const validMessage = "We are evaluating a governed planning and testing workflow.";

async function fillValidContactForm(page: Page) {
  await page.getByLabel("Product or service interest").selectOption("ai-software-engineer");
  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Work email").fill("ada@example.com");
  await page.getByLabel("Company name").fill("Analytical Engines Ltd");
  await page.getByLabel("What problem are you trying to solve?").fill(validMessage);
  await page.getByRole("checkbox", { name: /I have read/ }).check();
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ),
    )
    .toBe(true);
}

test("contact page renders a usable, non-consenting-by-default form", async ({ page }) => {
  const response = await page.goto("/contact");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tell us which workflow or engineering problem you are evaluating",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Send enquiry" })).toBeEnabled();
  await expect(page.getByRole("checkbox", { name: /I have read/ })).not.toBeChecked();
  await expect(page.getByRole("link", { name: "draft privacy notice" })).toHaveAttribute("href", "/privacy");
});

test("invalid client submission is focused and never reaches the API", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/contact", async (route) => {
    requests += 1;
    await route.abort();
  });
  await page.goto("/contact");

  await page.getByRole("button", { name: "Send enquiry" }).click();

  const alert = page.getByRole("alert").filter({ hasText: "The enquiry was not sent" });
  await expect(alert).toBeFocused();
  await expect(alert).toContainText("Check the highlighted fields");
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  expect(requests).toBe(0);
});

test("confirmed provider acceptance displays success and clears the form", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        requestId: "contact_e2e_success",
        message: "Your enquiry was delivered to Athira Technology.",
      }),
    });
  });
  await page.goto("/contact");
  await fillValidContactForm(page);

  await page.getByRole("button", { name: "Send enquiry" }).click();

  const status = page.getByRole("status");
  await expect(status).toBeFocused();
  await expect(status).toContainText("Enquiry delivered");
  await expect(status).toContainText("contact_e2e_success");
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page.getByRole("checkbox", { name: /I have read/ })).not.toBeChecked();
});

test("server validation errors remain associated and preserve entries", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        requestId: "contact_e2e_validation",
        code: "validation_error",
        message: "Check the highlighted fields and try again.",
        fieldErrors: { workEmail: ["Enter a valid work email address."] },
      }),
    });
  });
  await page.goto("/contact");
  await fillValidContactForm(page);

  await page.getByRole("button", { name: "Send enquiry" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "The enquiry was not sent" }),
  ).toBeFocused();
  await expect(page.locator("#workEmail-error")).toHaveText("Enter a valid work email address.");
  await expect(page.getByLabel("Work email")).toHaveAttribute("aria-describedby", /workEmail-error/);
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
});

for (const scenario of [
  {
    name: "rate-limit",
    status: 429,
    code: "rate_limited",
    message: "Too many enquiries were submitted. Please wait before trying again.",
  },
  {
    name: "backend-unavailable",
    status: 503,
    code: "service_unavailable",
    message: "Contact delivery is temporarily unavailable. Please try again later.",
  },
]) {
test(`${scenario.name} response is safe, focused, and preserves the form`, async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: scenario.status,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        requestId: `contact_e2e_${scenario.status}`,
        code: scenario.code,
        message: scenario.message,
      }),
    });
  });
  await page.goto("/contact");
  await fillValidContactForm(page);

  await page.getByRole("button", { name: "Send enquiry" }).click();

  const alert = page.getByRole("alert").filter({ hasText: "The enquiry was not sent" });
  await expect(alert).toBeFocused();
  await expect(alert).toContainText(scenario.message);
  await expect(alert).toContainText(`contact_e2e_${scenario.status}`);
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
});
}

test("contact form remains keyboard-operable without mobile overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await expectNoHorizontalOverflow(page);

  await page.getByLabel("Product or service interest").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Full name")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Work email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Company name")).toBeFocused();
  await expectNoHorizontalOverflow(page);
});
