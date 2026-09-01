import { getProductionOrientedSiteUrl } from "../lib/deployment-url";

function resolveContactEmail(): string | null {
  const candidate = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  if (!candidate || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
    return null;
  }

  return candidate;
}

function resolveSiteUrl(): URL {
  return getProductionOrientedSiteUrl(process.env);
}

export const siteConfig = {
  name: "Athira Technology",
  shortName: "AthiraTech",
  description:
    "Athira Technology presents a planned, human-reviewed AI Software Engineer made up of specialized SDLC agents.",
  url: resolveSiteUrl(),
  contactEmail: resolveContactEmail(),
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
