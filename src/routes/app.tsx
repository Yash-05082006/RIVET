import { Link, Outlet, createFileRoute, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { Menu, Search, Bell, LogOut, Check } from "lucide-react";
import { useState } from "react";
import { useRivet, DEMO_USER_BY_ROLE } from "../lib/rivet/store";
import { sectionsForRole, roleLabel } from "../lib/rivet/nav";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const storedId = window.localStorage.getItem("rivet.session.userId");
      if (!storedId) {
        throw redirect({ to: "/sign-in" });
      }
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const { user, ready, signOut, unreadCount, signIn, reviewQueue } = useRivet();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!ready) return null;

  if (!user) {
    navigate({ to: "/sign-in", replace: true });
    return null;
  }

  const navSections = sectionsForRole(user.role);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
            R
          </div>
          <span className="font-semibold">RIVET</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-md"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-surface transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden h-14 items-center gap-2 border-b px-4 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-lg">
              R
            </div>
            <span className="font-semibold tracking-tight">RIVET</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
            {navSections.map((section, idx) => (
              <div key={idx}>
                {section.title && (
                  <h3 className="mb-2 px-2 text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                    let count = 0;
                    if (item.countKey === "unread") count = unreadCount;
                    if (item.countKey === "review") count = reviewQueue.length;

                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span>{item.label}</span>
                        {count > 0 && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            {count}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t p-4">
            {/* DEV ONLY ROLE SWITCHER */}
            <div className="mb-4 rounded-md border border-dashed border-primary/50 bg-primary-light p-2">
              <div className="mb-1 text-[10px] font-bold tracking-wider text-primary flex items-center justify-between">
                <span>DEV ROLE SWITCHER</span>
              </div>
              <div className="flex flex-col gap-1">
                {(["employee", "manager", "admin"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => signIn(DEMO_USER_BY_ROLE[r])}
                    className={`flex items-center justify-between rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      user.role === r ? "bg-primary text-primary-foreground" : "hover:bg-white/50 text-primary"
                    }`}
                  >
                    {roleLabel[r]}
                    {user.role === r && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-medium text-foreground">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{roleLabel[user.role]}</span>
                </div>
              </div>
              <button onClick={handleSignOut} className="p-1 text-muted-foreground hover:text-foreground" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden max-w-md flex-1 items-center gap-2 rounded-md border bg-surface px-3 py-1.5 text-sm text-muted-foreground md:flex">
              <Search className="h-4 w-4" />
              <span className="flex-1">Search anything...</span>
              <kbd className="hidden rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:inline-block">
                Ctrl+K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
