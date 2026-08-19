import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { moduleName, userName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import type { LogEntry } from "../../lib/rivet/types";

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    case "submitted":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <Clock className="h-3 w-3" /> Pending Review
        </span>
      );
  }
}

export function ManagerDashboard() {
  const user = useCurrentUser();
  const { reviewQueue, entries } = useRivet();

  const teamRecentDecisions = entries
    .filter((e) => user.departmentIds.includes(e.departmentId) && (e.status === "approved" || e.status === "rejected"))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Manager Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Review pending submissions and monitor team activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Submissions Requiring Review</h2>
          {reviewQueue.length > 0 ? (
            <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reviewQueue.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{userName(entry.authorId)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{moduleName(entry.moduleKey)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : entry.entryDate}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/app/approvals"
                          className="inline-flex items-center text-primary font-medium hover:text-primary-hover transition-colors"
                        >
                          Review <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-background">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-500/50 mb-3" />
              All caught up! No pending submissions to review.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Decisions</h2>
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <ul className="divide-y divide-border">
              {teamRecentDecisions.length > 0 ? (
                teamRecentDecisions.map((entry) => (
                  <li key={entry.id} className="p-4 hover:bg-surface transition-colors flex flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground">{userName(entry.authorId)}</p>
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">{moduleName(entry.moduleKey)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              ) : (
                <li className="p-8 text-center text-sm text-muted-foreground">No recent decisions in your departments.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
