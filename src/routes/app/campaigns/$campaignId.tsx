import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Megaphone, Calendar, Users, Target, Activity, Share2, Clock, CheckCircle } from "lucide-react";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { userName, moduleName } from "../../../lib/rivet/demo-data";
import { canAccessDepartment } from "../../../lib/rivet/permissions";
import { formatDate } from "../../../lib/formatDate";

export const Route = createFileRoute("/app/campaigns/$campaignId")({
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  const user = useCurrentUser();
  const { campaigns, visibleEntries } = useRivet();

  const campaign = campaigns.find((c) => c.id === campaignId);

  if (!canAccessDepartment(user, "brand-marketing") || !campaign) {
    return (
      <div className="space-y-4">
        <Link to="/app/campaigns" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          Campaign not found or access denied.
        </div>
      </div>
    );
  }

  // Find all entries linked to this campaign that the user can see
  const linkedEntries = visibleEntries.filter((e) => e.campaignId === campaign.id);
  
  // Aggregate stats from child entries
  const brandingEntries = linkedEntries.filter((e) => e.moduleKey === "branding-activities");
  const socialEntries = linkedEntries.filter((e) => e.moduleKey === "social-media-log");

  // Sum up hours from branding activities
  const totalHours = brandingEntries.reduce((sum, e) => {
    const hrs = Number(e.values.hours);
    return sum + (isNaN(hrs) ? 0 : hrs);
  }, 0);

  // Sum up social metrics
  const totalLikes = socialEntries.reduce((sum, e) => {
    const val = Number(e.values.likes);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalComments = socialEntries.reduce((sum, e) => {
    const val = Number(e.values.comments);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalReach = socialEntries.reduce((sum, e) => {
    const val = Number(e.values.reach);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/app/campaigns"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="uppercase tracking-wider">Brand & Marketing</span>
              <span>·</span>
              <span>Campaign</span>
              <span>·</span>
              <span className="font-mono">{campaign.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{campaign.description}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset whitespace-nowrap ${
              campaign.status === "Active"
                ? "bg-green-50 text-green-700 ring-green-600/20"
                : campaign.status === "Completed"
                  ? "bg-slate-50 text-slate-700 ring-slate-600/20"
                  : "bg-amber-50 text-amber-700 ring-amber-600/20"
            }`}
          >
            {campaign.status}
          </span>
        </div>
      </div>

      {/* Campaign Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Duration</p>
            <p className="text-sm font-medium text-foreground whitespace-nowrap">{formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <Target className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Platform</p>
            <p className="text-sm font-medium text-foreground">{campaign.platform}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Owner</p>
            <p className="text-sm font-medium text-foreground">{userName(campaign.ownerId)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 shadow-sm flex items-start gap-3">
          <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Activities</p>
            <p className="text-2xl font-bold text-foreground leading-none">{linkedEntries.length}</p>
          </div>
        </div>
      </div>

      {/* Campaign Performance Aggregates */}
      {(brandingEntries.length > 0 || socialEntries.length > 0) && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-primary" /> Aggregate Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Total Time Spent</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl font-bold text-foreground">{totalHours.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hrs</span></span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Total Reach</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl font-bold text-foreground">{totalReach.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Total Engagements</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-xl font-bold text-foreground">{(totalLikes + totalComments).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">likes/comments</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Linked Entries Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Linked Activities & Logs</h3>
        <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Date</th>
                <th className="px-5 py-3 whitespace-nowrap">Module</th>
                <th className="px-5 py-3 whitespace-nowrap">Details</th>
                <th className="px-5 py-3 whitespace-nowrap">Author</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {linkedEntries.length > 0 ? (
                linkedEntries
                  .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
                  .map((entry) => {
                    // Extract a meaningful title/detail based on the module type
                    let detail = "";
                    if (entry.moduleKey === "branding-activities" || entry.moduleKey === "social-media-log") {
                      detail = String(entry.values.title ?? "");
                    } else if (entry.moduleKey === "call-log") {
                      detail = String(entry.values.contact ?? "");
                    } else if (entry.moduleKey === "zoom-link-management") {
                      detail = String(entry.values.title ?? "");
                    } else {
                      detail = String(entry.values.task ?? entry.values.activity ?? "");
                    }

                    return (
                      <tr key={entry.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-5 py-3 align-middle text-muted-foreground whitespace-nowrap">
                          {formatDate(entry.entryDate)}
                        </td>
                        <td className="px-5 py-3 align-middle font-medium text-foreground whitespace-nowrap">
                          {moduleName(entry.moduleKey)}
                        </td>
                        <td className="px-5 py-3 align-middle text-muted-foreground max-w-sm truncate" title={detail}>
                          {detail}
                        </td>
                        <td className="px-5 py-3 align-middle text-muted-foreground whitespace-nowrap">
                          {userName(entry.authorId)}
                        </td>
                        <td className="px-5 py-3 align-middle text-center whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${
                            entry.status === "draft" ? "bg-slate-50 text-slate-600 ring-slate-500/10" :
                            entry.status === "submitted" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                            entry.status === "approved" ? "bg-green-50 text-green-700 ring-green-600/20" :
                            "bg-red-50 text-red-700 ring-red-600/10"
                          }`}>
                            {entry.status === "submitted" ? "Under Review" : entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3 align-middle text-right whitespace-nowrap">
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey: entry.moduleKey, entryId: entry.id }}
                            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No entries linked to this campaign yet.
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
