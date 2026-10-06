import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Plus, TrendingUp, Calendar } from "lucide-react";
import { getModule, departmentName, userName } from "../../../../lib/rivet/demo-data";
import { useRivet, useCurrentUser } from "../../../../lib/rivet/store";
import { canCreateIn } from "../../../../lib/rivet/nav";
import type { LogEntry } from "../../../../lib/rivet/types";
import { formatDate } from "../../../../lib/formatDate";

export const Route = createFileRoute("/app/modules/$moduleKey/")({
  component: ModuleDetailPage,
});

const STATUS_CONFIG: Record<
  LogEntry["status"],
  { label: string; classes: string }
> = {
  draft: { label: "Draft", classes: "bg-slate-50 text-slate-600 ring-slate-500/10" },
  submitted: { label: "Under Review", classes: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  approved: { label: "Approved", classes: "bg-green-50 text-green-700 ring-green-600/20" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 ring-red-600/10" },
};

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Computed summary panels for data-management modules               */
/* ------------------------------------------------------------------ */

interface SummaryCard {
  label: string;
  value: string | number;
  subtitle?: string;
}

/** Weekly Meeting Report: monthly and cumulative totals */
function WeeklyMeetingSummary({ entries }: { entries: LogEntry[] }) {
  const approved = entries.filter((e) => e.status === "approved" || e.status === "submitted");
  if (approved.length === 0) return null;

  // Group by month (YYYY-MM)
  const byMonth = new Map<string, LogEntry[]>();
  approved.forEach((e) => {
    const month = String(e.values.weekEnding ?? "").slice(0, 7);
    if (!month) return;
    const group = byMonth.get(month) ?? [];
    group.push(e);
    byMonth.set(month, group);
  });

  // Cumulative totals across all approved/submitted
  const totalPhysical = approved.reduce((s, e) => s + (Number(e.values.physicalMeetings) || 0), 0);
  const totalOnline = approved.reduce((s, e) => s + (Number(e.values.onlineMeetings) || 0), 0);
  const totalCalls = approved.reduce((s, e) => s + (Number(e.values.calls) || 0), 0);
  const totalService = approved.reduce((s, e) => s + (Number(e.values.serviceCalls) || 0) + (Number(e.values.serviceMeetings) || 0), 0);

  const cards: SummaryCard[] = [
    { label: "Physical Meetings", value: totalPhysical, subtitle: "Cumulative" },
    { label: "Online Meetings", value: totalOnline, subtitle: "Cumulative" },
    { label: "Calls", value: totalCalls, subtitle: "Cumulative" },
    { label: "Service (calls + meetings)", value: totalService, subtitle: "Cumulative" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Cumulative Summary</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-background p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
            {c.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{c.subtitle}</p>}
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      {byMonth.size > 0 && (
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto mt-3">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                <th className="px-4 py-2.5 whitespace-nowrap">Month</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Physical</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Online</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Calls</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Service Calls</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Service Meetings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...byMonth.entries()]
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, monthEntries]) => (
                  <tr key={month} className="hover:bg-surface/50">
                    <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{month}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {monthEntries.reduce((s, e) => s + (Number(e.values.physicalMeetings) || 0), 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {monthEntries.reduce((s, e) => s + (Number(e.values.onlineMeetings) || 0), 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {monthEntries.reduce((s, e) => s + (Number(e.values.calls) || 0), 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {monthEntries.reduce((s, e) => s + (Number(e.values.serviceCalls) || 0), 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      {monthEntries.reduce((s, e) => s + (Number(e.values.serviceMeetings) || 0), 0)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** Daily Meeting Attendance: daily + monthly totals per person and team */
function AttendanceSummary({ entries, isManager }: { entries: LogEntry[]; isManager: boolean }) {
  const relevant = entries.filter((e) => e.status === "approved" || e.status === "submitted");
  if (relevant.length === 0) return null;

  // Personal totals (current user's entries)
  const totalPhysical = relevant.reduce((s, e) => s + (Number(e.values.physical) || 0), 0);
  const totalZoom = relevant.reduce((s, e) => s + (Number(e.values.zoom) || 0), 0);
  const totalBeyond = relevant.reduce((s, e) => s + (Number(e.values.beyond) || 0), 0);

  const cards: SummaryCard[] = [
    { label: "Physical Attended", value: totalPhysical },
    { label: "Zoom Attended", value: totalZoom },
    { label: "Beyond Sessions", value: totalBeyond },
    { label: "Total Meetings", value: totalPhysical + totalZoom + totalBeyond },
  ];

  // If manager, show per-person breakdown
  const byAuthor = isManager ? new Map<string, LogEntry[]>() : null;
  if (byAuthor) {
    relevant.forEach((e) => {
      const group = byAuthor.get(e.authorId) ?? [];
      group.push(e);
      byAuthor.set(e.authorId, group);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {isManager ? "Team Attendance Summary" : "My Attendance Summary"}
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-background p-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Per-person breakdown for managers */}
      {byAuthor && byAuthor.size > 0 && (
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto mt-3">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                <th className="px-4 py-2.5">Team Member</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Physical</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Zoom</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Beyond</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...byAuthor.entries()].map(([authorId, authorEntries]) => {
                const p = authorEntries.reduce((s, e) => s + (Number(e.values.physical) || 0), 0);
                const z = authorEntries.reduce((s, e) => s + (Number(e.values.zoom) || 0), 0);
                const b = authorEntries.reduce((s, e) => s + (Number(e.values.beyond) || 0), 0);
                return (
                  <tr key={authorId} className="hover:bg-surface/50">
                    <td className="px-4 py-2.5 font-medium text-foreground">{userName(authorId)}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{p}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{z}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{b}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-foreground">{p + z + b}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                               */
/* ------------------------------------------------------------------ */

function ModuleDetailPage() {
  const { moduleKey } = Route.useParams();
  const user = useCurrentUser();
  const { myEntries, visibleEntries } = useRivet();
  const navigate = useNavigate();

  const mod = getModule(moduleKey);

  if (!mod) {
    return (
      <div className="space-y-4">
        <Link to="/app/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  const canCreate = canCreateIn(user, moduleKey);

  // Department-scoped modules (like webinar planner) show entries for the whole department.
  // Employee-scoped modules show only the user's entries for employees, all visible for managers/admins.
  const moduleEntries = useMemo(() => {
    if (mod.scope === "department") {
      // Department-scoped: all visible entries for this module
      return visibleEntries
        .filter((e) => e.moduleKey === moduleKey)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    // Employee-scoped
    return (user.role === "employee" ? myEntries : visibleEntries)
      .filter((e) => e.moduleKey === moduleKey)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [mod.scope, moduleKey, myEntries, visibleEntries, user.role]);

  // Determine which table columns to show from ModuleDef.tableFields
  const tableFieldDefs = mod.fields.filter((f) => mod.tableFields.includes(f.key));

  // For manager/admin views, show author column for all entries
  const showAuthorColumn = user.role !== "employee";

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <Link
          to="/app/modules"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>{departmentName(mod.departmentId)}</span>
              <span>·</span>
              <span className="capitalize">{mod.cadence} submission</span>
              {mod.approvalRequired && (
                <>
                  <span>·</span>
                  <span>Manager approval required</span>
                </>
              )}
              {mod.scope === "department" && (
                <>
                  <span>·</span>
                  <span className="text-primary font-medium">Shared department view</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{mod.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{mod.description}</p>
          </div>

          {canCreate && (
            <button
              onClick={() => navigate({ to: "/app/modules/$moduleKey/new", params: { moduleKey } })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" /> New Entry
            </button>
          )}
        </div>
      </div>

      {/* Auto-computed summary panels */}
      {moduleKey === "weekly-meeting-report" && <WeeklyMeetingSummary entries={moduleEntries} />}
      {moduleKey === "daily-meeting-attendance" && (
        <AttendanceSummary entries={moduleEntries} isManager={user.role !== "employee"} />
      )}

      {/* Entry table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {mod.scope === "department"
            ? "All Entries"
            : user.role === "employee"
              ? "My Entries"
              : "Entries"}
        </h2>
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                {showAuthorColumn && (
                  <th className="px-4 py-3 whitespace-nowrap">Author</th>
                )}
                {tableFieldDefs.map((f) => (
                  <th
                    key={f.key}
                    className="px-4 py-3 whitespace-nowrap"
                  >
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {moduleEntries.length > 0 ? (
                moduleEntries.map((entry) => {
                  const isDraft = entry.status === "draft";
                  const isRejected = entry.status === "rejected";
                  const isOwner = entry.authorId === user.id;
                  const canEdit = isOwner && (isDraft || isRejected);

                  return (
                    <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                      {showAuthorColumn && (
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {userName(entry.authorId)}
                        </td>
                      )}
                      {tableFieldDefs.map((f) => {
                        const isShortOrDate =
                          f.type === "date" ||
                          f.type === "month" ||
                          f.type === "time" ||
                          f.type === "auto" ||
                          f.key === "date" ||
                          f.key === "dayOfWeek";
                        return (
                          <td
                            key={f.key}
                            className={`px-4 py-3 text-muted-foreground ${
                              isShortOrDate ? "whitespace-nowrap" : "max-w-[250px] truncate"
                            }`}
                            title={!isShortOrDate ? String(entry.values[f.key] ?? "") : undefined}
                          >
                            {f.type === "date" ? formatDate(String(entry.values[f.key] ?? "")) : String(entry.values[f.key] ?? "")}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {canEdit ? (
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                          >
                            {isRejected ? "Fix & Resubmit" : "Continue editing"}
                          </Link>
                        ) : (
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={tableFieldDefs.length + (showAuthorColumn ? 3 : 2)}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No entries yet.
                    {canCreate && (
                      <span>
                        {" "}
                        <button
                          onClick={() => navigate({ to: "/app/modules/$moduleKey/new", params: { moduleKey } })}
                          className="text-primary font-medium hover:underline"
                        >
                          Create the first entry.
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
