import { createFileRoute, redirect } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { users } from "../../../lib/rivet/demo-data";

export const Route = createFileRoute("/app/admin/users")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const storedId = window.localStorage.getItem("rivet.session.userId");
      const user = users.find(u => u.id === storedId);
      if (!user || user.role !== "admin") {
        throw redirect({ to: "/app/dashboard" });
      }
    }
  },
  component: UsersAdminPage,
});

function UsersAdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage user accounts, roles, and access across the organization.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-background p-10 text-center shadow-sm">
        <Clock className="mx-auto h-8 w-8 text-muted-foreground/40 mb-4" />
        <p className="text-sm font-medium text-foreground">User management is not yet available</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          This section will allow administrators to create, deactivate, and manage user roles once the backend is connected.
        </p>
      </div>
    </div>
  );
}
