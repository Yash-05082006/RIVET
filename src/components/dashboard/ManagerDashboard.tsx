import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { getModule, moduleName, userName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import type { LogEntry } from "../../lib/rivet/types";
import { formatDate, formatDateTime } from "../../lib/formatDate";
import { addDays, startOfWeek, format } from "date-fns";
import * as XLSX from "xlsx";
import { canAccessDepartment, canCreateFor, hasPermission, accessibleModules } from "../../lib/rivet/permissions";
import { ActivityFeed } from "./ActivityFeed";

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 whitespace-nowrap">
          <CheckCircle2 className="h-3 w-3 shrink-0" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 whitespace-nowrap">
          <XCircle className="h-3 w-3 shrink-0" /> Rejected
        </span>
      );
    case "submitted":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 whitespace-nowrap">
          <Clock className="h-3 w-3 shrink-0" /> Pending Review
        </span>
      );
  }
}

export function ManagerDashboard() {
  const user = useCurrentUser();
  const { reviewQueue, visibleEntries: entries, activity, users } = useRivet();

  const teamRecentDecisions = entries
    .filter(
      (e) =>
        canAccessDepartment(user, e.departmentId) &&
        (e.status === "approved" || e.status === "rejected")
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  const teamActivity = activity
    .filter((event) => canAccessDepartment(user, event.departmentId) && (!event.entryId || entries.some((entry) => entry.id === event.entryId)))
    .slice(0, 50);

  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => format(addDays(startOfWeek(now, { weekStartsOn: 1 }), index), "yyyy-MM-dd"));
  const team = users.filter((person) => person.active && !hasPermission(person, "review") && person.departmentIds.some((id) => canAccessDepartment(user, id)));
  const dailyModules = accessibleModules(user).filter((mod) => mod.cadence === "daily");
  const grid = team.map((person) => ({
    person,
    cells: days.map((day, index) => {
      const records = entries.filter((entry) => entry.authorId === person.id && entry.entryDate === day);
      const entry = records.find((record) => record.status === "approved") ?? records.find((record) => record.status === "submitted") ?? records[0];
      return { day, entry, label: entry?.status === "approved" ? "Approved" : entry?.status === "submitted" ? "Pending" : index >= 5 ? "Weekend" : "No submission" };
    }),
  }));

  const month = format(now, "yyyy-MM");
  const monthlyEntries = entries.filter((entry) => entry.entryDate.startsWith(month) &&
    (entry.status === "submitted" || entry.status === "approved"));
  const monthlyModules = [...new Set(monthlyEntries.map((entry) => entry.moduleKey))].map((key) => {
    const fields = getModule(key)?.fields.filter((field) => field.type === "integer" || field.type === "decimal") ?? [];
    const records = monthlyEntries.filter((entry) => entry.moduleKey === key);
    return {
      key, count: records.length,
      metrics: fields.map((field) => {
        const totals = new Map<string, number>();
        for (const entry of records) {
          const value = Number(entry.values[field.key]);
          if (Number.isFinite(value)) totals.set(entry.authorId, (totals.get(entry.authorId) ?? 0) + value);
        }
        const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
        const highest = Math.max(0, ...totals.values());
        const leaders = highest > 0 ? [...totals].filter(([, value]) => value === highest).map(([id]) => userName(id)) : [];
        return { key: field.key, label: field.label, total, leaders };
      }),
    };
  });

  function exportGrid() {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([["Employee", ...days.map(formatDate)], ...grid.map(({ person, cells }) => [person.name, ...cells.map((cell) => cell.label)])]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Team submissions");
    XLSX.writeFile(workbook, `team-submissions-${days[0]}.xlsx`);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Manager Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending submissions and monitor team activity.
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center justify-between"><h2 className="font-medium">Team submissions this week</h2>
          <button onClick={exportGrid} disabled={!grid.length} className="rounded border px-2 py-1 text-sm">Export Excel</button></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr><th className="p-2">Employee</th>{days.map((day) => <th className="whitespace-nowrap p-2" key={day}>{formatDate(day)}</th>)}</tr></thead>
          <tbody>{grid.map(({ person, cells }) => <tr className="border-t" key={person.id}><th className="p-2">{person.name}</th>
            {cells.map(({ day, entry, label }) => <td className="whitespace-nowrap p-2" key={day}>{entry ?
              <Link className="text-primary" to="/app/modules/$moduleKey/entry/$entryId" params={{ moduleKey: entry.moduleKey, entryId: entry.id }} search={{ from: undefined }}>{label}</Link>
              : label === "No submission" ? <div className="space-y-1">
                <span>{label}</span>
                {dailyModules.filter((mod) => canCreateFor(user, person, mod.key)).map((mod) =>
                  <Link key={mod.key} className="block text-primary" to="/app/modules/$moduleKey/new" params={{ moduleKey: mod.key }} search={{ author: person.id, date: day }}>Add {mod.name}</Link>)}
              </div> : label}</td>)}</tr>)}</tbody>
        </table></div>
      </section>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main column - review queue */}
        <div className="space-y-6 lg:col-span-2">
          
          <ActivityFeed activities={teamActivity} title="Team Activity" />
          <section className="space-y-2 rounded-lg border border-border p-4 text-sm">
            <h2 className="font-medium">Department activity this month</h2>
            {monthlyModules.length === 0 && <p className="text-muted-foreground">No submissions this month.</p>}
            {monthlyModules.map(({ key, count, metrics }) => <div className="border-t border-border pt-2" key={key}>
              <h3 className="font-medium">{moduleName(key)} · {count} records</h3>
              {metrics.map((metric) => <p key={metric.key}>{metric.label} · {metric.total}
                {metric.leaders.length > 0 && <span className="text-muted-foreground"> · Highest by volume {metric.leaders.join(", ")}</span>}
              </p>)}
            </div>)}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Submissions Requiring Review
              </h2>
              {reviewQueue.length > 0 && (
                <Link
                  to="/app/approvals"
                  className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  View all &rarr;
                </Link>
              )}
            </div>
            {reviewQueue.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left whitespace-nowrap">Employee</th>
                      <th className="px-4 py-2.5 text-left">Module</th>
                      <th className="px-4 py-2.5 text-left whitespace-nowrap">Submitted</th>
                      <th className="px-4 py-2.5 text-left whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reviewQueue.map((entry) => (
                      <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          {userName(entry.authorId)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {moduleName(entry.moduleKey)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {entry.submittedAt
                            ? formatDate(entry.submittedAt)
                            : formatDate(entry.entryDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link
                            to="/app/approvals/$entryId"
                            params={{ entryId: entry.id }}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                          >
                            Review <ArrowRight className="h-3 w-3 shrink-0" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background p-10 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-green-400" />
                <p className="text-sm text-muted-foreground">
                  All caught up - no pending submissions.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right column - recent decisions */}
        <div>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Decisions
            </h2>
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <ul className="divide-y divide-border">
                {teamRecentDecisions.length > 0 ? (
                  teamRecentDecisions.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-surface transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {userName(entry.authorId)}
                        </p>
                        <StatusBadge status={entry.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{moduleName(entry.moduleKey)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.updatedAt)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No recent decisions in your departments.
                  </li>
                )}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
