import { createFileRoute } from "@tanstack/react-router";
import { Fragment } from "react";
import { useRivet } from "../../../lib/rivet/store";
import { formatDateTime } from "../../../lib/formatDate";

export const Route = createFileRoute("/app/admin/audit")({
  component: AuditAdminPage,
});

function AuditAdminPage() {
  const { audit, users } = useRivet();

  function actorName(id: string) {
    return users.find((u) => u.id === id)?.name ?? id;
  }

  function formatFieldName(field: string) {
    const map: Record<string, string> = {
      active: "Status",
      deleted: "Archived/Deleted",
      name: "Name",
      role: "Role",
      departmentId: "Department",
      departmentIds: "Assigned Departments",
      description: "Description",
      cadence: "Submission Cadence",
      scope: "Data Scope",
      createRoles: "Submit Permissions",
      readRoles: "View Permissions",
      managerIds: "Managers",
      moduleKeys: "Modules",
      email: "Email",
      designation: "Designation"
    };
    return map[field] || field;
  }

  function formatValue(field: string, val: string) {
    if (val === "" || val === "undefined" || val === "null") return "None";
    if (field === "active") {
      return val === "true" ? "Active" : "Inactive";
    }
    if (field === "deleted") {
      return val === "true" ? "Deleted/Archived" : "Active";
    }
    return val;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Immutable record of all system actions. Read-only.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Timestamp</th>
              <th className="px-4 py-3 whitespace-nowrap">Actor</th>
              <th className="px-4 py-3 whitespace-nowrap">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3 whitespace-nowrap">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audit.length > 0 ? (
              audit.map((record) => (
                <Fragment key={record.id}>
                  <tr className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(record.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{actorName(record.actorId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border capitalize whitespace-nowrap">
                        {record.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{record.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{record.entityId}</td>
                  </tr>
                  {(() => {
                    const validDiffs = record.diff?.filter(d => d.from !== d.to);
                    if (!validDiffs || validDiffs.length === 0) return null;
                    return (
                      <tr className="bg-surface/30">
                        <td colSpan={5} className="px-4 py-2 border-t-0">
                          <div className="rounded-md border border-border/50 bg-background/50 p-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Changed Fields</h4>
                              <div className="text-[10px] font-medium flex items-center gap-3 bg-surface px-2 py-1 rounded border border-border">
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Previous value</span>
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> New value</span>
                              </div>
                            </div>
                            <ul className="space-y-1.5">
                              {validDiffs.map((d, i) => (
                                <li key={i} className="text-sm grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2">
                                  <span className="font-medium text-foreground">{formatFieldName(d.field)}:</span>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-red-500 line-through bg-red-500/10 px-1.5 py-0.5 rounded">{formatValue(d.field, d.from)}</span>
                                    <span className="text-muted-foreground text-xs">→</span>
                                    <span className="text-green-600 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">{formatValue(d.field, d.to)}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No audit records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
