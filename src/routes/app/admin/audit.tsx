import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/audit")({
  component: AuditAdminPage,
});

function AuditAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Immutable system audit trail.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Audit log content will go here.
      </div>
    </div>
  );
}
