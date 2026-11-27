import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getModule } from "../../../../lib/rivet/demo-data";
import { useCurrentUser, useRivet } from "../../../../lib/rivet/store";
import { canCreateFor } from "../../../../lib/rivet/permissions";
import { canCreateIn } from "../../../../lib/rivet/nav";
import { EntryForm } from "../../../../components/work/EntryForm";

export const Route = createFileRoute("/app/modules/$moduleKey/new")({
  validateSearch: (search: Record<string, unknown>): { suggestion?: string; author?: string; date?: string } => ({
    suggestion: typeof search.suggestion === "string" ? search.suggestion : undefined,
    author: typeof search.author === "string" ? search.author : undefined,
    date: typeof search.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.date) ? search.date : undefined,
  }),
  component: NewEntryPage,
});

function NewEntryPage() {
  const { moduleKey } = Route.useParams();
  const user = useCurrentUser();
  const { suggestion, author, date } = Route.useSearch();
  const { webinarSuggestions, removeWebinarSuggestion, users } = useRivet();
  const proposal = moduleKey === "webinar-series-planner" ? webinarSuggestions.find((item) => item.id === suggestion) : undefined;
  const mod = getModule(moduleKey);

  if (!mod) {
    return (
      <div className="space-y-4">
        <Link to="/app/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  const target = author ? users.find((person) => person.id === author) : undefined;
  const onBehalf = target && date && canCreateFor(user, target, moduleKey) ? { id: target.id, name: target.name, date } : undefined;
  if (!canCreateIn(user, moduleKey) || (author && !onBehalf)) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/modules/$moduleKey"
          params={{ moduleKey }}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          You do not have permission to create entries in this module.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/app/modules/$moduleKey"
        params={{ moduleKey }}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      {onBehalf && <p className="text-sm text-muted-foreground">Creating on behalf of {onBehalf.name}</p>}
      <EntryForm moduleDef={mod} onBehalf={onBehalf} suggestedTopic={proposal?.topic} onPublished={proposal ? () => removeWebinarSuggestion(proposal.id) : undefined} />
    </div>
  );
}
