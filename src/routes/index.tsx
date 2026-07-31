import { createFileRoute, Link } from "@tanstack/react-router";
import mainLogo from "../../assets/Main_LOGO_removebg.png";
import structuredDailyLogsImg from "../../assets/Structured_Daily_Logs.png";
import approvalWorkflowsImg from "../../assets/Approval_Workflows.png";
import roleBasedAccessImg from "../../assets/Role_Based_Access.png";
import reportsImg from "../../assets/Reports.png";
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
      { title: "KAIRO | Internal Work Management Platform" },
      {
        name: "description",
        content:
          "KAIRO replaces spreadsheets with a structured, role-governed platform for daily logs, approvals, dashboards and reporting across every department.",
      },
      { property: "og:title", content: "KAIRO — Internal Work Management for Modern Teams" },
      {
        property: "og:description",
        content:
          "Structured logs, manager approvals, dashboards and audit trails. One source of truth for every department.",
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
  return <img src={mainLogo} alt="KAIRO" className={`h-12 w-auto object-contain ${className}`} />;
}

function Nav() {
  const items = ["Product", "Solutions", "Modules", "Customers", "Pricing"];
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-lg">
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

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.28-3.14.76-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function Hero() {
  return (
    <section className="relative border-b border-border bg-background py-16 md:py-20 lg:py-28">
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow">INTERNAL WORK MANAGEMENT</p>
          <h1 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
            Stop asking where the work is.
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
            Work shouldn't disappear across spreadsheets and chats. Bring every update, approval and
            process into one structured workspace.
          </p>
        </div>

        <div className="lg:col-span-5 lg:flex lg:justify-end">
          <form id="get-started" className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="hero-email" className="block text-sm font-semibold text-foreground">
              Work email
            </label>
            <input
              id="hero-email"
              type="email"
              placeholder="you@company.com"
              className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary-light"
            />
            <button
              type="submit"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Sign up
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>

            <div className="my-5 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">Or continue with</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all hover:border-foreground/25 hover:bg-surface hover:shadow-[0_2px_10px_-4px_rgba(17,17,17,0.25)]"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>

            <p className="mt-4 text-xs text-muted-foreground">
              Use a work email so we can match you to your organization.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const cards = [
    {
      heading: "Structured Daily Logs",
      img: structuredDailyLogsImg,
      desc: "Every update is recorded in one place, so work never disappears across spreadsheets and chats.",
    },
    {
      heading: "Approval Workflows",
      img: approvalWorkflowsImg,
      desc: "Route every request through the right people and keep approvals moving without constant follow-ups.",
    },
    {
      heading: "Role-Based Access",
      img: roleBasedAccessImg,
      desc: "Give every employee access to exactly what they need—nothing more, nothing less.",
    },
    {
      heading: "Reports That Are Always Ready",
      img: reportsImg,
      desc: "Generate accurate reports directly from live data instead of rebuilding everything at the end of the month.",
    },
  ];

  return (
    <section id="product" className="border-b border-border bg-surface py-24 lg:py-32">
      <div className="container-page">
        <div className="max-w-[760px]">
          <p className="eyebrow">WHY TEAMS SWITCH</p>
          <h2 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
            Work isn't the problem.
            <br />
            Keeping track of it is.
          </h2>
          <p className="mt-8 text-[16px] leading-relaxed text-muted-foreground">
            Teams don't struggle because work isn't getting done. They struggle because updates live
            everywhere. KAIRO brings every task, approval, and report into one place so everyone
            stays on the same page.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.heading}
              className="group flex flex-col rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-[#FFFFFF] shadow-sm transition-all duration-300 hover:-translate-y-[4px] hover:shadow-md"
            >
              <div className="h-[220px] w-full shrink-0 overflow-hidden rounded-t-[18px]">
                <img src={c.img} alt={c.heading} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col px-[24px] pb-[24px] pt-[20px]">
                <h3 className="text-[18px] font-semibold text-foreground">{c.heading}</h3>
                <p className="mt-[12px] text-[16px] font-normal leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
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
            KAIRO is a single application covering the operational surface most teams have quietly
            duplicated across a dozen sheets.
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
            <p className="eyebrow" style={{ color: "#E88A82" }}>
              Approval workflow
            </p>
            <h2 className="display-heading mt-4 text-4xl sm:text-5xl">
              Nothing is final until a manager says so.
            </h2>
            <p className="mt-5 text-[15px] text-white/70">
              KAIRO couples every log entry to a lightweight approval flow. Managers review from a
              queue, edit counts inline, and either approve or reject with remarks. The employee
              sees the outcome immediately.
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
            Permissions are enforced at the API and at the database, not hidden behind UI toggles.
            Every user sees the right slice of the system and nothing more.
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
      items: ["Campaigns (parent record)", "Branding activities log", "Social media posts"],
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
            Each module ships as a pre-defined form with required fields and dropdowns. Admins can
            activate additional modules for new departments without any code changes.
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
          Set up KAIRO for one department first. Add the rest when you are ready. Your data stays
          yours.
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
              Internal work management for teams that have outgrown spreadsheets.
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
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
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
