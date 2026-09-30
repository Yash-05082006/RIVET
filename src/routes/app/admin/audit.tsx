import { createFileRoute, redirect } from "@tanstack/react-router";
import { useRivet } from "../../../lib/rivet/store";
import { users } from "../../../lib/rivet/demo-data";

export const Route = createFileRoute("/app/admin/audit")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const storedId = window.localStorage.getItem("rivet.session.userId");
      const user = users.find(u => u.id === storedId);
      if (!user || user.role !== "admin") {
        throw redirect({ to: "/app/dashboard" });
      }
    }
  },
  component: AuditAdminPage,
});

function AuditAdminPage() {
  const { audit } = useRivet();

  function actorName(id: string) {
    return users.find((u) => u.id === id)?.name ?? id;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Immutable record of all system actions. Read-only.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {audit.length > 0 ? (
              audit.map((record) => (
                <tr key={record.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{actorName(record.actorId)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-xs font-medium text-foreground ring-1 ring-inset ring-border capitalize">
                      {record.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{record.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{record.entityId}</td>
                </tr>
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
