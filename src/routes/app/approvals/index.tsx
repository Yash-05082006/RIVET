import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowRight } from "lucide-react";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { moduleName, departmentName, users } from "../../../lib/rivet/demo-data";
import { canReview } from "../../../lib/rivet/nav";
import { formatDate, formatDateTime } from "../../../lib/formatDate";

export const Route = createFileRoute("/app/approvals/")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const user = useCurrentUser();
  const { reviewQueue } = useRivet();

  if (!canReview(user)) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Approvals</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          You do not have permission to access the review queue.
        </div>
      </div>
    );
  }

  function getAuthorName(id: string) {
    return users.find((u) => u.id === id)?.name || "Unknown";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pending submissions requiring your approval.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Employee</th>
                <th className="px-4 py-3 whitespace-nowrap">Department</th>
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3 whitespace-nowrap">Entry Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Submitted At</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviewQueue.length > 0 ? (
                reviewQueue.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{getAuthorName(entry.authorId)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{departmentName(entry.departmentId)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{moduleName(entry.moduleKey)}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">{formatDate(entry.entryDate)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="h-3 w-3 shrink-0" />
                        {entry.submittedAt ? formatDateTime(entry.submittedAt) : "Unknown"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to="/app/approvals/$entryId"
                        params={{ entryId: entry.id }}
                        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                      >
                        Review
                        <ArrowRight className="ml-1 h-3 w-3 shrink-0" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Your review queue is currently empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
