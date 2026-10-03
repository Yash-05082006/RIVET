/**
 * Single source of truth for RIVET access control (Phase 1).
 *
 * Access = Role + Department + Module + Action. Every screen, nav item and
 * route guard asks this module; nothing else should compare `user.role`.
 */

import { departments, modules, getModule } from "./demo-data";
import type { LogEntry, ModuleDef, Role, User } from "./types";

export type ModuleAction = "view" | "create" | "edit" | "submit" | "review";
export type GlobalPermission = "review" | "admin";

/** Which module actions each role may perform inside departments it can reach. */
const ROLE_MODULE_ACTIONS: Record<Role, ModuleAction[]> = {
  employee: ["view", "create", "edit", "submit"],
  manager: ["view", "create", "edit", "submit", "review"],
  admin: ["view", "create", "edit", "submit", "review"],
};

const ROLE_GLOBAL: Record<Role, GlobalPermission[]> = {
  employee: [],
  manager: ["review"],
  admin: ["review", "admin"],
};

export function hasPermission(user: User | null, perm: GlobalPermission): boolean {
  return !!user && user.active && ROLE_GLOBAL[user.role].includes(perm);
}

/** Admins span the organisation; everyone else is limited to assigned departments. */
export function canAccessDepartment(user: User | null, departmentId: string): boolean {
  if (!user || !user.active) return false;
  return user.role === "admin" || user.departmentIds.includes(departmentId);
}

export function accessibleDepartments(user: User | null) {
  return departments.filter((d) => canAccessDepartment(user, d.id));
}

export function canModule(user: User | null, action: ModuleAction, moduleKey: string): boolean {
  if (!user) return false;
  const mod = getModule(moduleKey);
  if (!mod) return false;
  if (!canAccessDepartment(user, mod.departmentId)) return false;
  if (!ROLE_MODULE_ACTIONS[user.role].includes(action)) return false;
  // Inactive modules stay visible to admins only and accept no new work.
  if (!mod.active) return user.role === "admin" && action === "view";
  if (action === "create") return mod.createRoles.includes(user.role);
  return true;
}

export function accessibleModules(user: User | null): ModuleDef[] {
  return modules.filter((m) => canModule(user, "view", m.key));
}

export function canViewEntry(user: User | null, entry: LogEntry): boolean {
  if (!user) return false;
  if (entry.authorId === user.id) return true;
  if (!canAccessDepartment(user, entry.departmentId)) return false;
  return hasPermission(user, "review");
}

export function canReviewEntry(user: User | null, entry: LogEntry): boolean {
  return canModule(user, "review", entry.moduleKey) && canAccessDepartment(user, entry.departmentId);
}

/**
 * Route-level guard used by the /app layout so direct URL access is enforced
 * the same way as navigation visibility.
 */
export function canAccessPath(user: User | null, pathname: string): boolean {
  if (!user) return false;
  const path = pathname.replace(/\/+$/, "");
  if (path.startsWith("/app/admin")) return hasPermission(user, "admin");
  if (path.startsWith("/app/approvals")) return hasPermission(user, "review");
  const mod = path.match(/^\/app\/modules\/([^/]+)(\/new)?/);
  if (mod) {
    if (!getModule(mod[1])) return true; // page renders its own "not found"
    return canModule(user, mod[2] ? "create" : "view", mod[1]);
  }
  return true;
}
