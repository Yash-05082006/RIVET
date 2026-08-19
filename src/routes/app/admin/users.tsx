import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/users")({
  component: UsersAdminPage,
});

function UsersAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and roles.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        User administration content will go here.
      </div>
    </div>
  );
}
