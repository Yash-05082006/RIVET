import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getModule } from "../../../../lib/rivet/demo-data";
import { useRivet, useCurrentUser } from "../../../../lib/rivet/store";
import { EntryForm } from "../../../../components/work/EntryForm";

export const Route = createFileRoute("/app/modules/$moduleKey/entry/$entryId")({
  validateSearch: (search: Record<string, unknown>): { from?: string } => {
    return {
      from: search.from as string | undefined,
    }
  },
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { moduleKey, entryId } = Route.useParams();
  const { from } = Route.useSearch();
  const user = useCurrentUser();
  const { entries } = useRivet();
  const mod = getModule(moduleKey);

  const entry = entries.find((e) => e.id === entryId);

  const backLink = from === "work" ? "/app/work" : `/app/modules/${moduleKey}`;
  const backLabel = from === "work" ? "Back to My Work" : `Back to ${mod?.name ?? 'Module'}`;

  if (!mod || !entry) {
    return (
      <div className="space-y-4">
        <Link to={backLink} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <p className="text-muted-foreground">Entry not found.</p>
      </div>
    );
  }

  // Only the author (or admin) should be able to access this entry
  const canAccess =
    entry.authorId === user.id ||
    user.role === "admin" ||
    (user.role === "manager" && user.departmentIds.includes(entry.departmentId));

  if (!canAccess) {
    return (
      <div className="space-y-4">
        <Link
          to={backLink}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          You do not have permission to access this entry.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={backLink}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <EntryForm moduleDef={mod} existingEntry={entry} />
    </div>
  );
}
