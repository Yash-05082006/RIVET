import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "../../lib/rivet/store";
import { Clock } from "lucide-react";
import { roleLabel } from "../../lib/rivet/nav";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useCurrentUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your account preferences and notification settings.
        </p>
      </div>

      {/* Current account info — read-only until settings backend is connected */}
      <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
        <div className="bg-surface px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Account</h2>
        </div>
        <dl className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="text-sm text-foreground">{user.name}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="text-sm text-foreground">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm font-medium text-muted-foreground">Role</dt>
            <dd className="text-sm text-foreground">{roleLabel[user.role]}</dd>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <dt className="text-sm font-medium text-muted-foreground">Designation</dt>
            <dd className="text-sm text-foreground">{user.designation}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border bg-background p-8 text-center shadow-sm">
        <Clock className="mx-auto h-7 w-7 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">Preference settings are not yet available</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
          Notification preferences, password management, and other account settings will be available once the backend is connected.
        </p>
      </div>
    </div>
  );
}
