import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/modules")({
  component: ModulesAdminPage,
});

function ModulesAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Modules & Access</h1>
        <p className="text-muted-foreground">Manage logging modules and role permissions.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Modules administration content will go here.
      </div>
    </div>
  );
}
