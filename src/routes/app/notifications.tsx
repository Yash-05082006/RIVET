import { createFileRoute, Link } from "@tanstack/react-router";
import { useRivet, useCurrentUser } from "../../lib/rivet/store";
import { formatDateTime } from "../../lib/formatDate";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const user = useCurrentUser();
  const { myNotifications, markRead, markAllRead, entries } = useRivet();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Approval decisions, rejections, and system updates for your account.
          </p>
        </div>
        {myNotifications.some((n) => !n.read) && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
        {myNotifications.length > 0 ? (
          <ul className="divide-y divide-border">
            {myNotifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${n.read ? "bg-background" : "bg-slate-50/50"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <p className={`text-sm font-medium ${
                      n.kind === "rejected" ? "text-red-600" :
                      n.kind === "approved" ? "text-green-600" :
                      "text-foreground"
                    }`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    )}
                  </div>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(n.createdAt)}
                    </p>
                    {n.entryId && (() => {
                      const entry = entries.find(e => e.id === n.entryId);
                      if (!entry) return null;
                      
                      // Using canReviewEntry from permissions would be ideal, but for simplicity here we check role.
                      // Admin/Manager can go to approvals detail for pending/approved entries if they are not the author (or we just let them try)
                      const isReviewer = (user.role === "admin" || user.role === "manager") && entry.authorId !== user.id;

                      if (isReviewer) {
                        return (
                          <Link 
                            to="/app/approvals/$entryId"
                            params={{ entryId: n.entryId }}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        );
                      } else {
                        return (
                          <Link 
                            to="/app/modules/$moduleKey/entry/$entryId"
                            params={{ moduleKey: entry.moduleKey, entryId: n.entryId }}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        );
                      }
                    })()}
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No notifications yet. You'll receive updates here when entries are approved or rejected.
          </div>
        )}
      </div>
    </div>
  );
}
