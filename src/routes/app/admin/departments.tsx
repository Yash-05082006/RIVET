import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/app/admin/departments")({
  component: DepartmentsAdminPage,
});

function DepartmentsAdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure department structure, manager assignments, and module access.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-background p-10 text-center shadow-sm">
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-4" />
        <p className="text-sm font-medium text-foreground">Department management is not yet available</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          This section will allow administrators to manage department configurations once the backend is connected.
        </p>
      </div>
    </div>
  );
}
