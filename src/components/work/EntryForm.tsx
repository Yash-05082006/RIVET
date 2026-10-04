/**
 * EntryForm - dynamic form for creating/editing a LogEntry.
 *
 * Renders fields from ModuleDef.fields. Keeps the form state locally during
 * editing and delegates persistence to the RivetProvider store actions
 * (createEntry, updateEntryValues, submitEntry). When the backend is wired,
 * only the store actions need replacing - this component stays the same.
 */
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import type { ModuleDef, LogEntry } from "../../lib/rivet/types";
import { departmentName } from "../../lib/rivet/demo-data";
import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { canCreateIn } from "../../lib/rivet/nav";

interface EntryFormProps {
  moduleDef: ModuleDef;
  /** Existing entry being edited. Undefined means creating a new entry. */
  existingEntry?: LogEntry;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Resolve a field's current value as a string for controlled inputs. */
function fieldStr(values: Record<string, string | number | boolean>, key: string): string {
  const v = values[key];
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

export function EntryForm({ moduleDef, existingEntry }: EntryFormProps) {
  const user = useCurrentUser();
  const { createEntry, updateEntryValues, submitEntry, myEntries } = useRivet();
  const navigate = useNavigate();

  const isEditable =
    !existingEntry ||
    (existingEntry.status === "draft" && existingEntry.authorId === user.id) ||
    (existingEntry.status === "rejected" && existingEntry.authorId === user.id);

  // Build initial values from existing entry or empty
  const initialValues = useMemo(() => {
    const out: Record<string, string> = {};
    moduleDef.fields.forEach((f) => {
      if (f.type === "auto") return; // auto fields are computed
      out[f.key] = existingEntry ? fieldStr(existingEntry.values, f.key) : "";
    });
    // Default the primary date field to today for new entries
    if (!existingEntry) {
      const dateField = moduleDef.fields.find((f) => f.type === "date");
      if (dateField) out[dateField.key] = today();
    }
    return out;
  }, [moduleDef, existingEntry]);

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  // The primary date key (used for duplicate guard)
  const primaryDateKey = moduleDef.fields.find((f) => f.type === "date" || f.type === "month")?.key;

  function validate(forSubmit: boolean): boolean {
    const errs: Record<string, string> = {};
    if (forSubmit) {
      moduleDef.fields.forEach((f) => {
        if (f.type === "auto") return;
        if (f.required && !values[f.key]?.trim()) {
          errs[f.key] = `${f.label} is required`;
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildValues(): Record<string, string | number | boolean> {
    const out: Record<string, string | number | boolean> = {};
    moduleDef.fields.forEach((f) => {
      if (f.type === "auto") return;
      const raw = values[f.key] ?? "";
      if (f.type === "integer") out[f.key] = raw === "" ? 0 : parseInt(raw, 10);
      else if (f.type === "decimal") out[f.key] = raw === "" ? 0 : parseFloat(raw);
      else if (f.type === "boolean") out[f.key] = raw === "true";
      else out[f.key] = raw;
    });
    // Add computed day-of-week for modules that use it
    if (values["date"] && moduleDef.fields.find((f) => f.key === "dayOfWeek")) {
      const d = new Date(values["date"]);
      out["dayOfWeek"] = d.toLocaleDateString("en-US", { weekday: "long" });
    }
    return out;
  }

  function checkDuplicate(entryDate: string): boolean {
    if (existingEntry) return false; // editing an existing one - no duplicate issue
    return myEntries.some(
      (e) =>
        e.moduleKey === moduleDef.key &&
        e.entryDate === entryDate &&
        e.status !== "rejected"
    );
  }

  async function handleSaveDraft() {
    if (!validate(false)) return;
    setSaving(true);
    setSubmitError("");

    const entryDate = (primaryDateKey ? values[primaryDateKey] : today()) || today();

    if (!existingEntry) {
      // Creating new
      const isDup = checkDuplicate(entryDate);
      if (isDup) {
        setSubmitError(
          "A non-rejected entry already exists for this date in this module. Edit the existing entry instead."
        );
        setSaving(false);
        return;
      }
      createEntry({ moduleKey: moduleDef.key, values: buildValues(), entryDate, submit: false });
      navigate({ to: "/app/work" });
    } else {
      // Updating existing draft/rejected
      updateEntryValues(existingEntry.id, buildValues());
      navigate({ to: "/app/work" });
    }
    setSaving(false);
  }

  async function handleSubmit() {
    if (!validate(true)) return;
    setSaving(true);
    setSubmitError("");

    const entryDate = (primaryDateKey ? values[primaryDateKey] : today()) || today();

    if (!existingEntry) {
      const isDup = checkDuplicate(entryDate);
      if (isDup) {
        setSubmitError(
          "A non-rejected entry already exists for this date in this module. Edit the existing entry instead."
        );
        setSaving(false);
        return;
      }
      createEntry({ moduleKey: moduleDef.key, values: buildValues(), entryDate, submit: true });
      navigate({ to: "/app/work" });
    } else {
      // Update values then submit
      updateEntryValues(existingEntry.id, buildValues());
      submitEntry(existingEntry.id);
      navigate({ to: "/app/work" });
    }
    setSaving(false);
  }

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    if (submitError) setSubmitError("");
  }

  const canCreate = canCreateIn(user, moduleDef.key);
  const isViewOnly = !isEditable || !canCreate;

  return (
    <div className="space-y-6">
      {/* Module context header */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span>{departmentName(moduleDef.departmentId)}</span>
          <span>·</span>
          <span className="capitalize">{moduleDef.cadence} submission</span>
          {existingEntry && (
            <>
              <span>·</span>
              <span className="font-mono">{existingEntry.id}</span>
            </>
          )}
        </div>
        <h1 className="text-xl font-bold text-foreground">{moduleDef.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{moduleDef.description}</p>
      </div>

      {/* Rejection notice */}
      {existingEntry?.status === "rejected" && existingEntry.managerRemarks && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">Entry rejected - action required</p>
            <p className="mt-1 text-sm text-red-700">{existingEntry.managerRemarks}</p>
          </div>
        </div>
      )}

      {/* View-only notice for submitted/approved entries */}
      {existingEntry && (existingEntry.status === "submitted" || existingEntry.status === "approved") && (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
          This entry is <span className="font-medium text-foreground">{existingEntry.status}</span> and
          {existingEntry.status === "submitted" ? " is currently under review." : " cannot be edited."}
          {existingEntry.managerRemarks && (
            <p className="mt-2 text-foreground">
              <span className="font-medium">Manager note:</span> {existingEntry.managerRemarks}
            </p>
          )}
        </div>
      )}

      {/* Dynamic form fields */}
      <div className="space-y-5">
        {moduleDef.fields.map((field) => {
          if (field.type === "auto") return null;
          const err = errors[field.key];
          const val = values[field.key] ?? "";
          const fieldId = `field-${field.key}`;

          return (
            <div key={field.key}>
              <label htmlFor={fieldId} className="block text-sm font-medium text-foreground mb-1.5">
                {field.label}
                {field.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
                {field.note && <span className="ml-2 text-xs text-muted-foreground">({field.note})</span>}
              </label>

              {field.type === "longtext" ? (
                <textarea
                  id={fieldId}
                  rows={4}
                  value={val}
                  disabled={isViewOnly}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:bg-surface disabled:cursor-not-allowed ${
                    err
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                  }`}
                />
              ) : field.type === "select" && field.options ? (
                <select
                  id={fieldId}
                  value={val}
                  disabled={isViewOnly}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors disabled:bg-surface disabled:cursor-not-allowed bg-background ${
                    err ? "border-red-400" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                  }`}
                >
                  <option value="">Select…</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "boolean" ? (
                <div className="flex items-center gap-3">
                  <input
                    id={fieldId}
                    type="checkbox"
                    checked={val === "true"}
                    disabled={isViewOnly}
                    onChange={(e) => handleChange(field.key, e.target.checked ? "true" : "false")}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed"
                  />
                  <label htmlFor={fieldId} className="text-sm text-foreground select-none">
                    {field.label}
                  </label>
                </div>
              ) : (
                <input
                  id={fieldId}
                  type={
                    field.type === "date" ? "date"
                    : field.type === "month" ? "month"
                    : field.type === "time" ? "time"
                    : field.type === "integer" || field.type === "decimal" ? "number"
                    : "text"
                  }
                  step={field.type === "decimal" ? "0.01" : undefined}
                  value={val}
                  disabled={isViewOnly}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:bg-surface disabled:cursor-not-allowed ${
                    err
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                  }`}
                />
              )}

              {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
            </div>
          );
        })}
      </div>

      {/* Submit-level error */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* Actions */}
      {!isViewOnly && (
        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveDraft}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      )}
    </div>
  );
}
