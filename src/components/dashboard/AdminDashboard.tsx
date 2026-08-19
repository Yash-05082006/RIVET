import { useRivet } from "../../lib/rivet/store";
import { users, departments, modules, userName, departmentName } from "../../lib/rivet/demo-data";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function AdminDashboard() {
  const { reviewQueue, audit } = useRivet();

  const activeUsers = users.filter((u) => u.active).length;
  const activeModules = modules.filter((m) => m.active).length;
  const pendingApprovals = reviewQueue.length;

  const recentAudit = audit.slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">System Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">High-level organizational activity and system health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* System Summary Column */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Platform Stats</h2>
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <ul className="divide-y divide-border text-sm">
              <li className="p-4 flex justify-between items-center">
                <span className="text-muted-foreground">Active Users</span>
                <span className="font-semibold text-foreground">{activeUsers}</span>
              </li>
              <li className="p-4 flex justify-between items-center">
                <span className="text-muted-foreground">Departments</span>
                <span className="font-semibold text-foreground">{departments.length}</span>
              </li>
              <li className="p-4 flex justify-between items-center">
                <span className="text-muted-foreground">Active Modules</span>
                <span className="font-semibold text-foreground">{activeModules}</span>
              </li>
              <li className="p-4 flex justify-between items-center bg-amber-50/50">
                <span className="text-amber-700 font-medium">Pending Approvals</span>
                <span className="font-bold text-amber-700">{pendingApprovals}</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/app/admin/departments"
              className="text-sm font-medium text-primary hover:text-primary-hover flex items-center transition-colors"
            >
              Manage Organization <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Audit Log Column */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Global Audit & Activity Log</h2>
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAudit.length > 0 ? (
                  recentAudit.map((record) => (
                    <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{userName(record.actorId)}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          record.action === 'approved' ? 'bg-green-100 text-green-800' :
                          record.action === 'rejected' ? 'bg-red-100 text-red-800' :
                          record.action === 'submitted' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {record.action.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.entity} <span className="text-xs">({record.entityId})</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
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
        </div>

      </div>
    </div>
  );
}
