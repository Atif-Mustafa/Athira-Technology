import type { NextConfig } from "next";
import { createSecurityHeaders } from "./src/config/security";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const isProductionHttps =
  process.env.VERCEL_ENV === "production" &&
  Boolean(configuredSiteUrl?.startsWith("https://"));

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
        }),
      },
    ];
  },
};

export default nextConfig;
