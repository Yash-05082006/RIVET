import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, FileText, LayoutGrid, Users, Megaphone } from "lucide-react";
import { useRivet } from "../lib/rivet/store";
import { canModule, accessibleDepartments, accessibleModules } from "../lib/rivet/permissions";
import { users, getModule } from "../lib/rivet/demo-data";
import { formatDateTime } from "../lib/formatDate";

export function GlobalSearch() {
  const { entries, campaigns, user } = useRivet();
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = (() => {
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

    // Search Users (Team members)
    // Employee -> only own data or department team? PRD: employee (own data). But team members maybe only in their dept.
    // Manager -> assigned dept, Admin -> org-wide.
    users.forEach((u) => {
      const isVisible = user.role === "admin" || 
                        user.id === u.id || 
                        user.departmentIds.some(d => u.departmentIds.includes(d));
      if (isVisible && (u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.designation.toLowerCase().includes(term))) {
        results.push({
          id: u.id,
          type: "user",
          title: u.name,
          subtitle: `${u.designation} • ${u.email}`,
          icon: Users,
        });
      }
    });

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
    if (user.role === "admin" || user.departmentIds.includes("brand-marketing")) {
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

    // Search Entries
    // Scope: employee (own data or dept shared data), manager (assigned dept), admin (org-wide)
    // Fortunately, we can just use `canModule(user, "view", entry.moduleKey)` and `entry.authorId === user.id` etc.
    // Actually, `store.tsx` has `visibleEntries` which respects permissions!
    // Let's use `entries` but filter by `visibleEntries`? 
    // Wait, we don't have `visibleEntries` exported from `useRivet`! Let's import it if we need, or just reimplement the check.
    // Wait, let's look at `store.tsx` again.
    
    // I'll manually filter for simplicity based on store logic:
    const visibleEntries = entries.filter((e) => {
      if (user.role === "admin") return true;
      if (user.role === "manager") return user.departmentIds.includes(e.departmentId) && e.status !== "draft";
      if (e.authorId === user.id) return true;
      const mod = getModule(e.moduleKey);
      if (mod?.scope === "department" && user.departmentIds.includes(e.departmentId) && e.status !== "draft") return true;
      return false;
    });

    visibleEntries.forEach((e) => {
      let matches = false;
      const author = users.find(u => u.id === e.authorId);
      if (author && author.name.toLowerCase().includes(term)) matches = true;
      
      if (e.entryDate.includes(term)) matches = true;
      
      if (!matches) {
        for (const [k, v] of Object.entries(e.values)) {
          if (String(v).toLowerCase().includes(term)) {
            matches = true;
            break;
          }
        }
      }

      if (matches) {
        const modName = getModule(e.moduleKey)?.name ?? "Entry";
        const isReviewer = (user.role === "admin" || user.role === "manager") && e.authorId !== user.id;
        
        results.push({
          id: e.id,
          type: "entry",
          title: `${modName} (${e.id})`,
          subtitle: `${author?.name ?? "Unknown"} • ${e.entryDate}`,
          icon: FileText,
          linkParams: { isReviewer, moduleKey: e.moduleKey }
        });
      }
    });

    return results.slice(0, 10);
  })();

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search entries, modules, people..."
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
