export type SecurityHeaderOptions = {
  isDevelopment: boolean;
  isProductionHttps: boolean;
  isPreview?: boolean;
};

export function createContentSecurityPolicy({
  isDevelopment,
  isProductionHttps,
}: SecurityHeaderOptions): string {
  const scriptSources = ["'self'", "'unsafe-inline'"];
  const connectSources = ["'self'"];

  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'");
    connectSources.push("ws:", "wss:");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "media-src 'self'",
    "manifest-src 'self'",
  ];

  if (isProductionHttps) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function createSecurityHeaders(options: SecurityHeaderOptions) {
  const headers = [
    {
      key: "Content-Security-Policy",
      value: createContentSecurityPolicy(options),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];

  if (options.isProductionHttps) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000",
    });
  }

  if (options.isPreview) {
    headers.push({
      key: "X-Robots-Tag",
      value: "noindex, nofollow",
    });
  }

  return headers;
}
