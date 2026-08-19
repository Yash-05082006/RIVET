import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View department summaries and export data.</p>
      </div>
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Reports content will go here.
      </div>
    </div>
  );
}
