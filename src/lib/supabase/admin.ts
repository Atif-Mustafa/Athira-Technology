import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AdminAuthContext } from "../../server/auth/guards";
import { getSupabaseAdminConfig } from "../../server/env";

export class SupabaseAdminConfigurationError extends Error {
  constructor() {
    super("Supabase admin operations are not configured for this environment.");
    this.name = "SupabaseAdminConfigurationError";
  }
}

export function createSupabaseAdminClientForAdmin(context: AdminAuthContext): SupabaseClient {
  if (context.role !== "admin" || context.profile.status !== "active" || !context.user.id) {
    throw new SupabaseAdminConfigurationError();
  }
  const configuration = getSupabaseAdminConfig(process.env);
  if (!configuration.success) throw new SupabaseAdminConfigurationError();
  return createClient(configuration.config.url, configuration.config.secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}
