export const APP_ROLES = ["admin", "editor", "viewer"] as const;

export type AppRole = (typeof APP_ROLES)[number];

const rolePriority: Record<AppRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

export function parseAppRole(value: unknown): AppRole | null {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole)
    ? (value as AppRole)
    : null;
}

export function getHighestAppRole(values: readonly unknown[]): AppRole | null {
  return values
    .map(parseAppRole)
    .filter((role): role is AppRole => role !== null)
    .sort((left, right) => rolePriority[right] - rolePriority[left])[0] ?? null;
}

export function roleCanAccessDashboard(role: AppRole | null): boolean {
  return role !== null;
}

export function roleLabel(role: AppRole | null): string {
  if (!role) return "No role";
  return role.charAt(0).toUpperCase() + role.slice(1);
}
