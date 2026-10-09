/**
 * Session + application state.
 *
 * Authentication is not wired to a backend yet, so the signed-in identity is
 * resolved from a demo directory and persisted in localStorage. Every read goes
 * through a role-scoped selector, and every write goes through an action, so
 * replacing this provider with React Query + the real API is a local change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  canDecideEntry,
  canEditEntry,
  canReviewEntry,
} from "./permissions";
import {
  activity as seedActivity,
  auditRecords as seedAudit,
  logEntries as seedEntries,
  notifications as seedNotifications,
  campaigns as seedCampaigns,
  users,
  departments,
  modules as seedModules,
  getModule,
} from "./demo-data";
import type {
  ActivityItem,
  AuditRecord,
  Campaign,
  EntryStatus,
  LogEntry,
  Notification,
  NotificationKind,
  Role,
  User,
  Department,
  ModuleDef,
} from "./types";

const SESSION_KEY = "rivet.session.userId";

/** Demo identity chosen per role until Google sign-in resolves a real user. */
export const DEMO_USER_BY_ROLE: Record<Role, string> = {
  employee: "u-emp-1",
  manager: "u-mgr-research",
  admin: "u-admin",
};

export function startDemoSession(role: Role) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, DEMO_USER_BY_ROLE[role]);
}

function readStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

function getDiff(oldObj: any, updates: any) {
  const diff = [];
  for (const [k, v] of Object.entries(updates)) {
    const oldV = oldObj[k];
    if (JSON.stringify(oldV) !== JSON.stringify(v)) {
      diff.push({ field: k, from: String(oldV), to: String(v) });
    }
  }
  return diff.length > 0 ? diff : undefined;
}

interface RivetContextValue {
  ready: boolean;
  user: User | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  entries: LogEntry[];
  campaigns: Campaign[];
  notifications: Notification[];
  activity: ActivityItem[];
  audit: AuditRecord[];
  /** Entries the signed-in user is allowed to read. */
  visibleEntries: LogEntry[];
  myEntries: LogEntry[];
  reviewQueue: LogEntry[];
  approvalEntries: LogEntry[];
  myNotifications: Notification[];
  unreadCount: number;
  submitEntry: (id: string) => void;
  createEntry: (input: {
    moduleKey: string;
    values: Record<string, string | number | boolean>;
    entryDate: string;
    submit: boolean;
    campaignId?: string;
  }) => string;
  updateEntryValues: (id: string, values: Record<string, string | number | boolean>) => void;
  linkEntryToCampaign: (entryId: string, campaignId: string | undefined) => void;
  decide: (ids: string[], decision: "approved" | "rejected", remarks?: string) => void;
  addComment: (entryId: string, body: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  createCampaign: (input: Omit<Campaign, "id">) => string;
  updateCampaign: (id: string, updates: Partial<Omit<Campaign, "id">>) => void;
  users: User[];
  departments: Department[];
  modules: ModuleDef[];
  createUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  createDepartment: (dept: Omit<Department, "id">) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  createModule: (mod: Omit<ModuleDef, "key">) => void;
  updateModule: (key: string, updates: Partial<ModuleDef>) => void;
}

const RivetContext = createContext<RivetContextValue | null>(null);

let seq = 2000;
function nextId(prefix: string) {
  seq += 1;
  return `${prefix}-${seq}`;
}

export function RivetProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>(seedEntries);
  const [campaignList, setCampaignList] = useState<Campaign[]>(seedCampaigns);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [activity, setActivity] = useState<ActivityItem[]>(seedActivity);
  const [audit, setAudit] = useState<AuditRecord[]>(seedAudit);
  const [appUsers, setAppUsers] = useState<User[]>(users);
  const [appDepartments, setAppDepartments] = useState<Department[]>(departments);
  const [appModules, setAppModules] = useState<ModuleDef[]>(seedModules);

  useEffect(() => {
    setUserId(readStoredUserId());
    setReady(true);
  }, []);

  const user = useMemo(() => appUsers.find((u) => u.id === userId) ?? null, [userId, appUsers]);

  // System reminders
  useEffect(() => {
    if (!user) return;
    const now = new Date().toISOString();

    if (user.role === "employee") {
      setNotifications((prev) => {
        const hasReminder = prev.some((n) => n.recipientId === user.id && n.kind === "reminder" && n.title === "Missing Daily Submission");
        if (!hasReminder) {
          return [{
            id: nextId("n"),
            kind: "reminder",
            recipientId: user.id,
            title: "Missing Daily Submission",
            body: "You haven't submitted your Daily Activity for today.",
            createdAt: now,
            read: false,
          }, ...prev];
        }
        return prev;
      });
    }

    if (user.role === "manager") {
      const pendingCount = entries.filter((e) => e.status === "submitted" && user.departmentIds.includes(e.departmentId)).length;
      if (pendingCount > 1) {
        setNotifications((prev) => {
          const hasReminder = prev.some((n) => n.recipientId === user.id && n.kind === "reminder" && n.title === "Multiple pending entries");
          if (!hasReminder) {
            return [{
              id: nextId("n"),
              kind: "reminder",
              recipientId: user.id,
              title: "Multiple pending entries",
              body: `You have ${pendingCount} entries awaiting your review.`,
              createdAt: now,
              read: false,
            }, ...prev];
          }
          return prev;
        });
      }
    }
  }, [user, entries]);

  const signIn = useCallback((id: string) => {
    window.localStorage.setItem(SESSION_KEY, id);
    setUserId(id);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUserId(null);
  }, []);

  const visibleEntries = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return entries;
    if (user.role === "manager") {
      return entries.filter(
        (e) => user.departmentIds.includes(e.departmentId) && e.status !== "draft",
      );
    }
    // Employees: own entries + all non-draft entries from department-scoped modules they belong to
    return entries.filter((e) => {
      if (e.authorId === user.id) return true;
      // Department-scoped modules: employees can see all non-draft entries in their department
      const mod = getModule(e.moduleKey);
      if (mod?.scope === "department" && user.departmentIds.includes(e.departmentId) && e.status !== "draft") {
        return true;
      }
      return false;
    });
  }, [entries, user]);

  const myEntries = useMemo(
    () => (user ? entries.filter((e) => e.authorId === user.id) : []),
    [entries, user],
  );

  const reviewQueue = useMemo(() => {
    if (!user || user.role === "employee") return [];
    const scoped =
      user.role === "admin"
        ? entries
        : entries.filter((e) => user.departmentIds.includes(e.departmentId));
    return scoped
      .filter((e) => e.status === "submitted")
      .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""));
  }, [entries, user]);

  const approvalEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.status !== "draft" && canReviewEntry(user, entry))
        .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? "")),
    [entries, user],
  );

  const myNotifications = useMemo(
    () =>
      user
        ? notifications
            .filter((n) => n.recipientId === user.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        : [],
    [notifications, user],
  );

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const logActivity = useCallback((item: Omit<ActivityItem, "id" | "createdAt">) => {
    setActivity((prev) => [
      { ...item, id: nextId("a"), createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const logAudit = useCallback((item: Omit<AuditRecord, "id" | "createdAt">) => {
    setAudit((prev) => [{ ...item, id: nextId("au"), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const submitEntry = useCallback(
    (id: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "submitted" as EntryStatus, submittedAt: now, updatedAt: now }
            : e,
        ),
      );
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        logActivity({
          action: "submitted",
          actorId: user.id,
          entryId: id,
          moduleKey: entry.moduleKey,
          departmentId: entry.departmentId,
        });
        logAudit({
          actorId: user.id,
          action: "submitted",
          entity: "Log Entry",
          entityId: id,
          departmentId: entry.departmentId,
        });
        const managers = users.filter((u) => u.role === "manager" && u.departmentIds.includes(entry.departmentId));
        if (managers.length > 0) {
          const modName = getModule(entry.moduleKey)?.name ?? "Entry";
          setNotifications((prev) => [
            ...managers.map((m) => ({
              id: nextId("n"),
              kind: "submission" as NotificationKind,
              recipientId: m.id,
              title: `New Submission: ${modName}`,
              body: `${user.name} submitted an entry for ${entry.entryDate}.`,
              createdAt: now,
              read: false,
              entryId: id,
            })),
            ...prev,
          ]);
        }
      }
    },
    [entries, logActivity, logAudit, user],
  );

  const createEntry = useCallback<RivetContextValue["createEntry"]>(
    ({ moduleKey, values, entryDate, submit, campaignId }) => {
      if (!user) return "";
      const mod = getModule(moduleKey);
      const now = new Date().toISOString();
      const id = `E-${1100 + entries.length}`;
      const entry: LogEntry = {
        id,
        moduleKey,
        departmentId: mod?.departmentId ?? user.departmentIds[0],
        authorId: user.id,
        entryDate,
        status: submit ? "submitted" : "draft",
        values,
        campaignId: campaignId || undefined,
        createdAt: now,
        updatedAt: now,
        submittedAt: submit ? now : undefined,
        comments: [],
      };
      setEntries((prev) => [entry, ...prev]);
      logActivity({
        action: submit ? "submitted" : "created",
        actorId: user.id,
        entryId: id,
        moduleKey,
        departmentId: entry.departmentId,
      });
      logAudit({
        actorId: user.id,
        action: submit ? "submitted" : "created",
        entity: "Log Entry",
        entityId: id,
        departmentId: entry.departmentId,
      });
      if (submit) {
        const managers = users.filter((u) => u.role === "manager" && u.departmentIds.includes(entry.departmentId));
        if (managers.length > 0) {
          setNotifications((prev) => [
            ...managers.map((m) => ({
              id: nextId("n"),
              kind: "submission" as NotificationKind,
              recipientId: m.id,
              title: `New Submission: ${mod?.name ?? "Entry"}`,
              body: `${user.name} submitted an entry for ${entryDate}.`,
              createdAt: now,
              read: false,
              entryId: id,
            })),
            ...prev,
          ]);
        }
      }
      return id;
    },
    [entries.length, logActivity, logAudit, user],
  );

  const linkEntryToCampaign = useCallback<RivetContextValue["linkEntryToCampaign"]>(
    (entryId, campaignId) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, campaignId: campaignId || undefined, updatedAt: new Date().toISOString() } : e,
        ),
      );
    },
    [],
  );

  const updateEntryValues = useCallback<RivetContextValue["updateEntryValues"]>(
    (id, values) => {
      if (!user) return;
      const entry = entries.find((item) => item.id === id);
      if (!entry || !canEditEntry(user, entry)) return;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                values: { ...e.values, ...values },
                updatedAt: now,
                editedByManager: user.role !== "employee" ? true : e.editedByManager,
              }
            : e,
        ),
      );
      const diff = Object.entries(values)
        .filter(([field, value]) => entry.values[field] !== value)
        .map(([field, value]) => ({
          field,
          from: String(entry.values[field] ?? ""),
          to: String(value),
        }));
      if (diff.length > 0) {
        logAudit({ actorId: user.id, action: "edited", entity: "Log Entry", entityId: id, departmentId: entry.departmentId, diff });
      }
    },
    [entries, logAudit, user],
  );

  const decide = useCallback<RivetContextValue["decide"]>(
    (ids, decision, remarks) => {
      if (!user) return;
      const eligibleEntries = ids
        .map((id) => entries.find((entry) => entry.id === id))
        .filter((entry): entry is LogEntry => !!entry && canDecideEntry(user, entry, decision, remarks));
      if (eligibleEntries.length === 0) return;
      const eligibleIds = eligibleEntries.map((entry) => entry.id);
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          eligibleIds.includes(e.id)
            ? {
                ...e,
                status: decision,
                decidedAt: now,
                decidedById: user.id,
                managerRemarks: remarks || e.managerRemarks,
                updatedAt: now,
              }
            : e,
        ),
      );
      eligibleEntries.forEach((entry) => {
        const id = entry.id;
        logActivity({
          action: decision === "approved" ? "approved" : "rejected",
          actorId: user.id,
          entryId: id,
          moduleKey: entry.moduleKey,
          departmentId: entry.departmentId,
          detail: remarks,
        });
        logAudit({
          actorId: user.id,
          action: decision === "approved" ? "approved" : "rejected",
          entity: "Log Entry",
          entityId: id,
          departmentId: entry.departmentId,
        });
        setNotifications((prev) => [
          {
            id: nextId("n"),
            kind: decision === "approved" ? "approved" : "rejected",
            recipientId: entry.authorId,
            title: `${getModule(entry.moduleKey)?.name ?? "Entry"} for ${entry.entryDate} was ${decision}`,
            body: remarks ? remarks : `${decision === "approved" ? "Approved" : "Rejected"} by ${user.name}.`,
            createdAt: now,
            read: false,
            entryId: id,
          },
          ...prev,
        ]);
      });
    },
    [entries, logActivity, logAudit, user],
  );

  const addComment = useCallback<RivetContextValue["addComment"]>(
    (entryId, body) => {
      if (!user) return;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                comments: [
                  ...e.comments,
                  { id: nextId("cm"), authorId: user.id, body, createdAt: now },
                ],
              }
            : e,
        ),
      );
      const entry = entries.find((e) => e.id === entryId);
      if (entry) {
        logActivity({
          action: "commented",
          actorId: user.id,
          entryId,
          moduleKey: entry.moduleKey,
          departmentId: entry.departmentId,
        });

        const modName = getModule(entry.moduleKey)?.name ?? "Entry";
        const isAuthor = entry.authorId === user.id;
        
        let recipients: string[] = [];
        if (isAuthor) {
          recipients = users.filter((u) => u.role === "manager" && u.departmentIds.includes(entry.departmentId)).map(u => u.id);
        } else {
          recipients = [entry.authorId];
        }

        if (recipients.length > 0) {
          setNotifications((prev) => [
            ...recipients.map((id) => ({
              id: nextId("n"),
              kind: "comment" as NotificationKind,
              recipientId: id,
              title: `New Comment: ${modName}`,
              body: `${user.name} commented: "${body.substring(0, 30)}${body.length > 30 ? '...' : ''}"`,
              createdAt: now,
              read: false,
              entryId,
            })),
            ...prev,
          ]);
        }
      }
    },
    [entries, logActivity, user],
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (user && n.recipientId === user.id ? { ...n, read: true } : n)),
    );
  }, [user]);

  const createCampaign = useCallback<RivetContextValue["createCampaign"]>(
    (input) => {
      const id = nextId("c");
      setCampaignList((prev) => [{ ...input, id }, ...prev]);
      logAudit({ actorId: user?.id ?? "", action: "created", entity: "Campaign", entityId: id, departmentId: input.departmentId });
      return id;
    },
    [logAudit, user],
  );

  const updateCampaign = useCallback<RivetContextValue["updateCampaign"]>(
    (id, updates) => {
      setCampaignList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
      logAudit({ actorId: user?.id ?? "", action: "edited", entity: "Campaign", entityId: id });
    },
    [logAudit, user],
  );

  const createUser = useCallback<RivetContextValue["createUser"]>((input) => {
    const id = `u-${input.role}-${Date.now().toString().slice(-4)}`;
    const newUser = { ...input, id };
    users.push(newUser);
    setAppUsers([...users]);
    logAudit({ actorId: user?.id ?? "", action: "created", entity: "User", entityId: id });
  }, [logAudit, user]);

  const updateUser = useCallback<RivetContextValue["updateUser"]>((id, updates) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const oldUser = users[idx];
      let action: "edited" | "role_changed" | "deactivated" = "edited";
      if (updates.active === false && oldUser.active === true) action = "deactivated";
      else if (updates.role && updates.role !== oldUser.role) action = "role_changed";
      
      const diff = getDiff(oldUser, updates);
      users[idx] = { ...oldUser, ...updates };
      setAppUsers([...users]);
      logAudit({ actorId: user?.id ?? "", action, entity: "User", entityId: id, diff });
    }
  }, [logAudit, user]);

  const createDepartment = useCallback<RivetContextValue["createDepartment"]>((input) => {
    const id = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newDept = { ...input, id };
    departments.push(newDept);
    setAppDepartments([...departments]);
    logAudit({ actorId: user?.id ?? "", action: "created", entity: "Department", entityId: id });
  }, [logAudit, user]);

  const updateDepartment = useCallback<RivetContextValue["updateDepartment"]>((id, updates) => {
    const idx = departments.findIndex(d => d.id === id);
    if (idx !== -1) {
      const diff = getDiff(departments[idx], updates);
      departments[idx] = { ...departments[idx], ...updates };
      setAppDepartments([...departments]);
      logAudit({ actorId: user?.id ?? "", action: "edited", entity: "Department", entityId: id, diff });
    }
  }, [logAudit, user]);

  const deleteDepartment = useCallback<RivetContextValue["deleteDepartment"]>((id) => {
    const hasUsers = users.some(u => u.departmentIds.includes(id));
    const hasModules = seedModules.some(m => m.departmentId === id);
    const hasEntries = entries.some(e => e.departmentId === id);
    const hasAudit = audit.some(a => a.departmentId === id);
    const hasLinks = hasUsers || hasModules || hasEntries || hasAudit;

    const idx = departments.findIndex(d => d.id === id);
    if (idx !== -1) {
      if (hasLinks) {
        // Soft archive
        departments[idx] = { ...departments[idx], deleted: true, active: false };
        setAppDepartments([...departments]);
        logAudit({ actorId: user?.id ?? "", action: "archived", entity: "Department", entityId: id });
      } else {
        // Hard delete
        departments.splice(idx, 1);
        setAppDepartments([...departments]);
        logAudit({ actorId: user?.id ?? "", action: "deleted", entity: "Department", entityId: id });
      }
    }
  }, [logAudit, user, entries, audit]);

  const createModule = useCallback<RivetContextValue["createModule"]>((input) => {
    const key = input.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newMod = { ...input, key };
    seedModules.push(newMod);
    setAppModules([...seedModules]);
    logAudit({ actorId: user?.id ?? "", action: "created", entity: "Module", entityId: key, departmentId: input.departmentId });
  }, [logAudit, user]);

  const updateModule = useCallback<RivetContextValue["updateModule"]>((key, updates) => {
    const idx = seedModules.findIndex(m => m.key === key);
    if (idx !== -1) {
      const diff = getDiff(seedModules[idx], updates);
      seedModules[idx] = { ...seedModules[idx], ...updates };
      setAppModules([...seedModules]);
      logAudit({ actorId: user?.id ?? "", action: "edited", entity: "Module", entityId: key, diff });
    }
  }, [logAudit, user]);

  const value: RivetContextValue = useMemo(() => ({
    ready,
    user,
    signIn,
    signOut,
    entries,
    campaigns: campaignList,
    notifications,
    activity,
    audit,
    visibleEntries,
    myEntries,
    reviewQueue,
    approvalEntries,
    myNotifications,
    unreadCount,
    submitEntry,
    createEntry,
    updateEntryValues,
    linkEntryToCampaign,
    decide,
    addComment,
    markRead,
    markAllRead,
    createCampaign,
    updateCampaign,
    users: appUsers,
    departments: appDepartments,
    modules: appModules,
    createUser,
    updateUser,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createModule,
    updateModule,
  }), [
    ready, user, signIn, signOut, entries, campaignList, notifications, activity, audit, 
    visibleEntries, myEntries, reviewQueue, approvalEntries, myNotifications, unreadCount, 
    submitEntry, createEntry, updateEntryValues, linkEntryToCampaign, decide, addComment, 
    markRead, markAllRead, createCampaign, updateCampaign, appUsers, appDepartments, 
    appModules, createUser, updateUser, createDepartment, updateDepartment, 
    deleteDepartment, createModule, updateModule
  ]);

  return <RivetContext.Provider value={value}>{children}</RivetContext.Provider>;
}

export function useRivet() {
  const ctx = useContext(RivetContext);
  if (!ctx) throw new Error("useRivet must be used inside RivetProvider");
  return ctx;
}

export function useCurrentUser(): User {
  const { user } = useRivet();
  if (!user) throw new Error("No signed-in user");
  return user;
}
