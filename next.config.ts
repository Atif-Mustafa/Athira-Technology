import type { NextConfig } from "next";
import { createSecurityHeaders } from "./src/config/security";

// Vercel production deployments are always served over HTTPS, so identifying
// the environment is sufficient without requiring NEXT_PUBLIC_SITE_URL to be
// manually kept in sync just to unlock the HSTS header.
const isProductionHttps = process.env.VERCEL_ENV === "production";
const isPreview = process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: createSecurityHeaders({
          isDevelopment: process.env.NODE_ENV === "development",
          isProductionHttps,
          isPreview,
        }),
      },
    ];
  },
};

export default nextConfig;
