import { createFileRoute, Link } from "@tanstack/react-router";
import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { moduleName, departmentName } from "../../lib/rivet/demo-data";
import { AlertCircle, FileEdit, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import type { LogEntry } from "../../lib/rivet/types";

export const Route = createFileRoute("/app/work")({
  component: WorkPage,
});

const STATUS_CONFIG: Record<
  LogEntry["status"],
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  draft: { label: "Draft", icon: FileEdit, classes: "bg-slate-50 text-slate-600 ring-slate-500/10" },
  submitted: { label: "Under Review", icon: Clock, classes: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  approved: { label: "Approved", icon: CheckCircle2, classes: "bg-green-50 text-green-700 ring-green-600/20" },
  rejected: { label: "Rejected", icon: XCircle, classes: "bg-red-50 text-red-700 ring-red-600/10" },
};

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${cfg.classes}`}>
      <Icon className="h-3 w-3 shrink-0" /> {cfg.label}
    </span>
  );
}

function WorkPage() {
  const user = useCurrentUser();
  const { myEntries } = useRivet();

  const entries = [...myEntries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const rejected = entries.filter((e) => e.status === "rejected");
  const drafts = entries.filter((e) => e.status === "draft");
  const attentionItems = [...rejected, ...drafts.filter((d) => !rejected.find((r) => r.id === d.id))];
  const otherEntries = entries.filter((e) => e.status !== "rejected" && e.status !== "draft");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Work</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All your log entries across every module - drafts, pending reviews, and completed work.
        </p>
      </div>

      {/* Attention required */}
      {attentionItems.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Attention Required</h2>
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <ul className="divide-y divide-border">
              {attentionItems.map((entry) => (
                <li key={entry.id} className="flex items-start gap-4 p-4 hover:bg-surface/50 transition-colors">
                  <div className="mt-0.5">
                    {entry.status === "rejected" ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <FileEdit className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{moduleName(entry.moduleKey)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {departmentName(entry.departmentId)} · <span className="whitespace-nowrap">Entry date: {entry.entryDate}</span>
                        </p>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>
                    {entry.status === "rejected" && entry.managerRemarks && (
                      <p className="mt-2 rounded border border-red-100 bg-red-50/60 px-3 py-2 text-xs text-red-800">
                        <strong>Manager note:</strong> {entry.managerRemarks}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <Link
                      to="/app/modules/$moduleKey/entry/$entryId"
                      params={{ moduleKey: entry.moduleKey, entryId: entry.id }}
                      search={{ from: 'work' }}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                    >
                      {entry.status === "rejected" ? "Fix & Resubmit" : "Continue"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Work history */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Work History</h2>
        {otherEntries.length > 0 ? (
          <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3 whitespace-nowrap">Department</th>
                  <th className="px-4 py-3 whitespace-nowrap">Entry Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Last Updated</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {otherEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{moduleName(entry.moduleKey)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{departmentName(entry.departmentId)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{entry.entryDate}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to="/app/modules/$moduleKey/entry/$entryId"
                        params={{ moduleKey: entry.moduleKey, entryId: entry.id }}
                        search={{ from: 'work' }}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No submitted or approved entries yet.{" "}
            <Link to="/app/modules" className="text-primary font-medium hover:underline">
              Go to Modules
            </Link>{" "}
            to start logging work.
          </div>
        )}
      </div>
    </div>
  );
}
