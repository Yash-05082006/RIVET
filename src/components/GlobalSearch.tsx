import { entryDisplayId } from "../lib/rivet/entryId";
import { formatDate } from "../lib/formatDate";
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, FileText, LayoutGrid, Users, Megaphone } from "lucide-react";
import { useRivet } from "../lib/rivet/store";
import { canAccessDepartment, canReviewEntry, accessibleModules } from "../lib/rivet/permissions";
import { getModule, moduleName } from "../lib/rivet/demo-data";
import { formatDateTime } from "../lib/formatDate";

export function GlobalSearch() {
  const { visibleEntries, campaigns, user, users } = useRivet();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        containerRef.current?.querySelector("input")?.focus();
      }
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleShortcut);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!query || query.length < 2 || !user) return [];
    
    const term = query.toLowerCase();
    const results: Array<{
      id: string;
      type: "entry" | "module" | "campaign" | "user";
      title: string;
      subtitle: string;
      icon: any;
      linkParams?: any;
    }> = [];

    // Search Modules
    const permittedModules = accessibleModules(user);
    permittedModules.forEach((m) => {
      if (m.name.toLowerCase().includes(term) || m.description.toLowerCase().includes(term)) {
        results.push({
          id: m.key,
          type: "module",
          title: m.name,
          subtitle: m.description,
          icon: LayoutGrid,
        });
      }
    });

    // Search Campaigns
    if (canAccessDepartment(user, "brand-marketing")) {
      campaigns.forEach((c) => {
        if (c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)) {
          results.push({
            id: c.id,
            type: "campaign",
            title: c.name,
            subtitle: `Campaign • ${c.status}`,
            icon: Megaphone,
          });
        }
      });
    }

    visibleEntries.forEach((e) => {
      let matches = false;
      const author = users.find(u => u.id === e.authorId);
      if (author && author.name.toLowerCase().includes(term)) matches = true;
      
      if (e.entryDate.includes(term) || formatDate(e.entryDate).includes(term) || entryDisplayId(e).toLowerCase().includes(term) || moduleName(e.moduleKey).toLowerCase().includes(term)) matches = true;
      
      if (!matches) {
        for (const [k, v] of Object.entries(e.values)) {
          if (String(v).toLowerCase().includes(term)) {
            matches = true;
            break;
          }
        }
      }

      if (matches || e.comments.some((comment) => comment.body.toLowerCase().includes(term))) {
        const modName = getModule(e.moduleKey)?.name ?? "Entry";
        const isReviewer = canReviewEntry(user, e) && e.authorId !== user.id;
        
        results.push({
          id: e.id,
          type: "entry",
          title: `${modName} (${entryDisplayId(e)})`,
          subtitle: `${author?.name ?? "Unknown"} • ${formatDate(e.entryDate)}`,
          icon: FileText,
          linkParams: { isReviewer, moduleKey: e.moduleKey }
        });
      }
    });

    return results.slice(0, 10);
  }, [query, user, users, visibleEntries, campaigns]);

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search entries, modules, campaigns..."
          className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full rounded-md border border-border bg-popover shadow-md z-50 max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}".
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {searchResults.map((item) => {
                const Icon = item.icon;
                const inner = (
                  <>
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </>
                );

                const linkClass = "flex items-start gap-3 p-3 hover:bg-muted transition-colors w-full text-left";
                const onClick = () => setIsOpen(false);

                if (item.type === "user") {
                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <Link to="/app/settings" onClick={onClick} className={linkClass}>{inner}</Link>
                    </li>
                  );
                } else if (item.type === "module") {
                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <Link to="/app/modules/$moduleKey" params={{ moduleKey: item.id }} onClick={onClick} className={linkClass}>{inner}</Link>
                    </li>
                  );
                } else if (item.type === "campaign") {
                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <Link to="/app/campaigns/$campaignId" params={{ campaignId: item.id }} onClick={onClick} className={linkClass}>{inner}</Link>
                    </li>
                  );
                } else if (item.type === "entry") {
                  if (item.linkParams?.isReviewer) {
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <Link to="/app/approvals/$entryId" params={{ entryId: item.id }} onClick={onClick} className={linkClass}>{inner}</Link>
                      </li>
                    );
                  } else {
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <Link to="/app/modules/$moduleKey/entry/$entryId" params={{ moduleKey: item.linkParams.moduleKey, entryId: item.id }} onClick={onClick} className={linkClass}>{inner}</Link>
                      </li>
                    );
                  }
                }
                return null;
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
