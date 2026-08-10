import { expect, test, type Page } from "@playwright/test";
import { agentsData } from "../../src/content/agents";

const blogArticlePaths = [
  "/blog/multi-agent-systems-for-the-sdlc",
  "/blog/human-approval-in-ai-assisted-development",
  "/blog/traceable-ai-engineering-workflows",
] as const;

const publicHtmlRoutes = [
  "/",
  "/ai-software-engineer",
  "/agents",
  "/agents/planning",
  "/agents/design",
  "/agents/development",
  "/agents/testing",
  "/agents/deployment",
  "/agents/monitoring",
  "/agents/documentation",
  "/services",
  "/pricing",
  "/blog",
  ...blogArticlePaths,
  "/contact",
  "/privacy",
  "/terms",
] as const;

const primaryLinks = [
  { name: "Product", href: "/ai-software-engineer" },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
] as const;

const agentNavigationLinks = agentsData.map((agent) => ({
  href: `/agents/${agent.slug}`,
  name: agent.name.replace(/ Agent$/, ""),
}));

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(hasOverflow).toBe(false);
}

for (const path of publicHtmlRoutes) {
  test(`${path} renders as a complete public page`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    await expect(page.locator("main")).not.toContainText("Internal Server Error");
    await expect(page.locator("main a.inline-flex, main button").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    for (const link of primaryLinks) {
      await expect(page.getByRole("link", { name: link.name, exact: true }).first()).toHaveAttribute("href", link.href);
    }
    await expect(page.getByRole("button", { name: "SDLC Agents" })).toHaveAttribute(
      "aria-controls",
      "desktop-agents-navigation",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });
}

test("the product hero explains coordination while the homepage keeps the seven-agent workflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ai-software-engineer");

  const productHero = page.locator("main > header");
  const coordinationDiagram = productHero.getByTestId("coordination-diagram");
  await expect(coordinationDiagram).toBeVisible();

  for (const label of [
    "Approved requirement",
    "AI Software Engineer",
    "Plan & Design",
    "Build & Test",
    "Release & Operate",
    "Knowledge",
    "Human review gate",
    "Approved engineering artifacts",
  ]) {
    await expect(coordinationDiagram.getByText(label, { exact: true })).toBeVisible();
  }

  for (const agent of agentsData) {
    await expect(
      productHero.getByRole("link", { name: new RegExp(agent.name) }),
    ).toHaveCount(0);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);

  await page.goto("/");
  const homepageHero = page.locator("main > header");
  await expect(homepageHero.getByText("Illustrative workflow")).toBeVisible();
  for (const agent of agentsData) {
    await expect(
      homepageHero.getByRole("link", { name: new RegExp(agent.name) }),
    ).toBeVisible();
  }
});

test("desktop SDLC Agents disclosure supports keyboard navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/agents/testing");

  const trigger = page.getByRole("button", { name: "SDLC Agents" });
  const disclosure = page.locator("#desktop-agents-navigation");

  await expect(trigger).toHaveAttribute("aria-current", "page");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.focus();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(disclosure).toBeVisible();

  for (const agent of agentNavigationLinks) {
    await expect(
      disclosure.getByRole("link", { name: agent.name, exact: true }),
    ).toHaveAttribute("href", agent.href);
  }
  await expect(
    disclosure.getByRole("link", { name: "View all agents" }),
  ).toHaveAttribute("href", "/agents");
  await expectNoHorizontalOverflow(page);

  await disclosure.getByRole("link", { name: "Planning" }).focus();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(disclosure).not.toBeVisible();
  await expect(trigger).toBeFocused();

  await trigger.press("Space");
  await disclosure.getByRole("link", { name: "Planning" }).click();
  await expect(page).toHaveURL(/\/agents\/planning$/);
});

test("mobile navigation expands the SDLC agent links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/agents/testing");

  const navigationTrigger = page.getByRole("button", {
    name: "Open navigation menu",
  });
  await navigationTrigger.click();

  const mobileNavigation = page.locator("#mobile-navigation");
  const agentTrigger = mobileNavigation.getByRole("button", {
    name: "SDLC Agents",
  });
  const disclosure = page.locator("#mobile-agents-navigation");

  await expect(agentTrigger).toHaveAttribute("aria-current", "page");
  await expect(agentTrigger).toHaveAttribute("aria-expanded", "false");
  await agentTrigger.press("Enter");
  await expect(agentTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(disclosure).toBeVisible();

  for (const agent of agentNavigationLinks) {
    await expect(
      disclosure.getByRole("link", { name: agent.name, exact: true }),
    ).toHaveAttribute("href", agent.href);
  }
  await expect(
    disclosure.getByRole("link", { name: "View all agents" }),
  ).toHaveAttribute("href", "/agents");
  await expectNoHorizontalOverflow(page);

  await disclosure.getByRole("link", { name: "Testing" }).focus();
  await page.keyboard.press("Escape");
  await expect(mobileNavigation).not.toBeVisible();
  await expect(navigationTrigger).toHaveAccessibleName("Open navigation menu");
  await expect(navigationTrigger).toBeFocused();
});

test("admin dashboard remains a noindex static demonstration", async ({ page }) => {
  const response = await page.goto("/admin/dashboard");

  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText(/Demo only: this page uses static placeholder data/)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("health endpoint returns an OK response", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("robots endpoint is available and protects non-public areas", async ({ request }) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  expect(body).toContain("Disallow: /admin/");
  expect(body).toContain("Disallow: /api/");
});

test("sitemap contains every indexable public route and excludes private areas", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();
  const sitemapPaths = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  for (const path of publicHtmlRoutes) expect(sitemapPaths).toContain(path);
  expect(sitemapPaths).not.toContain("/admin/dashboard");
  expect(sitemapPaths.some((path) => path.startsWith("/api/"))).toBe(false);
});

test("an unknown path returns the custom 404 page", async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
