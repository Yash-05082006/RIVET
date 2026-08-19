import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { modules, moduleName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { FileEdit, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
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
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
          <Clock className="h-3 w-3" /> Under Review
        </span>
      );
    case "draft":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
          <FileEdit className="h-3 w-3" /> Draft
        </span>
      );
  }
}

export function EmployeeDashboard() {
  const user = useCurrentUser();
  const { myEntries } = useRivet();

  const attentionRequired = myEntries.filter((e) => e.status === "rejected" || e.status === "draft");
  const recentWork = myEntries.filter((e) => e.status !== "rejected" && e.status !== "draft").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const accessibleModules = modules.filter(
    (m) => user.departmentIds.includes(m.departmentId) && m.createRoles.includes(user.role)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome, {user.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here is the status of your current work and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {attentionRequired.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Attention Required</h2>
              <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
                <ul className="divide-y divide-border">
                  {attentionRequired.map((entry) => (
                    <li key={entry.id} className="p-4 hover:bg-surface transition-colors flex items-start gap-4">
                      <div className="mt-0.5">
                        {entry.status === "rejected" ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <FileEdit className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{moduleName(entry.moduleKey)}</p>
                          <StatusBadge status={entry.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Entry Date: {entry.entryDate}</p>
                        {entry.managerRemarks && (
                          <div className="mt-2 text-sm bg-red-50/50 text-red-800 p-2 rounded border border-red-100">
                            <strong>Manager Note:</strong> {entry.managerRemarks}
                          </div>
                        )}
                        <div className="mt-3">
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey: entry.moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                          >
                            {entry.status === "rejected" ? "Fix & Resubmit" : "Continue"} &rarr;
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Recent Work</h2>
            {recentWork.length > 0 ? (
              <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3">Entry Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentWork.map((entry) => (
                      <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{moduleName(entry.moduleKey)}</td>
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
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No recent work found.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Accessible Modules</h2>
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <ul className="divide-y divide-border">
              {accessibleModules.map((m) => (
                <li key={m.key}>
                  <Link
                    to="/app/modules"
                    className="flex items-center justify-between p-4 hover:bg-surface transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{m.cadence} submission</p>
                    </div>
                    <div className="text-primary">&rarr;</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
