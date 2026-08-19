import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getModule } from "../../../../lib/rivet/demo-data";
import { useRivet, useCurrentUser } from "../../../../lib/rivet/store";
import { EntryForm } from "../../../../components/work/EntryForm";

export const Route = createFileRoute("/app/modules/$moduleKey/entry/$entryId")({
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { moduleKey, entryId } = Route.useParams();
  const user = useCurrentUser();
  const { entries } = useRivet();
  const mod = getModule(moduleKey);

  const entry = entries.find((e) => e.id === entryId);

  if (!mod || !entry) {
    return (
      <div className="space-y-4">
        <Link to="/app/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Modules
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
          to="/app/modules/$moduleKey"
          params={{ moduleKey }}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {mod.name}
        </Link>
        <p className="text-muted-foreground">You do not have access to this entry.</p>
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
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {mod.name}
      </Link>
      <EntryForm moduleDef={mod} existingEntry={entry} />
    </div>
  );
}
