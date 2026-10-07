import { ActivityItem } from "../../lib/rivet/types";
import { userName, moduleName } from "../../lib/rivet/demo-data";
import { formatDateTime } from "../../lib/formatDate";
import { Link } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  FileEdit, 
  Clock,
  PlusCircle,
  LucideIcon
} from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
}

export function ActivityFeed({ activities, title = "Recent Activity" }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
          No recent activity found.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <ul className="divide-y divide-border">
          {activities.map((item) => {
            let Icon: LucideIcon;
            let iconColor = "";
            let actionText = "";

            switch (item.action) {
              case "approved":
                Icon = CheckCircle2;
                iconColor = "text-green-500 bg-green-50";
                actionText = "approved";
                break;
              case "rejected":
                Icon = XCircle;
                iconColor = "text-red-500 bg-red-50";
                actionText = "rejected";
                break;
              case "submitted":
                Icon = Clock;
                iconColor = "text-amber-500 bg-amber-50";
                actionText = "submitted for review";
                break;
              case "commented":
                Icon = MessageSquare;
                iconColor = "text-blue-500 bg-blue-50";
                actionText = "commented on";
                break;
              case "created":
                Icon = PlusCircle;
                iconColor = "text-emerald-500 bg-emerald-50";
                actionText = "created a draft for";
                break;
              case "edited":
                Icon = FileEdit;
                iconColor = "text-indigo-500 bg-indigo-50";
                actionText = "edited";
                break;
              default:
                Icon = FileEdit;
                iconColor = "text-slate-500 bg-slate-50";
                actionText = item.action;
            }

            return (
              <li key={item.id} className="p-4 hover:bg-surface/50 transition-colors">
                <div className="flex gap-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconColor} ring-1 ring-inset ring-black/5`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{userName(item.actorId)}</span> {actionText}{" "}
                      {item.moduleKey && (
                        <span className="font-medium">{moduleName(item.moduleKey)}</span>
                      )}
                    </p>
                    {item.detail && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-2 my-1">
                        "{item.detail}"
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDateTime(item.createdAt)}</span>
                      {item.entryId && item.moduleKey && (
                        <>
                          <span>&bull;</span>
                          <Link
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey: item.moduleKey, entryId: item.entryId }}
                            className="font-medium text-primary hover:text-primary-hover transition-colors"
                          >
                            View Entry &rarr;
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
