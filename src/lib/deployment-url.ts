/**
 * Shared origin-resolution helpers for Vercel deployments.
 *
 * Vercel exposes VERCEL_URL / VERCEL_BRANCH_URL / VERCEL_PROJECT_PRODUCTION_URL
 * as bare hostnames (no scheme) and always serves them over HTTPS, so callers
 * must normalize them before use rather than trusting a raw string.
 */

export function parseExplicitOrigin(raw: string | undefined | null): URL | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function parseVercelHost(raw: string | undefined | null): URL | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the canonical/SEO site origin. Preview deployments intentionally
 * canonicalize to the stable production origin (Preview already responds
 * noindex), so this uses the same precedence for both: an explicit
 * NEXT_PUBLIC_SITE_URL, then Vercel's automatic production/deployment host,
 * then localhost.
 */
export type SiteUrlEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
  [key: string]: string | undefined;
};

export function getProductionOrientedSiteUrl(
  env: SiteUrlEnvironment = process.env,
  fallback = "http://localhost:3000",
): URL {
  return (
    parseExplicitOrigin(env.NEXT_PUBLIC_SITE_URL) ??
    parseVercelHost(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    parseVercelHost(env.VERCEL_URL) ??
    new URL(fallback)
  );
}
