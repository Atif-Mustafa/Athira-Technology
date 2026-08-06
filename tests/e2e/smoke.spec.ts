import { expect, test, type Page } from "@playwright/test";

const implementedHtmlRoutes = [
  { path: "/", publicPage: true },
  { path: "/agents", publicPage: true },
  { path: "/agents/planning", publicPage: true },
  { path: "/agents/design", publicPage: true, incomplete: true },
  { path: "/agents/development", publicPage: true, incomplete: true },
  { path: "/agents/testing", publicPage: true, incomplete: true },
  { path: "/agents/deployment", publicPage: true, incomplete: true },
  { path: "/agents/monitoring", publicPage: true, incomplete: true },
  { path: "/agents/documentation", publicPage: true, incomplete: true },
  { path: "/admin/dashboard", publicPage: false, adminDemo: true },
] as const;

const unimplementedRoutes = [
  "/ai-software-engineer",
  "/services",
  "/pricing",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );

  expect(hasOverflow).toBe(false);
}

for (const route of implementedHtmlRoutes) {
  test(`${route.path} renders without runtime or responsive failures`, async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    if (route.publicPage) {
      await expect(
        page.getByRole("link", { name: "Skip to main content" }),
      ).toHaveAttribute("href", "#main-content");
    }

    if ("incomplete" in route && route.incomplete) {
      await expect(
        page.getByText(
          "Detailed capability information is planned for a future product milestone.",
        ),
      ).toBeVisible();
    }

    if ("adminDemo" in route && route.adminDemo) {
      await expect(
        page.getByText(/Demo only: this page uses static placeholder data/),
      ).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoHorizontalOverflow(page);
    expect(pageErrors).toEqual([]);
  });
}

test("health endpoint returns an OK response", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ status: "ok" });
});

test("robots endpoint is available and protects non-public areas", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
  expect(body).toContain("Disallow: /admin/");
  expect(body).toContain("Disallow: /api/");
});

test("sitemap contains only implemented public routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  expect(body).toContain("/agents/documentation");

  for (const route of unimplementedRoutes) {
    expect(body).not.toContain(`<loc>${route}</loc>`);
  }
});

for (const route of unimplementedRoutes) {
  test(`${route} returns the custom 404 page`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    const response = await page.goto(route);

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", { name: "Page Not Found" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Return Home" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}
