/**
 * Role-based navigation and permission helpers.
 *
 * Navigation is derived from the signed-in role (PRD section 5), so no user is
 * shown an area they cannot act in.
 */

import type { Role, User } from "./types";
import { departments, modules } from "./demo-data";

export interface NavItem {
  label: string;
  to: string;
  roles: Role[];
  /** Shown as a small trailing count when provided by the caller. */
  countKey?: "review" | "attention" | "unread";
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Home", to: "/app/dashboard", roles: ["employee", "manager", "admin"] },
      { label: "My work", to: "/app/work", roles: ["employee", "manager", "admin"], countKey: "attention" },
      { label: "Modules", to: "/app/modules", roles: ["employee", "manager", "admin"] },
    ],
  },
  {
    title: "Workflow",
    items: [
      { label: "Approvals", to: "/app/approvals", roles: ["manager", "admin"], countKey: "review" },
      { label: "Reports", to: "/app/reports", roles: ["employee", "manager", "admin"] },
      { label: "Notifications", to: "/app/notifications", roles: ["employee", "manager", "admin"], countKey: "unread" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", to: "/app/admin/users", roles: ["admin"] },
      { label: "Departments", to: "/app/admin/departments", roles: ["admin"] },
      { label: "Modules & access", to: "/app/admin/modules", roles: ["admin"] },
      { label: "Audit log", to: "/app/admin/audit", roles: ["admin"] },
    ],
  },
  {
    items: [{ label: "Settings", to: "/app/settings", roles: ["employee", "manager", "admin"] }],
  },
];

export function sectionsForRole(role: Role): NavSection[] {
  return navSections
    .map((section) => ({ ...section, items: section.items.filter((i) => i.roles.includes(role)) }))
    .filter((section) => section.items.length > 0);
}

export function departmentsForUser(user: User) {
  if (user.role === "admin") return departments;
  return departments.filter((d) => user.departmentIds.includes(d.id));
}

export function modulesForUser(user: User) {
  if (user.role === "admin") return modules;
  return modules.filter((m) => user.departmentIds.includes(m.departmentId) && m.active);
}

export function canCreateIn(user: User, moduleKey: string) {
  const mod = modules.find((m) => m.key === moduleKey);
  if (!mod || !mod.active) return false;
  if (user.role !== "admin" && !user.departmentIds.includes(mod.departmentId)) return false;
  return mod.createRoles.includes(user.role);
}

export function canReview(user: User) {
  return user.role === "manager" || user.role === "admin";
}

export const roleLabel: Record<Role, string> = {
  employee: "Employee",
  manager: "Manager",
  admin: "Admin",
};
