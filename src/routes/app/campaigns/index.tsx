import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Megaphone } from "lucide-react";
import { useRivet, useCurrentUser } from "../../../lib/rivet/store";
import { userName } from "../../../lib/rivet/demo-data";
import { canAccessDepartment } from "../../../lib/rivet/permissions";
import { formatDate } from "../../../lib/formatDate";

export const Route = createFileRoute("/app/campaigns/")({
  component: CampaignsPage,
});

function CampaignsPage() {
  const user = useCurrentUser();
  const { campaigns } = useRivet();
  const navigate = useNavigate();

  // Only users with brand-marketing access can see this
  if (!canAccessDepartment(user, "brand-marketing")) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        You do not have permission to access campaigns.
      </div>
    );
  }

  // Show all brand-marketing campaigns
  const displayCampaigns = campaigns
    .filter((c) => c.departmentId === "brand-marketing")
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="uppercase tracking-wider">Brand & Marketing</span>
            <span>·</span>
            <span>Strategic Management</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" /> Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage marketing campaigns and group related activities and social media posts.
          </p>
        </div>

        <button
          onClick={() => navigate({ to: "/app/campaigns/new" })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
            <tr>
              <th className="px-5 py-4 whitespace-nowrap">Campaign Name</th>
              <th className="px-5 py-4 whitespace-nowrap">Duration</th>
              <th className="px-5 py-4 whitespace-nowrap">Platform</th>
              <th className="px-5 py-4 whitespace-nowrap">Owner</th>
              <th className="px-5 py-4 text-center whitespace-nowrap">Status</th>
              <th className="px-5 py-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayCampaigns.length > 0 ? (
              displayCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-foreground">{campaign.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs" title={campaign.description}>
                      {campaign.description}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-muted-foreground whitespace-nowrap">
                    {formatDate(campaign.startDate)} to {formatDate(campaign.endDate)}
                  </td>
                  <td className="px-5 py-4 align-top text-muted-foreground whitespace-nowrap">
                    {campaign.platform}
                  </td>
                  <td className="px-5 py-4 align-top text-muted-foreground whitespace-nowrap">
                    {userName(campaign.ownerId)}
                  </td>
                  <td className="px-5 py-4 align-top text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${
                        campaign.status === "Active"
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : campaign.status === "Completed"
                            ? "bg-slate-50 text-slate-700 ring-slate-600/20"
                            : "bg-amber-50 text-amber-700 ring-amber-600/20"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                    <Link
                      to="/app/campaigns/$campaignId"
                      params={{ campaignId: campaign.id }}
                      className="text-sm font-medium text-primary hover:text-primary-hover transition-colors whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  No campaigns found. Create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
