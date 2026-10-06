import { useRivet } from "../../lib/rivet/store";
import { users, departments, modules, userName, departmentName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { formatDateTime } from "../../lib/formatDate";

export function AdminDashboard() {
  const { reviewQueue, audit } = useRivet();

  const activeUsers = users.filter((u) => u.active).length;
  const activeModules = modules.filter((m) => m.active).length;
  const pendingApprovals = reviewQueue.length;

  const recentAudit = audit.slice(0, 10);

  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      submitted: "bg-amber-100 text-amber-800",
    };
    const cls = map[action] ?? "bg-slate-100 text-slate-700";
    return (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize whitespace-nowrap ${cls}`}
      >
        {action.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">System Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-level organizational activity and system health.
        </p>
      </div>

      {/* Summary stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Active Users", value: activeUsers },
          { label: "Departments", value: departments.length },
          { label: "Active Modules", value: activeModules },
          { label: "Pending Approvals", value: pendingApprovals, highlight: pendingApprovals > 0 },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className={`rounded-lg border px-4 py-3 ${
              highlight
                ? "border-amber-200 bg-amber-50"
                : "border-border bg-background"
            }`}
          >
            <p className={`text-xs font-medium ${highlight ? "text-amber-700" : "text-muted-foreground"}`}>
              {label}
            </p>
            <p className={`mt-1 text-2xl font-bold tracking-tight ${highlight ? "text-amber-700" : "text-foreground"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          to="/app/admin/users"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Manage Users <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/app/admin/departments"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Manage Departments <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/app/approvals"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Review Queue <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/app/admin/audit"
          className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Full Audit Log <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Audit log table */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Global Audit &amp; Activity Log
        </h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">Actor</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">Action</th>
                <th className="px-4 py-2.5 text-left">Entity</th>
                <th className="px-4 py-2.5 text-left whitespace-nowrap">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentAudit.length > 0 ? (
                recentAudit.map((record) => (
                  <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {userName(record.actorId)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{actionBadge(record.action)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {record.entity}{" "}
                      <span className="text-xs opacity-60 whitespace-nowrap">({record.entityId})</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {record.departmentId ? departmentName(record.departmentId) : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
