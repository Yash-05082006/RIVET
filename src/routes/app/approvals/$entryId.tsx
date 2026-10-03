import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { getModule, departmentName, users } from "../../../lib/rivet/demo-data";
import { canReviewEntry } from "../../../lib/rivet/permissions";

export const Route = createFileRoute("/app/approvals/$entryId")({
  component: EntryReviewPage,
});

function EntryReviewPage() {
  const { entryId } = Route.useParams();
  const user = useCurrentUser();
  const { entries, decide } = useRivet();
  const navigate = useNavigate();

  const [rejectRemark, setRejectRemark] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState("");

  const entry = entries.find((e) => e.id === entryId);
  const mod = entry ? getModule(entry.moduleKey) : null;
  const author = entry ? users.find((u) => u.id === entry.authorId) : null;

  // STRICT RBAC CHECKS
  if (!entry || !mod) {
    return (
      <div className="space-y-4">
        <Link to="/app/approvals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Entry not found.</p>
      </div>
    );
  }

  if (!canReviewEntry(user, entry)) {
    return (
      <div className="space-y-4">
        <Link to="/app/approvals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          You do not have permission to review this entry.
        </div>
      </div>
    );
  }

  if (entry.status !== "submitted") {
    return (
      <div className="space-y-4">
        <Link to="/app/approvals" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          This entry is currently {entry.status} and cannot be reviewed.
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    decide([entry.id], "approved");
    navigate({ to: "/app/approvals" });
  };

  const handleReject = () => {
    if (!showRejectForm) {
      setShowRejectForm(true);
      return;
    }
    
    if (!rejectRemark.trim()) {
      setError("A remark is required when rejecting an entry.");
      return;
    }

    decide([entry.id], "rejected", rejectRemark.trim());
    navigate({ to: "/app/approvals" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/app/approvals"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="font-medium text-foreground">{author?.name || "Unknown Author"}</span>
              <span>·</span>
              <span>{departmentName(entry.departmentId)}</span>
              <span>·</span>
              <span>{mod.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Submission</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submitted on {entry.submittedAt ? new Date(entry.submittedAt).toLocaleString() : "Unknown"}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Pending Review
          </span>
        </div>
      </div>

      {/* Entry Details */}
      <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
        <div className="bg-surface px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Submitted Information</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            {mod.fields.filter(f => f.type !== "auto").map((field) => {
              const val = entry.values[field.key];
              return (
                <div key={field.key} className={field.type === "longtext" ? "sm:col-span-2" : ""}>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">{field.label}</dt>
                  <dd className="text-sm text-foreground bg-surface/50 rounded-md p-3 border border-border/50 min-h-[42px]">
                    {val !== undefined && val !== null && val !== "" ? String(val) : <span className="text-muted-foreground italic">Not provided</span>}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      {/* Review Actions */}
      <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
        {showRejectForm ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="remark" className="block text-sm font-medium text-foreground mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                id="remark"
                rows={3}
                value={rejectRemark}
                onChange={(e) => {
                  setRejectRemark(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Explain what needs to be fixed..."
                className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground ${
                  error ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                }`}
              />
              {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRejectForm(false);
                  setError("");
                }}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
              >
                <X className="h-4 w-4" /> Confirm Rejection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-100"
            >
              <X className="h-4 w-4" /> Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <Check className="h-4 w-4" /> Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
