import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { moduleName, userName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import type { LogEntry } from "../../lib/rivet/types";
import { formatDate, formatDateTime } from "../../lib/formatDate";
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
  const { reviewQueue, entries, activity } = useRivet();

  const teamRecentDecisions = entries
    .filter(
      (e) =>
        user.departmentIds.includes(e.departmentId) &&
        (e.status === "approved" || e.status === "rejected")
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  const teamActivity = activity
    .filter((a) => user.departmentIds.includes(a.departmentId))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Manager Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review pending submissions and monitor team activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main column - review queue */}
        <div className="space-y-6 lg:col-span-2">
          
          <ActivityFeed activities={teamActivity} title="Team Activity" />

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
