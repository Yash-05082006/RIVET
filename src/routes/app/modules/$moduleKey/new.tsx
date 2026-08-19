import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getModule } from "../../../../lib/rivet/demo-data";
import { useCurrentUser } from "../../../../lib/rivet/store";
import { canCreateIn } from "../../../../lib/rivet/nav";
import { EntryForm } from "../../../../components/work/EntryForm";

export const Route = createFileRoute("/app/modules/$moduleKey/new")({
  component: NewEntryPage,
});

function NewEntryPage() {
  const { moduleKey } = Route.useParams();
  const user = useCurrentUser();
  const mod = getModule(moduleKey);

  if (!mod) {
    return (
      <div className="space-y-4">
        <Link to="/app/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Modules
        </Link>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  if (!canCreateIn(user, moduleKey)) {
    return (
      <div className="space-y-4">
        <Link
          to="/app/modules/$moduleKey"
          params={{ moduleKey }}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {mod.name}
        </Link>
        <p className="text-muted-foreground">You do not have permission to create entries in this module.</p>
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
      <EntryForm moduleDef={mod} />
    </div>
  );
}
