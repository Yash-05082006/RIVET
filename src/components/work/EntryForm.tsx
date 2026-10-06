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
import { AlertTriangle, CalendarDays } from "lucide-react";
import type { ModuleDef, LogEntry } from "../../lib/rivet/types";
import { departmentName, campaigns as allCampaigns } from "../../lib/rivet/demo-data";
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

/** Compute day-of-week string from an ISO date string without timezone shift. */
function computeDayOfWeek(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { weekday: "long" });
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
  const { createEntry, updateEntryValues, submitEntry, myEntries, campaigns, linkEntryToCampaign } = useRivet();
  const navigate = useNavigate();

  // Entry is editable iff it is owned by the current user AND in draft or rejected state.
  const isEditable =
    !existingEntry ||
    (existingEntry.status === "draft" && existingEntry.authorId === user.id) ||
    (existingEntry.status === "rejected" && existingEntry.authorId === user.id);

  // Only include user-fillable fields: exclude auto fields (dayOfWeek) and system fields (managerRemarks)
  const editableFields = useMemo(
    () => moduleDef.fields.filter((f) => f.type !== "auto" && f.key !== "managerRemarks"),
    [moduleDef]
  );

  const initialValues = useMemo(() => {
    const out: Record<string, string> = {};
    editableFields.forEach((f) => {
      out[f.key] = existingEntry ? fieldStr(existingEntry.values, f.key) : "";
    });
    // Default the primary date field to today for new entries
    if (!existingEntry) {
      const dateField = editableFields.find((f) => f.type === "date");
      if (dateField) out[dateField.key] = today();
    }
    return out;
  }, [moduleDef, existingEntry]); // eslint-disable-line react-hooks/exhaustive-deps

  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    existingEntry?.campaignId ?? ""
  );

  // Show campaign selector for brand-marketing department modules
  const isBrandMarketing = moduleDef.departmentId === "brand-marketing";
  const availableCampaigns = isBrandMarketing
    ? campaigns.filter((c) => c.departmentId === "brand-marketing")
    : [];

  // The primary date key (used for duplicate guard and dayOfWeek calculation)
  const primaryDateKey = editableFields.find((f) => f.type === "date" || f.type === "month")?.key;

  // Computed dayOfWeek - live from the current date field value
  const hasDayOfWeek = moduleDef.fields.some((f) => f.key === "dayOfWeek" && f.type === "auto");
  const currentDayOfWeek = hasDayOfWeek
    ? computeDayOfWeek(primaryDateKey ? (values[primaryDateKey] ?? "") : "")
    : null;

  /** Parse a date string (YYYY-MM-DD) into a local Date without timezone shift. */
  function parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function validate(forSubmit: boolean): boolean {
    const errs: Record<string, string> = {};

    // Required field validation (on submit only)
    if (forSubmit) {
      editableFields.forEach((f) => {
        if (f.required && !values[f.key]?.trim()) {
          errs[f.key] = `${f.label} is required`;
        }
      });
    }

    // Module-specific validation: weekEnding must be a Friday
    if (moduleDef.key === "weekly-meeting-report" && values["weekEnding"]) {
      const d = parseLocalDate(values["weekEnding"]);
      if (d && d.getDay() !== 5) {
        errs["weekEnding"] = "Week ending date must be a Friday";
      }
    }

    // Non-negative validation for integer and decimal fields (always)
    editableFields.forEach((f) => {
      if ((f.type === "integer" || f.type === "decimal") && values[f.key]) {
        const num = Number(values[f.key]);
        if (!isNaN(num) && num < 0) {
          errs[f.key] = `${f.label} cannot be negative`;
        }
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function buildValues(): Record<string, string | number | boolean> {
    const out: Record<string, string | number | boolean> = {};
    editableFields.forEach((f) => {
      const raw = values[f.key] ?? "";
      if (f.type === "integer") out[f.key] = raw === "" ? 0 : parseInt(raw, 10);
      else if (f.type === "decimal") out[f.key] = raw === "" ? 0 : parseFloat(raw);
      else if (f.type === "boolean") out[f.key] = raw === "true";
      else out[f.key] = raw;
    });
    // Always store the computed dayOfWeek alongside the entry values
    if (hasDayOfWeek && primaryDateKey && values[primaryDateKey]) {
      out["dayOfWeek"] = computeDayOfWeek(values[primaryDateKey]);
    }
    return out;
  }

  function checkDuplicate(entryDate: string): boolean {
    if (existingEntry) return false; // editing an existing entry - no duplicate issue
    return myEntries.some(
      (e) =>
        e.moduleKey === moduleDef.key &&
        e.entryDate === entryDate &&
        e.authorId === user.id &&
        e.status !== "rejected"
    );
  }

  async function handleSaveDraft() {
    if (!validate(false)) return;
    setSaving(true);
    setSubmitError("");

    const entryDate = (primaryDateKey ? values[primaryDateKey] : today()) || today();

    if (!existingEntry) {
      const isDup = checkDuplicate(entryDate);
      if (isDup) {
        setSubmitError(
          "An entry already exists for this date in this module. Edit the existing entry instead."
        );
        setSaving(false);
        return;
      }
      createEntry({ moduleKey: moduleDef.key, values: buildValues(), entryDate, submit: false, campaignId: selectedCampaignId || undefined });
      navigate({ to: "/app/work" });
    } else {
      updateEntryValues(existingEntry.id, buildValues());
      if (existingEntry.campaignId !== (selectedCampaignId || undefined)) {
        linkEntryToCampaign(existingEntry.id, selectedCampaignId || undefined);
      }
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
          "An entry already exists for this date in this module. Edit the existing entry instead."
        );
        setSaving(false);
        return;
      }
      createEntry({ moduleKey: moduleDef.key, values: buildValues(), entryDate, submit: true, campaignId: selectedCampaignId || undefined });
      navigate({ to: "/app/work" });
    } else {
      // Update values then submit (covers both draft submit and resubmit after rejection)
      updateEntryValues(existingEntry.id, buildValues());
      if (existingEntry.campaignId !== (selectedCampaignId || undefined)) {
        linkEntryToCampaign(existingEntry.id, selectedCampaignId || undefined);
      }
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

      {/* Rejection notice - shown prominently when entry is rejected */}
      {existingEntry?.status === "rejected" && existingEntry.managerRemarks && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">Entry rejected - action required</p>
            <p className="mt-1 text-sm text-red-700">{existingEntry.managerRemarks}</p>
            <p className="mt-2 text-xs text-red-600">
              Edit the entry below and click <strong>Resubmit for Review</strong> when ready.
            </p>
          </div>
        </div>
      )}

      {/* View-only notice for submitted/approved entries */}
      {existingEntry && (existingEntry.status === "submitted" || existingEntry.status === "approved") && (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
          This entry is{" "}
          <span className="font-medium text-foreground">
            {existingEntry.status === "submitted" ? "under review" : "approved"}
          </span>{" "}
          and cannot be edited.
          {existingEntry.managerRemarks && (
            <p className="mt-2 text-foreground">
              <span className="font-medium">Manager note:</span> {existingEntry.managerRemarks}
            </p>
          )}
        </div>
      )}

      {/* Dynamic form fields */}
      <div className="space-y-5">
        {/* Optional campaign selector for Brand & Marketing */}
        {isBrandMarketing && availableCampaigns.length > 0 && (
          <div>
            <label
              htmlFor="field-campaign"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Link to Campaign
              <span className="ml-2 text-xs text-muted-foreground">(optional)</span>
            </label>
            <select
              id="field-campaign"
              value={selectedCampaignId}
              disabled={isViewOnly}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors disabled:bg-surface disabled:cursor-not-allowed bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
            >
              <option value="">No campaign</option>
              {availableCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Existing campaign badge for view-only */}
        {existingEntry?.campaignId && isViewOnly && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Campaign:</span>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
              {availableCampaigns.find((c) => c.id === existingEntry.campaignId)?.name ?? existingEntry.campaignId}
            </span>
          </div>
        )}
        {editableFields.map((field) => {
          const err = errors[field.key];
          const val = values[field.key] ?? "";
          const fieldId = `field-${field.key}`;
          const isLongActivity =
            field.type === "longtext" && moduleDef.key === "daily-activity-log";

          return (
            <div key={field.key}>
              {/* Field label (skip for boolean - it renders its own inline label) */}
              {field.type !== "boolean" && (
                <label
                  htmlFor={fieldId}
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500" aria-hidden="true">
                      *
                    </span>
                  )}
                  {field.note && (
                    <span className="ml-2 text-xs text-muted-foreground">({field.note})</span>
                  )}
                </label>
              )}

              {field.type === "longtext" ? (
                <textarea
                  id={fieldId}
                  rows={isLongActivity ? 6 : 4}
                  value={val}
                  disabled={isViewOnly}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={
                    isLongActivity
                      ? "Describe your research activities for this day…"
                      : undefined
                  }
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
                    err
                      ? "border-red-400"
                      : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                  }`}
                >
                  <option value="">Select…</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "boolean" ? (
                <div className="flex items-center gap-3">
                  <input
                    id={fieldId}
                    type="checkbox"
                    checked={val === "true"}
                    disabled={isViewOnly}
                    onChange={(e) =>
                      handleChange(field.key, e.target.checked ? "true" : "false")
                    }
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor={fieldId}
                    className="text-sm font-medium text-foreground select-none"
                  >
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                </div>
              ) : (
                <input
                  id={fieldId}
                  type={
                    field.type === "date"
                      ? "date"
                      : field.type === "month"
                        ? "month"
                        : field.type === "time"
                          ? "time"
                          : field.type === "integer" || field.type === "decimal"
                            ? "number"
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

              {/* Live Day of Week display - shown inline below the Date field */}
              {field.key === primaryDateKey && hasDayOfWeek && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Day of Week:</span>
                  <span className="font-medium text-foreground">
                    {currentDayOfWeek || "-"}
                  </span>
                </div>
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
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {existingEntry?.status === "rejected" ? "Resubmit for Review" : "Submit for Review"}
          </button>
        </div>
      )}
    </div>
  );
}
