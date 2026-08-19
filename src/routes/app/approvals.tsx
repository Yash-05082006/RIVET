import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground">Review and manage pending department submissions.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Approvals content will go here.
      </div>
    </div>
  );
}
