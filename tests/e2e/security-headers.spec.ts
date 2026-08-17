import { expect, test } from "@playwright/test";

for (const path of ["/", "/api/health"]) {
  test(`${path} returns the application security headers`, async ({ request }) => {
    const response = await request.get(path);
    const headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
    expect(headers["strict-transport-security"]).toBeUndefined();
  });
}
