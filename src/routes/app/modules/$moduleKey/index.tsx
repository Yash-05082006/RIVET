import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { getModule, departmentName, moduleName } from "../../../../lib/rivet/demo-data";
import { useRivet, useCurrentUser } from "../../../../lib/rivet/store";
import { canCreateIn } from "../../../../lib/rivet/nav";
import type { LogEntry } from "../../../../lib/rivet/types";

export const Route = createFileRoute("/app/modules/$moduleKey/")({
  component: ModuleDetailPage,
});

const STATUS_CONFIG: Record<
  LogEntry["status"],
  { label: string; classes: string }
> = {
  draft: { label: "Draft", classes: "bg-slate-50 text-slate-600 ring-slate-500/10" },
  submitted: { label: "Under Review", classes: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  approved: { label: "Approved", classes: "bg-green-50 text-green-700 ring-green-600/20" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 ring-red-600/10" },
};

function StatusBadge({ status }: { status: LogEntry["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function ModuleDetailPage() {
  const { moduleKey } = Route.useParams();
  const user = useCurrentUser();
  const { myEntries, visibleEntries } = useRivet();
  const navigate = useNavigate();

  const mod = getModule(moduleKey);

  if (!mod) {
    return (
      <div className="space-y-4">
        <Link to="/app/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  const canCreate = canCreateIn(user, moduleKey);

  // Employees see only their own; managers/admins see all from this module that are visible to them
  const moduleEntries = (user.role === "employee" ? myEntries : visibleEntries)
    .filter((e) => e.moduleKey === moduleKey)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Determine which table columns to show from ModuleDef.tableFields
  const tableFieldDefs = mod.fields.filter((f) => mod.tableFields.includes(f.key));

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <Link
          to="/app/modules"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>{departmentName(mod.departmentId)}</span>
              <span>·</span>
              <span className="capitalize">{mod.cadence} submission</span>
              {mod.approvalRequired && (
                <>
                  <span>·</span>
                  <span>Manager approval required</span>
                </>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{mod.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{mod.description}</p>
          </div>

          {canCreate && (
            <button
              onClick={() => navigate({ to: "/app/modules/$moduleKey/new", params: { moduleKey } })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" /> New Entry
            </button>
          )}
        </div>
      </div>

      {/* Entry table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {user.role === "employee" ? "My Entries" : "Entries"}
        </h2>
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                {tableFieldDefs.map((f) => (
                  <th key={f.key} className="px-4 py-3">{f.label}</th>
                ))}
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {moduleEntries.length > 0 ? (
                moduleEntries.map((entry) => {
                  const isDraft = entry.status === "draft";
                  const isRejected = entry.status === "rejected";
                  const isOwner = entry.authorId === user.id;
                  const canEdit = isOwner && (isDraft || isRejected);

                  return (
                    <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                      {tableFieldDefs.map((f) => (
                        <td key={f.key} className="px-4 py-3 text-muted-foreground">
                          {String(entry.values[f.key] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canEdit ? (
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                          >
                            {isRejected ? "Fix & Resubmit" : "Continue editing"}
                          </Link>
                        ) : (
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={tableFieldDefs.length + 2}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No entries yet.
                    {canCreate && (
                      <span>
                        {" "}
                        <button
                          onClick={() => navigate({ to: "/app/modules/$moduleKey/new", params: { moduleKey } })}
                          className="text-primary font-medium hover:underline"
                        >
                          Create the first entry.
                        </button>
                      </span>
                    )}
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
