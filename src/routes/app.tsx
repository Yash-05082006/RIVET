import { Link, Outlet, createFileRoute, useNavigate, useLocation, redirect, Navigate } from "@tanstack/react-router";
import { 
  Menu, Bell, LogOut, ArrowLeft,
  Home, Briefcase, LayoutGrid, CheckSquare, BarChart, 
  Users, Building, Shield, List, Settings, ChevronLeft, ChevronRight 
} from "lucide-react";
import { useState } from "react";
import { useRivet } from "../lib/rivet/store";
import { sectionsForUser, roleLabel } from "../lib/rivet/nav";
import { canAccessPath } from "../lib/rivet/permissions";
import mainLogo from "../../assets/RIVET_main_logo_removebg.png";

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

function getNavIcon(label: string) {
  switch (label) {
    case "Home": return <Home className="h-5 w-5" />;
    case "My work": return <Briefcase className="h-5 w-5" />;
    case "Modules": return <LayoutGrid className="h-5 w-5" />;
    case "Approvals": return <CheckSquare className="h-5 w-5" />;
    case "Reports": return <BarChart className="h-5 w-5" />;
    case "Notifications": return <Bell className="h-5 w-5" />;
    case "Users": return <Users className="h-5 w-5" />;
    case "Departments": return <Building className="h-5 w-5" />;
    case "Modules & access": return <Shield className="h-5 w-5" />;
    case "Audit log": return <List className="h-5 w-5" />;
    case "Settings": return <Settings className="h-5 w-5" />;
    default: return <div className="h-5 w-5 rounded bg-muted/50" />;
  }
}

function AppLayout() {
  const { user, ready, signOut, unreadCount, reviewQueue } = useRivet();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!ready) return null;

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  const navSections = sectionsForUser(user)
  const allowed = canAccessPath(user, location.pathname);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/sign-in" });
  };

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile top bar - fixed at top on small screens */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <div className="flex items-center gap-2">
          <img src={mainLogo} alt="RIVET" className="h-8 w-auto object-contain" />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-md"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar - never scrolls with the page */}
      <aside
        className={`relative fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-surface transition-all duration-200 ease-in-out md:static md:translate-x-0 md:flex-shrink-0 ${sidebarWidth} ${
          mobileMenuOpen ? "translate-x-0 !w-64" : "-translate-x-full"
        }`}
      >
        <div className="hidden h-14 items-center justify-center border-b px-4 md:flex relative">
          {!collapsed ? (
            <div className="flex w-full items-center justify-start overflow-hidden">
              <img 
                src={mainLogo} 
                alt="RIVET" 
                className="h-[68px] w-auto max-w-none object-contain -ml-2 select-none pointer-events-none" 
              />
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden">
                <img 
                  src={mainLogo} 
                  alt="RIVET" 
                  className="absolute max-w-none select-none pointer-events-none" 
                  style={{
                    width: "171px",
                    height: "85px",
                    left: "-12px",
                    top: "-22px",
                  }}
                />
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-4 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                collapsed && !mobileMenuOpen ? (
                  <div className="mb-2 h-px w-full bg-border" />
                ) : (
                  <h3 className="mb-2 px-2 text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h3>
                )
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                  let count = 0;
                  if (item.countKey === "unread") count = unreadCount;
                  if (item.countKey === "review") count = reviewQueue.length;

                  const isCompact = collapsed && !mobileMenuOpen;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      title={isCompact ? item.label : undefined}
                      className={`relative flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted hover:text-foreground"
                      } ${isCompact ? "justify-center" : "justify-between"}`}
                    >
                      <div className={`flex items-center ${isCompact ? "" : "gap-3"}`}>
                         {getNavIcon(item.label)}
                         {!isCompact && <span>{item.label}</span>}
                      </div>
                      {!isCompact && count > 0 && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                          {count}
                        </span>
                      )}
                      {isCompact && count > 0 && (
                        <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile + sign-out - pinned to bottom of sidebar */}
        <div className="shrink-0 border-t p-3">
          <div className={`flex items-center ${collapsed && !mobileMenuOpen ? "flex-col gap-4" : "justify-between"} group`}>
            {collapsed && !mobileMenuOpen ? (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-medium text-foreground" title={user.name}>
                  {user.name.charAt(0)}
                </div>
                <button onClick={() => setShowSignOutDialog(true)} className="p-1 text-muted-foreground hover:text-foreground" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-border text-xs font-medium text-foreground">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{roleLabel[user.role]}</span>
                  </div>
                </div>
                <button onClick={() => setShowSignOutDialog(true)} className="p-1 text-muted-foreground hover:text-foreground" title="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main column - scrollable content area, takes remaining width */}
      <div className="flex flex-1 flex-col overflow-hidden pt-14 md:pt-0">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-8">
          <div className="flex items-center gap-4 flex-1">
            {/* Search removed as per PRD */}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app/notifications" className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary"></span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {allowed ? (
              <Outlet />
            ) : (
              <div className="space-y-4">
                <Link to="/app/dashboard" aria-label="Back" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="rounded-lg border border-border bg-surface p-6 text-sm text-foreground">
                  You do not have access to this page.
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {showSignOutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">Sign out</h3>
            <p className="mt-2 text-sm text-muted-foreground">Are you sure you want to sign out?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSignOutDialog(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
