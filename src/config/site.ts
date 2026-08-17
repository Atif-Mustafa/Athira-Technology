const localSiteUrl = new URL("http://localhost:3000");

function resolveContactEmail(): string | null {
  const candidate = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  if (!candidate || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
    return null;
  }

  return candidate;
}

function resolveSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return localSiteUrl;
  }

  try {
    const url = new URL(configuredUrl);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url;
    }
  } catch {
    // Invalid configuration falls back to the documented local URL.
  }

  return localSiteUrl;
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
