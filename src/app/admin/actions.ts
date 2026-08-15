"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerConfig } from "../../server/env";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export type LoginActionState = {
  kind: "idle" | "invalid" | "configuration";
  message?: string;
};

function getSafeReturnPath(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "/admin/dashboard";
  if (!value.startsWith("/admin/") || value.startsWith("//")) return "/admin/dashboard";
  return value;
}

export async function signInAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const configuration = getSupabaseServerConfig();
  if (!configuration.success) {
    return {
      kind: "configuration",
      message: "Admin authentication is not configured for this environment.",
    };
  }

  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return { kind: "invalid", message: "Enter your email and password to continue." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { kind: "invalid", message: "The email or password could not be verified." };
    }
  } catch {
    return {
      kind: "configuration",
      message: "Admin authentication is temporarily unavailable. Try again later.",
    };
  }

  redirect(getSafeReturnPath(formData.get("next")));
}

export async function signOutAction() {
  try {
    const configuration = getSupabaseServerConfig();
    if (configuration.success) {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    }
  } catch {
    // Always return the user to the login boundary without exposing provider errors.
  }

  redirect("/admin/login?logged_out=1");
}
