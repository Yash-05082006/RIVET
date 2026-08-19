import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUser } from "../../lib/rivet/store";
import { modules, departmentName } from "../../lib/rivet/demo-data";
import { ArrowRight, CircleDot } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/app/modules")({
  component: ModulesPage,
});

function ModulesPage() {
  const user = useCurrentUser();

  const accessibleModules = useMemo(() => {
    if (user.role === "admin") return modules;
    return modules.filter((m) => user.departmentIds.includes(m.departmentId));
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Modules</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your available department workflows and data collection forms.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface text-muted-foreground text-xs uppercase font-medium border-b border-border">
            <tr>
              <th className="px-5 py-4 w-1/3">Module</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Cadence</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {accessibleModules.length > 0 ? (
              accessibleModules.map((module) => {
                const canCreate = module.createRoles.includes(user.role);
                return (
                  <tr key={module.key} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-foreground">{module.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-sm">
                        {module.description}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                        {departmentName(module.departmentId)}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top capitalize text-muted-foreground">
                      {module.cadence}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      {module.active ? (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CircleDot className="h-3 w-3 fill-green-500" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          <CircleDot className="h-3 w-3 fill-slate-500" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-right">
                      {module.active ? (
                        <Link
                          to="/app/modules/$moduleKey"
                          params={{ moduleKey: module.key }}
                          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            canCreate
                              ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
                              : "border border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground"
                          }`}
                        >
                          {canCreate ? "New Entry" : "View"}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unavailable</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  No modules available for your role or department.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
