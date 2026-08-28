import type { User } from "@supabase/supabase-js";
import { requireAnyRole, type AuthContext, type UserProfile } from "../auth/guards";
import type { AppRole } from "../auth/roles";

export type EnquiryViewerContext = AuthContext & {
  configurationAvailable: true;
  user: User;
  profile: UserProfile & { status: "active" };
  role: AppRole;
  issue: null;
};

export type EnquiryEditorContext = EnquiryViewerContext & {
  role: "admin" | "editor";
};

export function requireEnquiryViewer(returnTo = "/admin/enquiries") {
  return requireAnyRole(["admin", "editor", "viewer"], returnTo) as Promise<EnquiryViewerContext>;
}

export function requireEnquiryEditor(returnTo = "/admin/enquiries") {
  return requireAnyRole(["admin", "editor"], returnTo) as Promise<EnquiryEditorContext>;
}

export function canManageEnquiries(context: EnquiryViewerContext): context is EnquiryEditorContext {
  return context.role === "admin" || context.role === "editor";
}
