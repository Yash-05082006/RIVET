/**
 * Navigation derived from permissions (see permissions.ts), so no user is
 * shown an area they cannot act in.
 */

import type { Role, User } from "./types";
import {
  accessibleDepartments,
  accessibleModules,
  canModule,
  canAccessDepartment,
  hasPermission,
  type GlobalPermission,
} from "./permissions";

export interface NavItem {
  label: string;
  to: string;
  /** Omitted = any signed-in user. */
  requires?: GlobalPermission;
  countKey?: "review" | "attention" | "unread";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Home", to: "/app/dashboard" },
      { label: "My work", to: "/app/work", countKey: "attention" },
      { label: "Modules", to: "/app/modules" },
    ],
  },
  {
    title: "Workflow",
    items: [
      { label: "Approvals", to: "/app/approvals", requires: "review", countKey: "review" },
      { label: "Reports", to: "/app/reports" },
      { label: "Notifications", to: "/app/notifications", countKey: "unread" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", to: "/app/admin/users", requires: "admin" },
      { label: "Departments", to: "/app/admin/departments", requires: "admin" },
      { label: "Modules & access", to: "/app/admin/modules", requires: "admin" },
      { label: "Audit log", to: "/app/admin/audit", requires: "admin" },
    ],
  },
  { items: [{ label: "Settings", to: "/app/settings" }] },
];

export function sectionsForUser(user: User): NavSection[] {
  const filtered = navSections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.requires || hasPermission(user, i.requires)) }))
    .filter((s) => s.items.length > 0);

  // Inject Campaigns link for users with brand-marketing department access
  if (canAccessDepartment(user, "brand-marketing")) {
    const campaignsItem: NavItem = { label: "Campaigns", to: "/app/campaigns" };
    return filtered.map((s) =>
      s.title === "Workflow"
        ? { ...s, items: [...s.items, campaignsItem] }
        : s
    );
  }

  return filtered;
}

export const departmentsForUser = (user: User) => accessibleDepartments(user);
export const modulesForUser = (user: User) => accessibleModules(user);
export const canCreateIn = (user: User, moduleKey: string) => canModule(user, "create", moduleKey);
export const canReview = (user: User) => hasPermission(user, "review");

export const roleLabel: Record<Role, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
};
