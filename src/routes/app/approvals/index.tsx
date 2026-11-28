import { DateInput } from "../../../components/ui/date-input";
import { entryDisplayId } from "../../../lib/rivet/entryId";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, LayoutGrid, List } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { getModule, moduleName, departmentName } from "../../../lib/rivet/demo-data";
import { accessibleDepartments, hasPermission } from "../../../lib/rivet/permissions";
import { formatDate, formatDateTime, matchesEntryDateRange } from "../../../lib/formatDate";
import type { LogEntry } from "../../../lib/rivet/types";

export const Route = createFileRoute("/app/approvals/")({
  head: () => ({
    meta: [
      { title: "Approvals | RIVET" },
      { name: "description", content: "Review and manage RIVET employee submissions." },
      { property: "og:title", content: "Approvals | RIVET" },
      { property: "og:description", content: "Review and manage RIVET employee submissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApprovalsPage,
});

type ViewMode = "list" | "board";
type ApprovalStatus = LogEntry["status"];
const statusLabels: Record<ApprovalStatus, string> = {
  draft: "Draft",
  submitted: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function StatusLabel({ status }: { status: ApprovalStatus }) {
  const classes: Record<ApprovalStatus, string> = {
    draft: "bg-surface text-muted-foreground ring-border",
    submitted: "bg-amber-50 text-amber-800 ring-amber-700/20",
    approved: "bg-green-50 text-green-800 ring-green-700/20",
    rejected: "bg-red-50 text-red-800 ring-red-700/20",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes[status]}`}>{statusLabels[status]}</span>;
}

function ApprovalsPage() {
  const user = useCurrentUser();
  const { approvalEntries, users, departments } = useRivet();
  const admin = hasPermission(user, "admin");
  const userDepartments = accessibleDepartments(user);
  const [view, setView] = useState<ViewMode>("list");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<string | null>("");
  const [dateTo, setDateTo] = useState<string | null>("");
  const scopedDepartmentIds = new Set(userDepartments.map((department) => department.id));
  const filtered = useMemo(() => approvalEntries.filter((entry) => {
    if (!scopedDepartmentIds.has(entry.departmentId)) return false;
    if (departmentFilter !== "all" && entry.departmentId !== departmentFilter) return false;
    if (moduleFilter !== "all" && entry.moduleKey !== moduleFilter) return false;
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (dateFrom === null || dateTo === null || !matchesEntryDateRange(entry.entryDate, dateFrom, dateTo)) return false;
    return true;
  }), [approvalEntries, departmentFilter, moduleFilter, statusFilter, dateFrom, dateTo]);

  const availableModules = [...new Set(approvalEntries
    .filter((entry) => scopedDepartmentIds.has(entry.departmentId))
    .filter((entry) => departmentFilter === "all" || entry.departmentId === departmentFilter)
    .map((entry) => entry.moduleKey))];

  function authorName(entry: LogEntry) {
    return users.find((item) => item.id === entry.authorId)?.name ?? "Unknown";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Submissions across {admin ? "your organisation" : "your assigned departments"}.</p>
        </div>
        <div className="inline-flex items-center rounded-md border border-border p-1" aria-label="Approval view">
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")} aria-pressed={view === "list"}>
            <List /> List
          </Button>
          <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")} aria-pressed={view === "board"}>
            <LayoutGrid /> Board
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-b border-border pb-5">
        {admin && <label className="grid gap-1 text-xs font-medium text-muted-foreground">Department
          <select aria-label="Filter by department" value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setModuleFilter("all"); }} className="h-9 min-w-40 rounded-md border border-input bg-background px-3 text-sm text-foreground">
            <option value="all">All departments</option>
            {departments.filter(d => !d.deleted).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
          </select>
        </label>}
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Module
          <select aria-label="Filter by module" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className="h-9 min-w-48 rounded-md border border-input bg-background px-3 text-sm text-foreground">
            <option value="all">All modules</option>
            {availableModules.map((key) => <option key={key} value={key}>{moduleName(key)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Status
          <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 min-w-36 rounded-md border border-input bg-background px-3 text-sm text-foreground">
            <option value="all">All Status</option>
            <option value="submitted">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Entry date from
          <DateInput aria-label="Entry date from" value={dateFrom} onValueChange={setDateFrom} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Entry date to
          <DateInput aria-label="Entry date to" value={dateTo} onValueChange={setDateTo} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" />
        </label>
        <span className="ml-auto pb-2 text-sm text-muted-foreground">{filtered.length} submission{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto rounded-md border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs font-medium uppercase text-muted-foreground"><tr>
              <th className="whitespace-nowrap px-4 py-3">Entry ID</th><th className="whitespace-nowrap px-4 py-3">Employee</th><th className="whitespace-nowrap px-4 py-3">Department</th><th className="whitespace-nowrap px-4 py-3">Module</th><th className="whitespace-nowrap px-4 py-3">Entry date</th><th className="whitespace-nowrap px-4 py-3">Submitted at</th><th className="whitespace-nowrap px-4 py-3">Status</th><th className="whitespace-nowrap px-4 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.length ? filtered.map((entry) => <tr key={entry.id} className="hover:bg-surface/50">
                <td className="whitespace-nowrap px-4 py-3">{entryDisplayId(entry)}</td><td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{authorName(entry)}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{departmentName(entry.departmentId)}</td><td className="px-4 py-3 text-muted-foreground">{moduleName(entry.moduleKey)}</td><td className="whitespace-nowrap px-4 py-3">{formatDate(entry.entryDate)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{entry.submittedAt ? <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{formatDateTime(entry.submittedAt)}</span> : "—"}</td><td className="px-4 py-3"><StatusLabel status={entry.status as ApprovalStatus} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><Link to="/app/approvals/$entryId" params={{ entryId: entry.id }} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">View<ArrowRight className="h-3.5 w-3.5" /></Link></td>
              </tr>) : <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No submissions match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
        {(["submitted", "approved", "rejected"] as const).map((status) => {
          const items = filtered.filter((entry) => entry.status === status);
          return <section key={status} aria-label={`${statusLabels[status]} submissions`} className="min-w-0">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3"><h2 className="text-sm font-semibold text-foreground">{statusLabels[status]}</h2><span className="text-xs text-muted-foreground">{items.length}</span></div>
            <div className="space-y-3">{items.map((entry) => <Link key={entry.id} draggable={false} to="/app/approvals/$entryId" params={{ entryId: entry.id }} className="block rounded-md border border-border bg-background p-4 transition-colors hover:bg-surface">
              <div className="mb-3 flex items-start justify-between gap-2"><span className="font-medium text-foreground">{authorName(entry)}</span><StatusLabel status={entry.status} /></div>
              <p className="text-sm text-muted-foreground">{departmentName(entry.departmentId)} · {moduleName(entry.moduleKey)}</p>
              <p className="mt-2 line-clamp-2 text-sm">{String(Object.values(entry.values)[1] ?? "")}</p>
              <p className="mt-2 text-xs text-muted-foreground">{entryDisplayId(entry)} · {formatDate(entry.entryDate)} · Submitted {entry.submittedAt ? formatDateTime(entry.submittedAt) : "—"}</p>
            </Link>)}{items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No submissions</p>}</div>
          </section>;
        })}
      </div>}
    </div>
  );
}