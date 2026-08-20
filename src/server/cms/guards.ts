import type { User } from "@supabase/supabase-js";
import {
  requireAnyRole,
  type AuthContext,
  type UserProfile,
} from "../auth/guards";
import type { AppRole } from "../auth/roles";

export type ContentViewerContext = AuthContext & {
  configurationAvailable: true;
  user: User;
  profile: UserProfile & { status: "active" };
  role: AppRole;
  issue: null;
};

export type ContentEditorContext = ContentViewerContext & {
  role: "admin" | "editor";
};

export function requireContentViewer(returnTo = "/admin/content") {
  return requireAnyRole(["admin", "editor", "viewer"], returnTo) as Promise<ContentViewerContext>;
}

export function requireContentEditor(returnTo = "/admin/content") {
  return requireAnyRole(["admin", "editor"], returnTo) as Promise<ContentEditorContext>;
}

export function canEditContent(context: ContentViewerContext): context is ContentEditorContext {
  return context.role === "admin" || context.role === "editor";
}
