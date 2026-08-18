"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClientForAdmin, SupabaseAdminConfigurationError } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { requireAdminRole } from "../../../server/auth/guards";
import { APP_ROLES, parseAppRole, roleLabel, type AppRole } from "../../../server/auth/roles";

export type AdminActionState = {
  kind: "idle" | "success" | "warning" | "error";
  message?: string;
};

const inviteSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(APP_ROLES),
  displayName: z.string().trim().max(100).optional(),
});

const userIdSchema = z.string().uuid();
const statusSchema = z.enum(["active", "disabled"]);

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getInviteRedirectUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  try {
    const origin = new URL(configured);
    if (origin.protocol === "http:" || origin.protocol === "https:") {
      return `${origin.origin}/admin/login`;
    }
  } catch {
    // Use a safe local fallback if deployment configuration is malformed.
  }
  return "http://localhost:3000/admin/login";
}

function isExistingUserError(error: unknown): boolean {
  const candidate = error as { code?: string; status?: number; message?: string } | null;
  const message = candidate?.message?.toLowerCase() ?? "";
  return candidate?.code === "email_exists" || candidate?.status === 422 || message.includes("already registered") || message.includes("already exists");
}

function mutationMessage(error: unknown, fallback: string): string {
  const message = String((error as { message?: unknown } | null)?.message ?? "").toLowerCase();
  if (message.includes("self_protection") || message.includes("cannot modify yourself")) {
    return "You cannot change your own role or disable your own access.";
  }
  if (message.includes("last_active_admin") || message.includes("last active administrator")) {
    return "This action would remove the final active administrator.";
  }
  if (message.includes("user_not_found")) return "That user no longer exists.";
  if (message.includes("invalid_status")) return "Choose a valid account status.";
  if (message.includes("forbidden")) return "You are not allowed to perform this action.";
  return fallback;
}

function invalidTarget(formData: FormData): AdminActionState | null {
  const target = formString(formData, "userId");
  return userIdSchema.safeParse(target).success
    ? null
    : { kind: "error", message: "The selected user could not be verified." };
}

export async function inviteUserAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdminRole("/admin/users");
  const parsed = inviteSchema.safeParse({
    email: formString(formData, "email"),
    role: formString(formData, "role") || "viewer",
    displayName: formString(formData, "displayName") || undefined,
  });

  if (!parsed.success) {
    return { kind: "error", message: "Enter a valid email, display name, and supported role." };
  }

  try {
    const supabaseAdmin = createSupabaseAdminClientForAdmin(admin);
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: parsed.data.displayName ? { full_name: parsed.data.displayName } : undefined,
      redirectTo: getInviteRedirectUrl(),
    });

    if (error) {
      return {
        kind: "error",
        message: isExistingUserError(error)
          ? "That email already has an account or pending invitation."
          : "The invitation provider could not send this invitation.",
      };
    }

    const invitedUserId = data.user?.id;
    if (!invitedUserId) return { kind: "error", message: "The invitation could not be completed." };

    const sessionClient = await createSupabaseServerClient();
    const { error: roleError } = await sessionClient.rpc("admin_finalize_invitation", {
      target_user_id: invitedUserId,
      new_role: parsed.data.role,
    });

    if (roleError) {
      return {
        kind: "warning",
        message: "The invitation was sent, but the requested role could not be applied. Verify the new account before granting access.",
      };
    }

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${invitedUserId}`);
    return { kind: "success", message: `Invitation sent. The new account will have the ${roleLabel(parsed.data.role)} role.` };
  } catch (error) {
    if (error instanceof SupabaseAdminConfigurationError) {
      return { kind: "error", message: "User invitations are not configured for this environment." };
    }
    return { kind: "error", message: "The invitation service is temporarily unavailable." };
  }
}

export async function changeUserRoleAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdminRole("/admin/users");
  const targetError = invalidTarget(formData);
  if (targetError) return targetError;

  const targetUserId = formString(formData, "userId");
  const role = parseAppRole(formString(formData, "role"));
  if (!role) return { kind: "error", message: "Choose one of the supported roles." };
  if (targetUserId === admin.user.id) return { kind: "error", message: "You cannot demote yourself." };

  try {
    const sessionClient = await createSupabaseServerClient();
    const { error } = await sessionClient.rpc("admin_change_user_role", {
      target_user_id: targetUserId,
      new_role: role,
    });
    if (error) return { kind: "error", message: mutationMessage(error, "The role could not be changed.") };

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${targetUserId}`);
    return { kind: "success", message: `Role changed to ${roleLabel(role)}.` };
  } catch {
    return { kind: "error", message: "The role service is temporarily unavailable." };
  }
}

export async function setUserStatusAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdminRole("/admin/users");
  const targetError = invalidTarget(formData);
  if (targetError) return targetError;

  const targetUserId = formString(formData, "userId");
  const status = statusSchema.safeParse(formString(formData, "status"));
  if (!status.success) return { kind: "error", message: "Choose a valid account status." };
  if (targetUserId === admin.user.id && status.data === "disabled") {
    return { kind: "error", message: "You cannot disable your own access." };
  }

  try {
    const sessionClient = await createSupabaseServerClient();
    const { error } = await sessionClient.rpc("admin_set_user_status", {
      target_user_id: targetUserId,
      new_status: status.data,
    });
    if (error) return { kind: "error", message: mutationMessage(error, "The account status could not be changed.") };

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${targetUserId}`);
    return {
      kind: "success",
      message: status.data === "disabled" ? "Access disabled." : "Access enabled.",
    };
  } catch {
    return { kind: "error", message: "The account status service is temporarily unavailable." };
  }
}

export const supportedAdminRoles: readonly AppRole[] = APP_ROLES;
