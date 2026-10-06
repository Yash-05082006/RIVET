import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, LayoutGrid, List, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { departments, getModule, moduleName, departmentName, users } from "../../../lib/rivet/demo-data";
import { accessibleDepartments, hasPermission } from "../../../lib/rivet/permissions";
import { formatDate, formatDateTime } from "../../../lib/formatDate";
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
type ApprovalStatus = "submitted" | "approved" | "rejected";
const statusLabels: Record<ApprovalStatus, string> = {
  submitted: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function StatusLabel({ status }: { status: ApprovalStatus }) {
  const classes: Record<ApprovalStatus, string> = {
    submitted: "bg-amber-50 text-amber-800 ring-amber-700/20",
    approved: "bg-green-50 text-green-800 ring-green-700/20",
    rejected: "bg-red-50 text-red-800 ring-red-700/20",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes[status]}`}>{statusLabels[status]}</span>;
}

function ApprovalsPage() {
  const user = useCurrentUser();
  const { approvalEntries, decide } = useRivet();
  const admin = hasPermission(user, "admin");
  const userDepartments = accessibleDepartments(user);
  const [view, setView] = useState<ViewMode>("list");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkRemark, setBulkRemark] = useState("");
  const [showBulkReject, setShowBulkReject] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const scopedDepartmentIds = new Set(userDepartments.map((department) => department.id));
  const filtered = useMemo(() => approvalEntries.filter((entry) => {
    if (!scopedDepartmentIds.has(entry.departmentId)) return false;
    if (departmentFilter !== "all" && entry.departmentId !== departmentFilter) return false;
    if (moduleFilter !== "all" && entry.moduleKey !== moduleFilter) return false;
    if (statusFilter !== "all" && entry.status !== statusFilter) return false;
    if (dateFrom && entry.entryDate < dateFrom) return false;
    if (dateTo && entry.entryDate > dateTo) return false;
    return true;
  }), [approvalEntries, departmentFilter, moduleFilter, statusFilter, dateFrom, dateTo]);

  const pendingSelected = filtered.filter((entry) => selectedIds.includes(entry.id) && entry.status === "submitted");
  const availableModules = [...new Set(approvalEntries
    .filter((entry) => scopedDepartmentIds.has(entry.departmentId))
    .filter((entry) => departmentFilter === "all" || entry.departmentId === departmentFilter)
    .map((entry) => entry.moduleKey))];

  function toggleEntry(entryId: string) {
    setSelectedIds((current) => current.includes(entryId) ? current.filter((id) => id !== entryId) : [...current, entryId]);
  }

  function runBulkDecision(decision: "approved" | "rejected") {
    if (pendingSelected.length === 0) return;
    if (decision === "rejected" && !bulkRemark.trim()) {
      setBulkError("Manager remarks are required to reject submissions.");
      return;
    }
    decide(pendingSelected.map((entry) => entry.id), decision, decision === "rejected" ? bulkRemark.trim() : undefined);
    setSelectedIds([]);
    setBulkRemark("");
    setShowBulkReject(false);
    setBulkError("");
  }

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
            {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
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
            <option value="all">All statuses</option>
            <option value="submitted">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Entry date from
          <input aria-label="Entry date from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="grid gap-1 text-xs font-medium text-muted-foreground">Entry date to
          <input aria-label="Entry date to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground" />
        </label>
        <span className="ml-auto pb-2 text-sm text-muted-foreground">{filtered.length} submission{filtered.length === 1 ? "" : "s"}</span>
      </div>

      {view === "list" ? <>
        {pendingSelected.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <span className="mr-2 text-sm font-medium text-foreground">{pendingSelected.length} pending selected</span>
          <Button size="sm" onClick={() => runBulkDecision("approved")}><Check /> Approve selected</Button>
          <Button size="sm" variant="destructive" onClick={() => { setShowBulkReject(true); setBulkError(""); }}><X /> Reject selected</Button>
          {showBulkReject && <div className="flex w-full flex-wrap items-start gap-2 pt-2">
            <div className="min-w-64 flex-1">
              <label htmlFor="bulk-remarks" className="mb-1 block text-xs font-medium text-foreground">Manager remarks (required)</label>
              <textarea id="bulk-remarks" rows={2} value={bulkRemark} onChange={(event) => { setBulkRemark(event.target.value); setBulkError(""); }} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
              {bulkError && <p className="mt-1 text-xs text-destructive">{bulkError}</p>}
            </div>
            <Button className="mt-5" variant="destructive" onClick={() => runBulkDecision("rejected")}>Confirm rejection</Button>
            <Button className="mt-5" variant="outline" onClick={() => { setShowBulkReject(false); setBulkError(""); }}>Cancel</Button>
          </div>}
        </div>}
        <div className="overflow-x-auto rounded-md border border-border bg-background">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs font-medium uppercase text-muted-foreground"><tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all pending submissions" checked={pendingSelected.length > 0 && pendingSelected.length === filtered.filter((entry) => entry.status === "submitted").length} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...filtered.filter((entry) => entry.status === "submitted").map((entry) => entry.id)])] : selectedIds.filter((id) => !filtered.some((entry) => entry.id === id)))} /></th>
              <th className="px-4 py-3">Employee</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Module</th><th className="px-4 py-3">Entry date</th><th className="px-4 py-3">Submitted at</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Review / action</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.length ? filtered.map((entry) => <tr key={entry.id} className="hover:bg-surface/50">
                <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${authorName(entry)} submission`} disabled={entry.status !== "submitted"} checked={selectedIds.includes(entry.id)} onChange={() => toggleEntry(entry.id)} /></td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{authorName(entry)}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{departmentName(entry.departmentId)}</td><td className="px-4 py-3 text-muted-foreground">{moduleName(entry.moduleKey)}</td><td className="whitespace-nowrap px-4 py-3">{formatDate(entry.entryDate)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{entry.submittedAt ? <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{formatDateTime(entry.submittedAt)}</span> : "—"}</td><td className="px-4 py-3"><StatusLabel status={entry.status as ApprovalStatus} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-right"><Link to="/app/approvals/$entryId" params={{ entryId: entry.id }} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">{entry.status === "submitted" ? "Review" : "View"}<ArrowRight className="h-3.5 w-3.5" /></Link></td>
              </tr>) : <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No submissions match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </> : <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
        {(["submitted", "approved", "rejected"] as const).map((status) => {
          const items = filtered.filter((entry) => entry.status === status);
          return <section key={status} aria-label={`${statusLabels[status]} submissions`} className="min-w-0">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3"><h2 className="text-sm font-semibold text-foreground">{statusLabels[status]}</h2><span className="text-xs text-muted-foreground">{items.length}</span></div>
            <div className="space-y-3">{items.map((entry) => <Link key={entry.id} to="/app/approvals/$entryId" params={{ entryId: entry.id }} className="block rounded-md border border-border bg-background p-4 transition-colors hover:bg-surface">
              <div className="mb-3 flex items-start justify-between gap-2"><span className="font-medium text-foreground">{authorName(entry)}</span><StatusLabel status={entry.status} /></div>
              <p className="text-sm text-muted-foreground">{departmentName(entry.departmentId)} · {moduleName(entry.moduleKey)}</p>
              <p className="mt-2 text-xs text-muted-foreground">Entry {formatDate(entry.entryDate)} · Submitted {entry.submittedAt ? formatDateTime(entry.submittedAt) : "—"}</p>
            </Link>)}{items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No submissions</p>}</div>
          </section>;
        })}
      </div>}
    </div>
  );
}