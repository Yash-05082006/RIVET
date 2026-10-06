import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { canAccessDepartment } from "../../../lib/rivet/permissions";

export const Route = createFileRoute("/app/campaigns/new")({
  component: NewCampaignPage,
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function NewCampaignPage() {
  const user = useCurrentUser();
  const { createCampaign } = useRivet();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState<"Active" | "Completed" | "On Hold">("Active");

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!canAccessDepartment(user, "brand-marketing")) {
    return (
      <div className="space-y-4">
        <Link to="/app/campaigns" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          You do not have permission to create campaigns.
        </div>
      </div>
    );
  }

  const handleSave = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Campaign name is required";
    if (!startDate.trim()) errs.startDate = "Start date is required";
    if (!endDate.trim()) errs.endDate = "End date is required";
    if (!platform.trim()) errs.platform = "Platform is required";

    if (startDate && endDate && startDate > endDate) {
      errs.endDate = "End date cannot be before start date";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    createCampaign({
      name: name.trim(),
      description: description.trim(),
      startDate,
      endDate,
      platform: platform.trim(),
      status,
      ownerId: user.id,
      departmentId: "brand-marketing",
    });

    navigate({ to: "/app/campaigns" });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/app/campaigns"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <div className="space-y-6">
        <div className="border-b border-border pb-5">
          <h1 className="text-xl font-bold text-foreground">New Campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new marketing campaign to group related activities and content.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors ${
                errors.name ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors ${
                  errors.startDate ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                }`}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors ${
                  errors.endDate ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
                }`}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Platform / Medium <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. Instagram / LinkedIn"
              className={`w-full rounded-md border px-3 py-2 text-sm text-foreground outline-none transition-colors ${
                errors.platform ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-border focus:border-primary focus:ring-2 focus:ring-primary-light"
              }`}
            />
            {errors.platform && <p className="mt-1 text-xs text-red-600">{errors.platform}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light"
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
