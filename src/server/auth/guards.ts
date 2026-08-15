import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { getSupabasePublicConfig } from "../../lib/supabase/config";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getHighestAppRole, type AppRole, roleCanAccessDashboard } from "./roles";

export type UserProfile = {
  display_name: string | null;
  status: "active" | "disabled";
};

export type AuthContext = {
  configurationAvailable: boolean;
  user: User | null;
  profile: UserProfile | null;
  role: AppRole | null;
  issue: "configuration" | "unauthenticated" | "role_lookup_failed" | "disabled" | null;
};

export type AdminAccessDecision = "configuration" | "unauthenticated" | "forbidden" | "allowed";

export async function getAuthContext(): Promise<AuthContext> {
  const configuration = getSupabasePublicConfig(process.env);
  if (!configuration.success) {
    return {
      configurationAvailable: false,
      user: null,
      profile: null,
      role: null,
      issue: "configuration",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return {
        configurationAvailable: true,
        user: null,
        profile: null,
        role: null,
        issue: "unauthenticated",
      };
    }

    const [{ data: profile, error: profileError }, { data: roles, error: roleError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("display_name,status")
        .eq("id", data.user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    ]);

    if (profileError || roleError) {
      return {
        configurationAvailable: true,
        user: data.user,
        profile: (profile as UserProfile | null) ?? null,
        role: null,
        issue: "role_lookup_failed",
      };
    }

    const typedProfile = (profile as UserProfile | null) ?? null;
    if (typedProfile?.status === "disabled") {
      return {
        configurationAvailable: true,
        user: data.user,
        profile: typedProfile,
        role: null,
        issue: "disabled",
      };
    }

    return {
      configurationAvailable: true,
      user: data.user,
      profile: typedProfile,
      role: getHighestAppRole((roles ?? []).map((item) => item.role)),
      issue: null,
    };
  } catch {
    return {
      configurationAvailable: true,
      user: null,
      profile: null,
      role: null,
      issue: "role_lookup_failed",
    };
  }
}

export function decideAdminAccess(context: AuthContext, allowedRoles: readonly AppRole[]): AdminAccessDecision {
  if (!context.configurationAvailable) return "configuration";
  if (!context.user || context.issue === "unauthenticated") return "unauthenticated";
  if (context.issue !== null || !context.role || !allowedRoles.includes(context.role)) return "forbidden";
  return roleCanAccessDashboard(context.role) ? "allowed" : "forbidden";
}

function loginPath(returnTo: string, configurationError = false) {
  const params = new URLSearchParams({ next: returnTo });
  if (configurationError) params.set("error", "configuration");
  return `/admin/login?${params.toString()}`;
}

export async function requireAnyRole(
  allowedRoles: readonly AppRole[],
  returnTo = "/admin/dashboard",
): Promise<AuthContext> {
  const context = await getAuthContext();
  const decision = decideAdminAccess(context, allowedRoles);

  if (decision === "configuration") redirect(loginPath(returnTo, true));
  if (decision === "unauthenticated") redirect(loginPath(returnTo));
  if (decision === "forbidden") redirect("/admin/forbidden");

  return context;
}

export function requireAuthenticatedUser(returnTo = "/admin/dashboard") {
  return requireAnyRole(["admin", "editor", "viewer"], returnTo);
}

export function requireAdminRole(returnTo = "/admin/dashboard") {
  return requireAnyRole(["admin"], returnTo);
}

export function requireEditorOrAdmin(returnTo = "/admin/dashboard") {
  return requireAnyRole(["admin", "editor"], returnTo);
}

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const context = await getAuthContext();
  return context.role;
}
