import { z } from "zod";
import { validateSupabasePublicEnvironment, type SupabasePublicEnvironmentResult } from "../lib/supabase/config";
import { parseExplicitOrigin, parseVercelHost } from "../lib/deployment-url";

export { validateSupabasePublicEnvironment } from "../lib/supabase/config";
export type { SupabasePublicConfig, SupabasePublicEnvironmentResult } from "../lib/supabase/config";

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

const MAX_CONTACT_ALLOWED_ORIGINS = 20;

function parseOrigins(value: string | undefined): string[] | null {
  if (!value?.trim()) {
    return [];
  }

  const candidates = value.split(",");
  if (candidates.length > MAX_CONTACT_ALLOWED_ORIGINS) {
    return null;
  }

  const origins: string[] = [];

  for (const candidate of candidates) {
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
    const url = parseExplicitOrigin(configuredSiteUrl);
    if (!url) {
      issues.push("NEXT_PUBLIC_SITE_URL must be a valid absolute HTTP or HTTPS URL.");
    } else if (mode === "production" && url.protocol !== "https:") {
      issues.push("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
    } else {
      siteOrigin = url.origin;
    }
  } else {
    // Vercel supplies these automatically for every deployment (Preview and
    // Production alike), so the owner never has to set NEXT_PUBLIC_SITE_URL
    // by hand just to keep the contact route's same-origin baseline correct.
    const automaticUrl =
      parseVercelHost(environment.VERCEL_PROJECT_PRODUCTION_URL) ??
      parseVercelHost(environment.VERCEL_URL);

    if (automaticUrl) {
      siteOrigin = automaticUrl.origin;
    } else if (mode === "production") {
      issues.push(
        "NEXT_PUBLIC_SITE_URL is required in production when no Vercel deployment URL is available.",
      );
    }
  }

  const apiKey = environment.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = environment.CONTACT_FROM_EMAIL?.trim() ?? "";
  const toEmail = environment.CONTACT_TO_EMAIL?.trim() ?? "";

  const hasAnyEmailConfiguration = Boolean(apiKey || fromEmail || toEmail);
  if (hasAnyEmailConfiguration && apiKey.length < 10) {
    issues.push("RESEND_API_KEY must be complete when contact notification is configured.");
  }
  if (hasAnyEmailConfiguration && !senderAddress.safeParse(fromEmail).success) {
    issues.push("CONTACT_FROM_EMAIL must be a valid verified sender address.");
  }
  if (hasAnyEmailConfiguration && !emailAddress.safeParse(toEmail).success) {
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

  // Trust the exact branch/deployment host Vercel assigns this deployment,
  // in addition to whatever request.url reports, so a same-origin Preview
  // request is accepted without the owner maintaining CONTACT_ALLOWED_ORIGINS.
  const automaticOrigins = [
    parseVercelHost(environment.VERCEL_BRANCH_URL)?.origin,
    parseVercelHost(environment.VERCEL_URL)?.origin,
  ].filter((origin): origin is string => Boolean(origin));

  const allowedOrigins = [
    ...new Set([siteOrigin, ...automaticOrigins, ...(extraOrigins ?? [])]),
  ];
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

export function isContactEmailConfigured(config: ContactServerConfig): boolean {
  return config.email.apiKey.length >= 10
    && senderAddress.safeParse(config.email.fromEmail).success
    && emailAddress.safeParse(config.email.toEmail).success;
}


export function getSupabaseServerConfig(): SupabasePublicEnvironmentResult {
  return validateSupabasePublicEnvironment(process.env);
}

export type SupabaseAdminEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  NODE_ENV?: string;
};

export type SupabaseAdminConfig = {
  url: string;
  secretKey: string;
};

export type SupabaseAdminEnvironmentResult =
  | { success: true; config: SupabaseAdminConfig }
  | { success: false; issues: string[] };

export function validateSupabaseAdminEnvironment(
  environment: SupabaseAdminEnvironment,
): SupabaseAdminEnvironmentResult {
  const publicConfiguration = validateSupabasePublicEnvironment(environment);
  const secretKey = environment.SUPABASE_SECRET_KEY?.trim() ?? "";

  if (!publicConfiguration.success) {
    return { success: false, issues: [...publicConfiguration.issues] };
  }

  if (!secretKey) {
    return {
      success: false,
      issues: ["SUPABASE_SECRET_KEY is required for admin user management."],
    };
  }

  return {
    success: true,
    config: {
      url: publicConfiguration.config.url,
      secretKey,
    },
  };
}

export function getSupabaseAdminConfig(
  environment: SupabaseAdminEnvironment = process.env,
): SupabaseAdminEnvironmentResult {
  return validateSupabaseAdminEnvironment(environment);
}
