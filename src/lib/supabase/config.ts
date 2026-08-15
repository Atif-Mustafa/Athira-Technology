export type SupabasePublicEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NODE_ENV?: string;
};

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export type SupabasePublicEnvironmentResult =
  | { success: true; config: SupabasePublicConfig }
  | { success: false; issues: string[] };

function isProduction(environment: SupabasePublicEnvironment) {
  return environment.NODE_ENV === "production";
}

export function validateSupabasePublicEnvironment(
  environment: SupabasePublicEnvironment,
): SupabasePublicEnvironmentResult {
  const issues: string[] = [];
  const urlValue = environment.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey = environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";

  if (!urlValue) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is required for Supabase authentication.");
  } else {
    try {
      const url = new URL(urlValue);
      if (url.protocol !== "https:" && !(url.protocol === "http:" && !isProduction(environment))) {
        issues.push("NEXT_PUBLIC_SUPABASE_URL must use HTTPS outside local development.");
      }
      if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
        issues.push("NEXT_PUBLIC_SUPABASE_URL must be a Supabase project origin without credentials or a path.");
      }
    } catch {
      issues.push("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
    }
  }

  if (!publishableKey) {
    issues.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required for Supabase authentication.");
  }

  if (issues.length > 0) {
    return { success: false, issues };
  }

  return {
    success: true,
    config: { url: urlValue, publishableKey },
  };
}

export class SupabaseConfigurationError extends Error {
  constructor(issues: string[]) {
    super(`Supabase authentication is unavailable: ${issues.join(" ")}`);
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabasePublicConfig(
  environment: SupabasePublicEnvironment = process.env,
): SupabasePublicEnvironmentResult {
  return validateSupabasePublicEnvironment(environment);
}

export function requireSupabasePublicConfig(
  environment: SupabasePublicEnvironment = process.env,
): SupabasePublicConfig {
  const result = getSupabasePublicConfig(environment);
  if (!result.success) {
    throw new SupabaseConfigurationError(result.issues);
  }

  return result.config;
}
