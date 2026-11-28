import { formatDate } from "../formatDate";
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
  useRef,
  useState,
  type ReactNode,
} from "react";

import { highestEntryNumber } from "./entryId";
import {
  canDecideEntry,
  canModule,
  hasPermission,
  canViewEntry,
  canEditEntry,
  canCreateFor,
  canReviewEntry,
} from "./permissions";
import {
  activity as seedActivity,
  auditRecords as seedAudit,
  logEntries as seedEntries,
  webinarSeries,
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

interface WebinarSuggestion {
  id: string;
  authorId: string;
  topic: string;
}

interface RivetContextValue {
  reminderTime: string;
  setReminderTime: (time: string) => void;
  webinarSuggestions: WebinarSuggestion[];
  suggestWebinar: (topic: string) => void;
  removeWebinarSuggestion: (id: string) => void;
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
    authorId?: string;
    values: Record<string, string | number | boolean>;
    entryDate: string;
    submit: boolean;
    campaignId?: string;
  }) => string;
  updateEntryValues: (id: string, values: Record<string, string | number | boolean>) => boolean;
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

export function hasDuplicateEntry(entries: LogEntry[], candidate: Pick<LogEntry, "moduleKey" | "authorId" | "entryDate" | "values">, existingId?: string) {
  const branch = candidate.moduleKey === "branch-wise-meeting-data";
  if (!branch && candidate.moduleKey !== "daily-activity-log") return false;
  return entries.some((entry) => entry.id !== existingId && entry.moduleKey === candidate.moduleKey &&
    entry.authorId === candidate.authorId && entry.entryDate === candidate.entryDate &&
    (!branch || (String(entry.values.branch ?? "").trim().toLowerCase() === String(candidate.values.branch ?? "").trim().toLowerCase() &&
      entry.values.meetingType === candidate.values.meetingType)));
}

export function RivetProvider({ children }: { children: ReactNode }) {
  const [reminderTimes, setReminderTimes] = useState<Record<string, string>>({});
  const [webinarSuggestions, setWebinarSuggestions] = useState<WebinarSuggestion[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>(() => [...seedEntries, ...webinarSeries.filter((webinar) => !seedEntries.some((entry) => entry.moduleKey === "webinar-series-planner" && Number(entry.values.seriesNumber) === webinar.seriesNumber)).map((webinar): LogEntry => ({
    id: webinar.id, moduleKey: "webinar-series-planner", departmentId: "data-management",
    authorId: DEMO_USER_BY_ROLE.admin, entryDate: webinar.scheduledDate, status: "approved",
    createdAt: webinar.scheduledDate, updatedAt: webinar.scheduledDate, comments: [],
    values: { ...webinar, notes: webinar.notes ?? "" },
  }))]);
  const entrySequence = useRef(highestEntryNumber(seedEntries));
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

  const user = useMemo(() => appUsers.find((u) => u.id === userId && u.active) ?? null, [userId, appUsers]);

  const reminderTime = user ? reminderTimes[user.id] ?? "18:00" : "18:00";
  const setReminderTime = useCallback((time: string) => {
    if (user && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) setReminderTimes((current) => ({ ...current, [user.id]: time }));
  }, [user]);

  const signIn = useCallback((id: string) => {
    window.localStorage.setItem(SESSION_KEY, id);
    setUserId(id);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUserId(null);
  }, []);

  const visibleEntries = useMemo(
    () => entries.filter((entry) => canViewEntry(user, entry)),
    [entries, user, appModules, appDepartments],
  );

  const myEntries = useMemo(
    () => visibleEntries.filter((entry) => entry.authorId === user?.id && entry.moduleKey !== "webinar-series-planner"),
    [visibleEntries, user],
  );

  const approvalEntries = useMemo(
    () => visibleEntries
      .filter((entry) => entry.status !== "draft" && canReviewEntry(user, entry))
      .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? "")),
    [visibleEntries, user],
  );

  const reviewQueue = useMemo(
    () => approvalEntries.filter((entry) => entry.status === "submitted"),
    [approvalEntries],
  );

  useEffect(() => {
    if (!user) return;
    function updateReminder() {
      const now = new Date();
      const day = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
      if (user && hasPermission(user, "review") && !hasPermission(user, "admin")) {
        if (now.getHours() < 9 || reviewQueue.length === 0) return;
        const id = `digest-${user.id}-${day}`;
        setNotifications((previous) => previous.some((item) => item.id === id) ? previous : [
          { id, recipientId: user.id, kind: "reminder", title: "Daily approval summary", body: `${reviewQueue.length} submissions await review. This is an in-app summary.`, createdAt: now.toISOString(), read: false },
          ...previous,
        ]);
        return;
      }
      if (hasPermission(user, "admin")) return;
      const dailyModules = appModules.filter((mod) => mod.cadence === "daily" && canModule(user, "create", mod.key));
      const submitted = myEntries.some((entry) => entry.entryDate === day && entry.status !== "draft" && dailyModules.some((mod) => mod.key === entry.moduleKey));
      const id = `daily-reminder-${user!.id}-${day}`;
      const clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const shouldRemind = dailyModules.length > 0 && !submitted && clock >= reminderTime;
      setNotifications((previous) => {
        const relevant = previous.filter((item) => !(item.recipientId === user!.id && item.kind === "reminder" && item.title === "Missing Daily Submission" && (item.id !== id || !shouldRemind)));
        if (shouldRemind && !relevant.some((item) => item.id === id)) {
          return [{ id, recipientId: user!.id, kind: "reminder", title: "Missing Daily Submission", body: "You have no daily submission for today.", createdAt: now.toISOString(), read: false }, ...relevant];
        }
        return relevant.length === previous.length ? previous : relevant;
      });
    }
    updateReminder();
    const timer = window.setInterval(updateReminder, 60_000);
    return () => window.clearInterval(timer);
  }, [user, myEntries, appModules, reminderTime, reviewQueue]);

  const suggestWebinar = useCallback((topic: string) => {
    if (!user || !canModule(user, "view", "webinar-series-planner") || !topic.trim()) return;
    setWebinarSuggestions((current) => [...current, { id: crypto.randomUUID(), authorId: user.id, topic: topic.trim() }]);
  }, [user]);

  const removeWebinarSuggestion = useCallback((id: string) => {
    if (!canModule(user, "create", "webinar-series-planner")) return;
    setWebinarSuggestions((current) => current.filter((suggestion) => suggestion.id !== id));
  }, [user]);

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
      const target = entries.find((entry) => entry.id === id);
      if (!user || !target || target.authorId !== user.id || !canEditEntry(user, target) || !getModule(target.moduleKey)?.approvalRequired) return;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "submitted" as EntryStatus,
                previousDecisions: e.decidedAt && e.status === "rejected" ? [...(e.previousDecisions ?? []), {
                  status: e.status, at: e.decidedAt, by: e.decidedById, remarks: e.managerRemarks,
                }] : e.previousDecisions,
                submittedAt: now, updatedAt: now, managerRemarks: undefined, decidedAt: undefined, decidedById: undefined }
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
        const managers = users.filter((u) => u.role === "manager" && canReviewEntry(u, entry));
        if (managers.length > 0) {
          const modName = getModule(entry.moduleKey)?.name ?? "Entry";
          setNotifications((prev) => [
            ...managers.map((m) => ({
              id: nextId("n"),
              kind: "submission" as NotificationKind,
              recipientId: m.id,
              title: `New Submission: ${modName}`,
              body: `${user.name} submitted an entry for ${formatDate(entry.entryDate)}.`,
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
    ({ moduleKey, values, entryDate, submit, campaignId, authorId }) => {
      const mod = getModule(moduleKey);
      const author = authorId ? users.find((person) => person.id === authorId) : user ?? undefined;
      if (!user || !mod || !author || !canCreateFor(user, author, moduleKey) || (author.id !== user.id && !submit)) return "";
      if (hasDuplicateEntry(entries, { moduleKey, authorId: author.id, entryDate, values })) return "";
      const pending = submit && mod.approvalRequired;
      const shared = !mod.approvalRequired;
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const displayId = `E-${++entrySequence.current}`;
      if (moduleKey === "webinar-series-planner") {
        const seriesNumber = Math.max(0, ...entries.filter((entry) => entry.moduleKey === moduleKey).map((entry) => Number(entry.values.seriesNumber) || 0)) + 1;
        values = { ...values, seriesNumber };
      }
      const entry: LogEntry = {
        id,
        displayId,
        moduleKey,
        departmentId: mod?.departmentId ?? user.departmentIds[0],
        authorId: author.id,
        entryDate,
        status: shared ? "approved" : pending ? "submitted" : "draft",
        values,
        campaignId: campaignId || undefined,
        createdAt: now,
        updatedAt: now,
        submittedAt: pending ? now : undefined,
        comments: [],
      };
      setEntries((prev) => [entry, ...prev]);
      logActivity({
        action: pending ? "submitted" : "created",
        actorId: user.id,
        entryId: id,
        moduleKey,
        departmentId: entry.departmentId,
      });
      logAudit({
        actorId: user.id,
        action: pending ? "submitted" : "created",
        entity: "Log Entry",
        entityId: id,
        departmentId: entry.departmentId,
      });
      if (pending) {
        const managers = users.filter((u) => u.role === "manager" && canReviewEntry(u, entry));
        if (managers.length > 0) {
          setNotifications((prev) => [
            ...managers.map((m) => ({
              id: nextId("n"),
              kind: "submission" as NotificationKind,
              recipientId: m.id,
              title: `New Submission: ${mod?.name ?? "Entry"}`,
              body: `${user.name} submitted an entry for ${formatDate(entryDate)}.`,
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
    [entries, logActivity, logAudit, user],
  );

  const linkEntryToCampaign = useCallback<RivetContextValue["linkEntryToCampaign"]>(
    (entryId, campaignId) => {
      const entry = entries.find((item) => item.id === entryId);
      if (!user || !entry || !canEditEntry(user, entry) || (campaignId && !campaignList.some((campaign) => campaign.id === campaignId && campaign.departmentId === entry.departmentId))) return;
      if (entry.campaignId === campaignId) return;
      logAudit({ actorId: user.id, action: "edited", entity: "Log Entry", entityId: entryId, departmentId: entry.departmentId,
        diff: [{ field: "campaignId", from: entry.campaignId ?? "", to: campaignId ?? "" }] });
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, campaignId: campaignId || undefined, updatedAt: new Date().toISOString() } : e,
        ),
      );
    },
    [entries, campaignList, logAudit, user],
  );

  const updateEntryValues = useCallback<RivetContextValue["updateEntryValues"]>(
    (id, values) => {
      if (!user) return false;
      const entry = entries.find((item) => item.id === id);
      if (!entry || !canEditEntry(user, entry)) return false;
      const dateKey = getModule(entry.moduleKey)?.fields.find((field) => field.type === "date" || field.type === "month")?.key;
      const entryDate = String((dateKey && values[dateKey]) || entry.entryDate);
      if (dateKey && !values[dateKey]) values = { ...values, [dateKey]: entryDate };
      if (hasDuplicateEntry(entries, { ...entry, entryDate, values: { ...entry.values, ...values } }, id)) return false;
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                values: { ...e.values, ...values },
                entryDate,
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
        logActivity({ actorId: user.id, action: "edited", entryId: id, moduleKey: entry.moduleKey, departmentId: entry.departmentId });
      }
      return true;
    },
    [entries, logActivity, logAudit, user],
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
                managerRemarks: remarks?.trim() || undefined,
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
          action: decision,
          entity: "Log Entry",
          entityId: id,
          departmentId: entry.departmentId,
          diff: [{ field: "status", from: entry.status, to: decision }, ...(remarks ? [{ field: "managerRemarks", from: "", to: remarks }] : [])],
        });
        setNotifications((prev) => [
          {
            id: nextId("n"),
            kind: decision === "approved" ? "approved" : "rejected",
            recipientId: entry.authorId,
            title: `${getModule(entry.moduleKey)?.name ?? "Entry"} for ${formatDate(entry.entryDate)} was ${decision}`,
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
      const target = entries.find((entry) => entry.id === entryId);
      if (!user || !target || !canViewEntry(user, target) || !body.trim()) return;
      const taggedEmails = new Set(Array.from(body.matchAll(/(?:^|\s)@([\w.+-]+@[\w.-]+\.[a-z]{2,})(?=$|[\s.,!?;:)])/gi), (match) => match[1].toLowerCase()));
      const mentions = users.filter((person) => person.id !== user.id && person.active &&
        canViewEntry(person, target) && taggedEmails.has(person.email.toLowerCase())).map((person) => person.id);
      const now = new Date().toISOString();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? {
                ...e,
                comments: [
                  ...e.comments,
                  { id: nextId("cm"), authorId: user.id, body: body.trim(), createdAt: now, mentions },
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
          mentions,
          entryId,
          moduleKey: entry.moduleKey,
          departmentId: entry.departmentId,
        });

        const modName = getModule(entry.moduleKey)?.name ?? "Entry";
        const isAuthor = entry.authorId === user.id;
        
        let recipients: string[] = [];
        if (isAuthor) {
          recipients = users.filter((u) => u.role === "manager" && canReviewEntry(u, entry)).map(u => u.id);
        } else {
          recipients = [entry.authorId];
        }

        recipients = [...new Set([...recipients, ...mentions])].filter((id) => id !== user.id && canViewEntry(users.find((person) => person.id === id) ?? null, entry));
        if (recipients.length > 0) {
          setNotifications((prev) => [
            ...recipients.map((id) => ({
              id: nextId("n"),
              kind: "comment" as NotificationKind,
              recipientId: id,
              title: mentions.includes(id) ? `Mentioned in ${modName}` : `New Comment: ${modName}`,
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
    setNotifications((prev) => prev.map((n) => (n.id === id && n.recipientId === user?.id ? { ...n, read: true } : n)));
  }, [user]);

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
    const key = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!key || seedModules.some((module) => module.key === key)) return;
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
    reminderTime,
    setReminderTime,
    webinarSuggestions: webinarSuggestions.filter((item) => canModule(user, "create", "webinar-series-planner") || item.authorId === user?.id),
    suggestWebinar,
    removeWebinarSuggestion,
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
    reminderTime, setReminderTime, webinarSuggestions, suggestWebinar, removeWebinarSuggestion, ready, user, signIn, signOut, entries, campaignList, notifications, activity, audit,
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
