import { z } from "zod";

export type RuntimeMode = "development" | "test" | "production";

export type ContactServerConfig = {
  mode: RuntimeMode;
  siteOrigin: string;
  allowedOrigins: string[];
  trustVercelHeaders: boolean;
  email: {
    apiKey: string;
    fromEmail: string;
    toEmail: string;
  };
  rateLimit:
    | {
        provider: "upstash";
        url: string;
        token: string;
        hashSecret: string;
      }
    | {
        provider: "memory";
        hashSecret: string;
      };
};

export type EnvironmentValidationResult =
  | { success: true; config: ContactServerConfig }
  | { success: false; issues: string[] };

const emailAddress = z.string().trim().email();
const senderAddress = z.string().trim().refine((value) => {
  const bracketMatch = value.match(/<([^<>]+)>$/);
  const address = bracketMatch?.[1] ?? value;
  return emailAddress.safeParse(address).success;
});

function normalizeMode(value: string | undefined): RuntimeMode {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}

function parseOrigins(value: string | undefined): string[] | null {
  if (!value?.trim()) {
    return [];
  }

  const origins: string[] = [];

  for (const candidate of value.split(",")) {
    try {
      const url = new URL(candidate.trim());
      if ((url.protocol !== "http:" && url.protocol !== "https:") || url.origin !== url.href.replace(/\/$/, "")) {
        return null;
      }
      origins.push(url.origin);
    } catch {
      return null;
    }
  }

  return [...new Set(origins)];
}

export function validateServerEnvironment(
  environment: NodeJS.ProcessEnv,
): EnvironmentValidationResult {
  const mode = normalizeMode(environment.NODE_ENV);
  const issues: string[] = [];
  const configuredSiteUrl = environment.NEXT_PUBLIC_SITE_URL?.trim();
  let siteOrigin = "http://localhost:3000";

  if (configuredSiteUrl) {
    try {
      const url = new URL(configuredSiteUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        issues.push("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
      } else if (mode === "production" && url.protocol !== "https:") {
        issues.push("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
      } else {
        siteOrigin = url.origin;
      }
    } catch {
      issues.push("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
    }
  } else if (mode === "production") {
    issues.push("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  const apiKey = environment.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = environment.CONTACT_FROM_EMAIL?.trim() ?? "";
  const toEmail = environment.CONTACT_TO_EMAIL?.trim() ?? "";

  if (apiKey.length < 10) {
    issues.push("RESEND_API_KEY is required for contact delivery.");
  }
  if (!senderAddress.safeParse(fromEmail).success) {
    issues.push("CONTACT_FROM_EMAIL must be a valid verified sender address.");
  }
  if (!emailAddress.safeParse(toEmail).success) {
    issues.push("CONTACT_TO_EMAIL must be a valid recipient address.");
  }

  const extraOrigins = parseOrigins(environment.CONTACT_ALLOWED_ORIGINS);
  if (extraOrigins === null) {
    issues.push("CONTACT_ALLOWED_ORIGINS must contain comma-separated origins only.");
  }

  const upstashUrl = environment.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const upstashToken = environment.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";
  const hashSecret = environment.RATE_LIMIT_HASH_SECRET?.trim() ?? "";
  const hasCompleteUpstashConfig = Boolean(upstashUrl && upstashToken);
  const hasPartialUpstashConfig = Boolean(upstashUrl || upstashToken);

  if (hasPartialUpstashConfig && !hasCompleteUpstashConfig) {
    issues.push("Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required together.");
  }

  if (hasCompleteUpstashConfig) {
    try {
      const url = new URL(upstashUrl);
      if (url.protocol !== "https:") {
        issues.push("UPSTASH_REDIS_REST_URL must use HTTPS.");
      }
    } catch {
      issues.push("UPSTASH_REDIS_REST_URL must be a valid HTTPS URL.");
    }
  }

  if (mode === "production" && !hasCompleteUpstashConfig) {
    issues.push("Distributed Upstash rate limiting is required in production.");
  }
  if (mode === "production" && hashSecret.length < 32) {
    issues.push("RATE_LIMIT_HASH_SECRET must contain at least 32 characters in production.");
  }

  const trustVercelHeaders = environment.VERCEL === "1";
  if (mode === "production" && !trustVercelHeaders) {
    issues.push("The production contact route requires Vercel-controlled forwarding headers.");
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  const allowedOrigins = [...new Set([siteOrigin, ...(extraOrigins ?? [])])];
  const localHashSecret = hashSecret || "athira-local-contact-rate-limit-only-not-for-production";

  return {
    success: true,
    config: {
      mode,
      siteOrigin,
      allowedOrigins,
      trustVercelHeaders,
      email: { apiKey, fromEmail, toEmail },
      rateLimit: hasCompleteUpstashConfig
        ? {
            provider: "upstash",
            url: upstashUrl,
            token: upstashToken,
            hashSecret: localHashSecret,
          }
        : {
            provider: "memory",
            hashSecret: localHashSecret,
          },
    },
  };
}

export function getContactServerConfig(): EnvironmentValidationResult {
  return validateServerEnvironment(process.env);
}
