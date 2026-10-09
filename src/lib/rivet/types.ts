/**
 * RIVET domain types.
 *
 * These mirror the PRD data model (users, departments, modules, log entries,
 * approvals, notifications, audit) so the UI can be swapped from demo data to
 * the real API without changing components.
 */

export type Role = "employee" | "manager" | "admin";

export type EntryStatus = "draft" | "submitted" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Employees belong to exactly one department; managers may span several. */
  departmentIds: string[];
  designation: string;
  active: boolean;
  lastLoginAt: string;
  avatarColor: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerIds: string[];
  moduleKeys: string[];
  active?: boolean;
  deleted?: boolean;
}

export type FieldType =
  | "date"
  | "month"
  | "time"
  | "text"
  | "longtext"
  | "integer"
  | "decimal"
  | "select"
  | "boolean"
  | "auto";

export interface ModuleField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  note?: string;
}

export interface ModuleDef {
  key: string;
  name: string;
  /** PRD section reference, shown in module detail metadata. */
  reference: string;
  departmentId: string;
  description: string;
  /** Department-level shared logs are not per-employee (e.g. webinar planner). */
  scope: "employee" | "department";
  cadence: "daily" | "weekly" | "monthly" | "ad-hoc";
  active: boolean;
  approvalRequired: boolean;
  /** Roles allowed to create entries in this module. */
  createRoles: Role[];
  fields: ModuleField[];
  /** Columns shown in the module entry table. */
  tableFields: string[];
}

export interface EntryComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  mentions?: string[];
}

export interface LogEntry {
  id: string;
  moduleKey: string;
  departmentId: string;
  authorId: string;
  /** Business date of the work being logged (ISO 8601). */
  entryDate: string;
  status: EntryStatus;
  values: Record<string, string | number | boolean>;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  decidedAt?: string;
  decidedById?: string;
  managerRemarks?: string;
  editedByManager?: boolean;
  comments: EntryComment[];
}

export interface Campaign {
  id: string;
  name: string;
  departmentId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  platform: string;
  status: "Active" | "Completed" | "On Hold";
  description: string;
}

export type NotificationKind =
  | "approved"
  | "rejected"
  | "comment"
  | "submission"
  | "reminder"
  | "account";

export interface Notification {
  id: string;
  kind: NotificationKind;
  recipientId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  entryId?: string;
}

export type ActivityAction =
  | "created"
  | "submitted"
  | "approved"
  | "rejected"
  | "commented"
  | "edited";

export interface ActivityItem {
  id: string;
  action: ActivityAction;
  actorId: string;
  entryId?: string;
  moduleKey?: string;
  departmentId: string;
  createdAt: string;
  detail?: string;
}

export interface AuditRecord {
  id: string;
  actorId: string;
  action: ActivityAction | "deactivated" | "role_changed" | "exported" | "deleted" | "archived" | "activated";
  entity: string;
  entityId: string;
  departmentId?: string;
  createdAt: string;
  diff?: { field: string; from: string; to: string }[];
}

export interface WebinarSeriesEntry {
  id: string;
  seriesNumber: number;
  scheduledDate: string;
  topic: string;
  speaker: string;
  speakerDesignation: string;
  mode: "Online" | "Physical" | "Hybrid";
  status: "Planned" | "Confirmed" | "Completed" | "Cancelled";
  notes?: string;
}
