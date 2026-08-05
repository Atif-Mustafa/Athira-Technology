const localSiteUrl = new URL("http://localhost:3000");

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
  url: resolveSiteUrl(),
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
