"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabasePublicConfig } from "./config";

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, publishableKey } = requireSupabasePublicConfig();
  return createBrowserClient(url, publishableKey);
}
