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
  activity as seedActivity,
  auditRecords as seedAudit,
  logEntries as seedEntries,
  notifications as seedNotifications,
  campaigns as seedCampaigns,
  users,
  getModule,
} from "./demo-data";
import type {
  ActivityItem,
  AuditRecord,
  Campaign,
  EntryStatus,
  LogEntry,
  Notification,
  Role,
  User,
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

  useEffect(() => {
    setUserId(readStoredUserId());
    setReady(true);
  }, []);

  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [userId]);

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
      logAudit({ actorId: user.id, action: "edited", entity: "Log Entry", entityId: id });
    },
    [logAudit, user],
  );

  const decide = useCallback<RivetContextValue["decide"]>(
    (ids, decision, remarks) => {
      if (!user) return;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          ids.includes(e.id)
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
      ids.forEach((id) => {
        const entry = entries.find((e) => e.id === id);
        if (!entry) return;
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

  const value: RivetContextValue = {
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
  };

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
