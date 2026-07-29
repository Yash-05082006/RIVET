import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  Bell,
  ShieldCheck,
  LayoutGrid,
  MessageSquare,
  BarChart3,
  History,
  Users,
  FileSpreadsheet,
  Building2,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "KAIRO — Internal Work Management for Modern Teams" },
      {
        name: "description",
        content:
          "KAIRO replaces spreadsheets with a structured, role-governed platform for daily logs, approvals, dashboards, and reporting across every department.",
      },
      { property: "og:title", content: "KAIRO — Internal Work Management for Modern Teams" },
      {
        property: "og:description",
        content:
          "Structured logs, manager approvals, dashboards, and audit trails. One source of truth for every department.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
      { rel: "canonical", href: "/" },
    ],
  }),
});

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 2v12M3 8l7-6M3 8l7 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-[17px] font-bold tracking-tight text-foreground">KAIRO</span>
    </div>
  );
}

function Nav() {
  const items = ["Product", "Solutions", "Modules", "Customers", "Pricing"];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {items.map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#signin"
            className="hidden text-sm font-medium text-foreground/80 hover:text-foreground sm:inline"
          >
            Sign in
          </a>
          <a
            href="#get-started"
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E5E5E5 1px, transparent 1px), linear-gradient(to bottom, #E5E5E5 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 20% 0%, black 40%, transparent 70%)",
        }}
      />
      <div className="container-page relative grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="eyebrow">Internal Work Management</p>
          <h1 className="display-heading mt-5 text-[44px] text-foreground sm:text-6xl lg:text-[76px]">
            Retire the spreadsheets. Run the work.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            KAIRO gives every department a single, structured place to log
            daily activity, route work through approvals, and report on it
            without stitching files together at the end of the month.
          </p>

          <form
            id="get-started"
            className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
              aria-label="Work email"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Request access
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Use a work email so we can match you to your organization.
          </p>
        </div>

        <div className="lg:col-span-5">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}

function HeroPreview() {
  const rows = [
    { name: "Weekly meeting report", who: "R. Menon", status: "Approved" },
    { name: "Zoom session log", who: "A. Iyer", status: "Pending" },
    { name: "Branding activity", who: "S. Kapoor", status: "Pending" },
    { name: "Data management log", who: "J. Thomas", status: "Approved" },
    { name: "Call log — Branch 04", who: "P. Rao", status: "Rejected" },
  ] as const;
  const badge = (s: string) =>
    s === "Approved"
      ? "bg-[#EEF7EF] text-[#1F6B3A] border-[#D6ECDA]"
      : s === "Pending"
        ? "bg-[#FFF7E8] text-[#8A5A00] border-[#F1E1B8]"
        : "bg-[#FBECEA] text-[#8A2A22] border-[#EFD1CD]";
  return (
    <div className="relative rounded-2xl border border-border bg-background p-3 shadow-[0_20px_60px_-30px_rgba(11,11,11,0.25)]">
      <div className="flex items-center gap-2 border-b border-border px-2 pb-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#E5E5E5]" />
        </div>
        <div className="mx-auto flex h-7 items-center gap-2 rounded-full bg-surface px-3 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          kairo.app / approvals
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-foreground">Pending approvals</p>
            <p className="text-xs text-muted-foreground">Research department • Today</p>
          </div>
          <span className="inline-flex h-6 items-center rounded-full bg-primary/10 px-2 text-[11px] font-semibold text-primary">
            12 items
          </span>
        </div>
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-3 bg-background px-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.who}</p>
              </div>
              <span
                className={`inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-[11px] font-medium ${badge(
                  r.status,
                )}`}
              >
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TrustBar() {
  const names = ["Northgate", "Lendigo", "Meridian", "Halcyon", "Everline", "Parkview"];
  return (
    <section className="border-b border-border bg-background">
      <div className="container-page py-12">
        <p className="text-center text-sm text-muted-foreground">
          Built for operations, research, and marketing teams at growing organizations
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 opacity-70 sm:grid-cols-3 md:grid-cols-6">
          {names.map((n) => (
            <div
              key={n}
              className="text-center text-[15px] font-semibold tracking-tight text-foreground/70"
            >
              {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const before = [
    "Trackers spread across per-person files",
    "Anyone with a link can edit or delete",
    "No approval before the number becomes 'final'",
    "Monthly reports built by hand",
  ];
  const after = [
    "One place for every log entry",
    "Role-based access enforced end to end",
    "Draft → Submitted → Approved workflow",
    "Reports generated from the source of truth",
  ];
  return (
    <section id="product" className="border-b border-border bg-surface">
      <div className="container-page py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Why teams switch</p>
          <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
            Spreadsheets were never meant to run a department.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            KAIRO replaces per-person Excel files with a governed system. Same
            data. Correct types. Managed access. Reporting that does not
            require rebuilding a pivot table every month.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" /> Before KAIRO
            </div>
            <ul className="mt-5 space-y-3">
              {before.map((t) => (
                <li key={t} className="flex gap-3 text-[15px] text-foreground/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-background p-8 ring-1 ring-primary/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" /> With KAIRO
            </div>
            <ul className="mt-5 space-y-3">
              {after.map((t) => (
                <li key={t} className="flex gap-3 text-[15px] text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const items = [
    {
      icon: LayoutGrid,
      title: "Structured log entries",
      body: "Every daily log, meeting report, call, or branding task is a typed form with required fields. No free-form cells, no ambiguity.",
    },
    {
      icon: CheckCircle2,
      title: "Approval workflow",
      body: "Entries move from Draft to Submitted to Approved or Rejected. Managers can edit before approving. Nothing final without sign-off.",
    },
    {
      icon: ShieldCheck,
      title: "Role-based access",
      body: "Admins, Managers, and Employees see only what they should. Permissions are enforced at the API and the database.",
    },
    {
      icon: BarChart3,
      title: "Dashboards and reports",
      body: "Weekly meeting summaries, monthly department totals, branch-wise breakdowns. Exportable to Excel and PDF.",
    },
    {
      icon: MessageSquare,
      title: "Comments and mentions",
      body: "Every entry has a comment thread. Tag a colleague with @ and they get an in-app notification.",
    },
    {
      icon: History,
      title: "Full audit log",
      body: "Every create, edit, approve, and reject is recorded with actor, timestamp, and field-level diff. Admin-only view.",
    },
    {
      icon: Search,
      title: "Global search",
      body: "Search across modules and departments by keyword, employee, date, or module type. Scoped correctly per role.",
    },
    {
      icon: Bell,
      title: "Reminders and digests",
      body: "In-app and email notifications for submissions, approvals, rejections, and pending queues. Daily reminders at your cutoff.",
    },
  ];
  return (
    <section id="modules" className="border-b border-border">
      <div className="container-page py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">What&apos;s inside</p>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
              Everything a department needs, in one place.
            </h2>
          </div>
          <p className="max-w-md text-[15px] text-muted-foreground">
            KAIRO is a single application covering the operational surface
            most teams have quietly duplicated across a dozen sheets.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-6 md:p-7">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-[16px] font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const stages = [
    {
      label: "Draft",
      desc: "Employee saves the entry. Only they can see it.",
    },
    {
      label: "Submitted",
      desc: "Sent for review. Locked from further edits by the employee.",
    },
    {
      label: "Approved",
      desc: "Manager accepts. The entry becomes part of the record.",
    },
    {
      label: "Rejected",
      desc: "Sent back with remarks. Employee can revise and resubmit.",
    },
  ];
  return (
    <section id="solutions" className="border-b border-border bg-foreground text-background">
      <div className="container-page py-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p
              className="eyebrow"
              style={{ color: "#E88A82" }}
            >
              Approval workflow
            </p>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
              Nothing is final until a manager says so.
            </h2>
            <p className="mt-5 text-[15px] text-white/70">
              KAIRO couples every log entry to a lightweight approval flow.
              Managers review from a queue, edit counts inline, and either
              approve or reject with remarks. The employee sees the outcome
              immediately.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
              <Users className="h-4 w-4" />
              List view and Kanban board, both supported.
            </div>
          </div>

          <div className="lg:col-span-7">
            <ol className="grid gap-4 sm:grid-cols-2">
              {stages.map((s, i) => (
                <li
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-white/20 text-[12px] font-semibold text-white/80">
                      {i + 1}
                    </span>
                    <span className="text-[15px] font-semibold">{s.label}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    {
      title: "Admin",
      body: "Full access across departments. Creates users, assigns roles, configures modules, and exports any dataset.",
      bullets: ["Cross-department dashboards", "User & role management", "Audit log access"],
    },
    {
      title: "Manager",
      body: "Owns their department. Approves entries, edits before approval, adds entries on behalf of the team, and pulls monthly reports.",
      bullets: ["Approval queue & board", "Department dashboards", "Team submission status"],
    },
    {
      title: "Employee",
      body: "Logs their own work across the modules active for their department. Sees their history and the status of every entry.",
      bullets: ["Daily log forms", "Personal history", "Approval notifications"],
    },
  ];
  return (
    <section id="customers" className="border-b border-border">
      <div className="container-page py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Built for three roles</p>
          <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
            Access that matches responsibility.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Permissions are enforced at the API and at the database, not
            hidden behind UI toggles. Every user sees the right slice of the
            system and nothing more.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded-2xl border border-border bg-background p-7 transition-colors hover:border-foreground/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{r.title}</h3>
                <span className="inline-flex h-6 items-center rounded-full border border-border px-2 text-[11px] font-medium text-muted-foreground">
                  Role
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm text-foreground/80">
                {r.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  const modules = [
    {
      dept: "Research",
      items: [
        "Weekly meeting report",
        "Daily meeting attendance log",
        "Webinar / Zoom series",
        "Branch-wise meeting data",
      ],
    },
    {
      dept: "Data Management",
      items: ["Webinar attendance log", "Data management log", "Call log"],
    },
    {
      dept: "Brand & Marketing",
      items: [
        "Campaigns (parent record)",
        "Branding activities log",
        "Social media posts",
      ],
    },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className="container-page py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Department modules</p>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
              Typed forms for the work you already do.
            </h2>
          </div>
          <p className="max-w-md text-[15px] text-muted-foreground">
            Each module ships as a pre-defined form with required fields and
            dropdowns. Admins can activate additional modules for new
            departments without any code changes.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {modules.map((m) => (
            <div key={m.dept} className="rounded-2xl border border-border bg-background p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                {m.dept}
              </div>
              <ul className="mt-5 space-y-3">
                {m.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm text-foreground/85 first:border-t-0 first:pt-0"
                  >
                    {item}
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { n: "1", l: "source of truth for every department" },
    { n: "3", l: "roles with permissions enforced end to end" },
    { n: "12", l: "months of audit history retained by default" },
  ];
  return (
    <section id="pricing" className="border-b border-border">
      <div className="container-page py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Trusted foundations</p>
          <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
            Built the way enterprise software should be built.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.l} className="bg-background p-8">
              <div className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                {s.n}
              </div>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="container-page py-24 text-center">
        <h2 className="display-heading mx-auto max-w-3xl text-4xl sm:text-6xl">
          Move your operations off spreadsheets.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] text-white/70">
          Set up KAIRO for one department first. Add the rest when you are
          ready. Your data stays yours.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#get-started"
            className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Request access
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <a
            href="#product"
            className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Talk to sales
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { h: "Product", items: ["Overview", "Modules", "Approvals", "Reporting", "Audit log"] },
    { h: "Solutions", items: ["Research teams", "Data operations", "Brand & marketing"] },
    { h: "Company", items: ["About", "Customers", "Careers", "Contact"] },
    { h: "Resources", items: ["Documentation", "Security", "Changelog", "Status"] },
  ];
  return (
    <footer className="bg-background">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Internal work management for teams that have outgrown
              spreadsheets.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <p className="text-[13px] font-semibold text-foreground">{c.h}</p>
              <ul className="mt-4 space-y-3">
                {c.items.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} KAIRO. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <ProblemSection />
        <FeatureGrid />
        <WorkflowSection />
        <RolesSection />
        <ModulesSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
