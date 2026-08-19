import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/departments")({
  component: DepartmentsAdminPage,
});

function DepartmentsAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">Manage departments and active modules.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Departments administration content will go here.
      </div>
    </div>
  );
}
