import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { modules, moduleName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { FileEdit, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { LogEntry } from "../../lib/rivet/types";

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          <CheckCircle2 className="h-3 w-3" /> Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          <XCircle className="h-3 w-3" /> Rejected
        </span>
      );
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <Clock className="h-3 w-3" /> Under Review
        </span>
      );
    case "draft":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
          <FileEdit className="h-3 w-3" /> Draft
        </span>
      );
  }
}

export function EmployeeDashboard() {
  const user = useCurrentUser();
  const { myEntries } = useRivet();

  const attentionRequired = myEntries.filter(
    (e) => e.status === "rejected" || e.status === "draft"
  );
  const recentWork = myEntries
    .filter((e) => e.status !== "rejected" && e.status !== "draft")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  const accessibleModules = modules.filter(
    (m) => user.departmentIds.includes(m.departmentId) && m.createRoles.includes(user.role)
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back, {user.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is the status of your current work and pending actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">

          {/* Attention Required */}
          {attentionRequired.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attention Required
              </h2>
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <ul className="divide-y divide-border">
                  {attentionRequired.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-start gap-3 p-4 hover:bg-surface transition-colors"
                    >
                      <div className="mt-0.5 shrink-0">
                        {entry.status === "rejected" ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <FileEdit className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {moduleName(entry.moduleKey)}
                          </p>
                          <StatusBadge status={entry.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Entry Date: {entry.entryDate}
                        </p>
                        {entry.managerRemarks && (
                          <div className="mt-2 rounded border border-red-100 bg-red-50/50 px-3 py-2 text-xs text-red-800">
                            <span className="font-semibold">Manager note: </span>
                            {entry.managerRemarks}
                          </div>
                        )}
                        <div className="mt-2">
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey: entry.moduleKey, entryId: entry.id }}
                            search={{ from: "work" }}
                            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                          >
                            {entry.status === "rejected" ? "Fix & Resubmit" : "Continue"} &rarr;
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Recent Work */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Work
            </h2>
            {recentWork.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Module</th>
                      <th className="px-4 py-2.5 text-left">Entry Date</th>
                      <th className="px-4 py-2.5 text-left">Status</th>
                      <th className="px-4 py-2.5 text-left">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentWork.map((entry) => (
                      <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {moduleName(entry.moduleKey)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{entry.entryDate}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
                No recent work found.{" "}
                <Link to="/app/modules" className="text-primary hover:underline">
                  Browse modules
                </Link>{" "}
                to get started.
              </div>
            )}
          </section>
        </div>

        {/* Right column - 1/3 width */}
        <div>
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Modules
            </h2>
            {accessibleModules.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <ul className="divide-y divide-border">
                  {accessibleModules.map((m) => (
                    <li key={m.key}>
                      <Link
                        to="/app/modules/$moduleKey"
                        params={{ moduleKey: m.key }}
                        className="flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {m.cadence} submission
                          </p>
                        </div>
                        <span className="ml-2 shrink-0 text-muted-foreground">&rarr;</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No modules assigned.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
