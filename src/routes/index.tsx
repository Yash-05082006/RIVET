import { createFileRoute, Link } from "@tanstack/react-router";
import mainLogo from "../../assets/RIVET_main_logo_removebg.png";
import structuredDailyLogsImg from "../../assets/Structured_Daily_Logs.png";
import approvalWorkflowsImg from "../../assets/Approval_Workflows.png";
import roleBasedAccessImg from "../../assets/Role_Based_Access.png";
import reportsImg from "../../assets/Reports.png";
import person1 from "../../assets/random_person_1.jpg";
import person2 from "../../assets/random_person_2.jpg";
import person3 from "../../assets/random_person.jpeg";
import rivetFavicon from "../../assets/RIVET_Favicon.png";
import {
  ArrowRight,
  Users,
  Building2,
  ChevronRight,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Bell,
  ScrollText,
  ShieldCheck,
  Shield,
  Lock,
  Sparkles,
  Activity,
  Layers,
  Database,
  LineChart,
  Check,
  Sliders,
  BadgeCheck,
  Clock,
  ArrowUpRight,
  Workflow,
  KeyRound,
  Star,
  Zap,
  Code2,
  RefreshCw,
  CheckSquare,
} from "lucide-react";
import icon1 from "../Icon_Images/1'.png";
import icon2 from "../Icon_Images/2'.png";
import icon3 from "../Icon_Images/3'.png";
import icon4 from "../Icon_Images/4'.png";
import icon5 from "../Icon_Images/5'.png";
import icon6 from "../Icon_Images/6'.png";
import icon7 from "../Icon_Images/7'.png";
import icon8 from "../Icon_Images/8'.png";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "RIVET | Internal Work Management Platform" },
      {
        name: "description",
        content:
          "RIVET replaces spreadsheets with a structured, role-governed platform for daily logs, approvals, dashboards and reporting across every department.",
      },
      { property: "og:title", content: "RIVET | Internal Work Management for Modern Teams" },
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
  return <img src={mainLogo} alt="RIVET" className={`h-14 w-auto object-contain ${className}`} />;
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
      desc: "Give every employee access to exactly what they need, nothing more, nothing less.",
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
        <div className="max-w-[760px] mx-auto text-center">
          <p className="eyebrow">WHY TEAMS SWITCH</p>
          <h2 className="display-heading mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1]">
            Work isn't the problem.
            <br />
            Keeping track of it is.
          </h2>
          <p className="mt-8 text-[16px] leading-relaxed text-muted-foreground">
            Teams don't struggle because work isn't getting done. They struggle because updates live
            everywhere. RIVET brings every task, approval, and report into one place so everyone
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
      icon: icon1,
      title: "Daily Workspaces",
      body: "Capture every task, meeting, activity and department update in structured workspaces designed for how your team actually works.",
    },
    {
      icon: icon2,
      title: "Review & Approval",
      body: "Keep every submission moving through a clear review process with approvals, rejections, comments and complete accountability.",
    },
    {
      icon: icon3,
      title: "Department Dashboards",
      body: "See what your team is working on, what's pending, what's overdue and what's completed without chasing updates.",
    },
    {
      icon: icon4,
      title: "Search Everything",
      body: "Instantly find any record, employee, project, meeting or activity across departments from one unified search.",
    },
    {
      icon: icon5,
      title: "Reports & Exports",
      body: "Generate accurate reports from live data and export them whenever you need without rebuilding spreadsheets every month.",
    },
    {
      icon: icon6,
      title: "Notifications & Reminders",
      body: "Keep work moving with timely reminders, approval alerts and updates that reach the right people automatically.",
    },
    {
      icon: icon7,
      title: "Complete Activity History",
      body: "Every edit, approval, comment and status change is recorded automatically, giving your team a reliable audit trail.",
    },
    {
      icon: icon8,
      title: "Built for Every Department",
      body: "Research, Marketing, Data Management, Operations and future teams all work from the same platform without changing how RIVET works underneath.",
    },
  ];

  return (
    <section id="modules" className="border-b border-border py-24 lg:py-32">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
      <div className="container-page">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="eyebrow">WHAT'S INSIDE</p>
          <h2 className="display-heading mt-4 text-[56px] font-bold leading-[1.05] lg:text-[64px]">
            Everything your team needs.
            <br />
            Nothing they'll have to piece together.
          </h2>
          <p className="mt-[24px] text-[18px] font-normal leading-relaxed text-[#5B5B5B]">
            Most departments rely on a collection of spreadsheets, chats, emails and documents just
            to get work done. RIVET brings everything into one connected workspace, so every update,
            approval, discussion and report happens where it belongs.
          </p>
        </div>

        <div className="mt-[72px] grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon, title, body }, index) => (
            <div
              key={title}
              className="animate-fade-in-up group flex cursor-pointer flex-col rounded-[20px] border border-[rgba(0,0,0,0.06)] bg-[#FFFFFF] p-[32px] transition-all duration-[250ms] ease-out will-change-transform hover:-translate-y-[6px] hover:border-primary hover:bg-[#FAFAFA] hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={icon}
                alt={title}
                loading="lazy"
                className="h-14 w-14 object-contain transition-transform duration-[250ms] ease-out will-change-transform group-hover:scale-[1.05] md:h-16 md:w-16 lg:h-[76px] lg:w-[76px]"
              />
              <h3 className="mt-[20px] text-[22px] font-semibold text-foreground transition-colors duration-[250ms] group-hover:text-primary">
                {title}
              </h3>
              <p className="mt-[14px] text-[16px] font-normal leading-relaxed text-[#5B5B5B]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="solutions" className="border-b border-border bg-foreground text-background">
      <style>{`
        /* ── Jira-Style Enterprise Network Micro-Interactions ── */
        .wf-node-interactive {
          cursor: default;
          transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms ease;
        }
        .wf-node-interactive:hover {
          transform: translate(-50%, -50%) scale(1.08) !important;
          z-index: 35 !important;
        }
        .wf-avatar-interactive {
          cursor: default;
          transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), filter 200ms ease;
        }
        .wf-avatar-interactive:hover {
          transform: translate(-50%, -50%) scale(1.05) !important;
          z-index: 35 !important;
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes wf-central-pulse {
            0%, 100% { box-shadow: 0 0 0 0px rgba(56, 189, 248, 0.4), 0 0 28px rgba(56, 189, 248, 0.3); }
            50%       { box-shadow: 0 0 0 7px rgba(56, 189, 248, 0.12), 0 0 40px rgba(56, 189, 248, 0.45); }
          }
          .wf-focal-hub {
            animation: wf-central-pulse 3.5s ease-in-out infinite;
          }
        }
      `}</style>

      <div className="container-page py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">

          {/* ── LEFT: Text content (Untouched) ── */}
          <div className="lg:col-span-4">
            <p className="eyebrow" style={{ color: "#E88A82" }}>
              Approval workflow
            </p>
            <h2 className="display-heading mt-5 text-4xl sm:text-5xl">
              Nothing is final until a manager says so.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/70">
              RIVET couples every log entry to a lightweight approval flow. Managers review from a
              queue, edit counts inline, and either approve or reject with remarks. The employee
              sees the outcome immediately.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
              <Users className="h-4 w-4 shrink-0" />
              List view and Kanban board, both supported.
            </div>
          </div>

          {/* ── RIGHT: Expansive Connected Ecosystem (Starts Outside Canvas) ── */}
          <div className="lg:col-span-8 lg:flex lg:justify-end">
            <div
              className="relative mx-auto w-full select-none overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0e12] shadow-2xl lg:mx-0"
              style={{ maxWidth: 760, aspectRatio: "760 / 560" }}
            >
              {/* ── SVG LAYER: Grid, Wireframes & Smooth Curved Connectors ── */}
              <svg
                className="absolute inset-0 h-full w-full pointer-events-none"
                viewBox="0 0 760 560"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  {/* Subtle Jira-style blueprint background grid */}
                  <pattern id="jira-wf-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
                    <circle cx="40" cy="40" r="1" fill="rgba(255, 255, 255, 0.07)" />
                  </pattern>
                </defs>

                {/* Blueprint grid fill */}
                <rect width="760" height="560" fill="url(#jira-wf-grid)" />

                {/* ── STRUCTURAL WIREFRAME BOXES (Jira-style bounding outlines) ── */}
                {/* Top Green Wireframe */}
                <rect
                  x="250"
                  y="22"
                  width="210"
                  height="90"
                  rx="18"
                  fill="rgba(34, 197, 94, 0.025)"
                  stroke="rgba(34, 197, 94, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Bottom Amber Wireframe */}
                <rect
                  x="290"
                  y="468"
                  width="210"
                  height="88"
                  rx="18"
                  fill="rgba(251, 191, 36, 0.025)"
                  stroke="rgba(251, 191, 36, 0.18)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* ── 1. OFF-CANVAS BLEED CONNECTORS (Starting & Exiting outside the canvas) ── */}
                <path d="M 180 50 C 130 25, 80 5, 20 -20" stroke="#22c55e" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 355 68 C 365 20, 375 -15, 385 -40" stroke="#22c55e" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 650 65 C 700 45, 750 25, 800 0" stroke="#22c55e" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 745 110 C 770 120, 795 130, 820 140" stroke="#22c55e" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 715 290 C 750 290, 785 290, 820 290" stroke="#38bdf8" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 690 440 C 735 435, 775 425, 815 415" stroke="#c084fc" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M 690 535 C 730 555, 770 575, 810 595" stroke="#c084fc" strokeWidth="1.8" strokeOpacity="0.6" strokeLinecap="round" />

                {/* ── 2. GREEN BRANCH (Top: Daily Logs & Input Satellites) ── */}
                <path d="M 355 68 C 290 68, 230 50, 180 50" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 355 68 C 410 68, 470 45, 520 45" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 520 45 C 570 45, 610 65, 650 65" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 650 65 C 690 65, 715 110, 745 110" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 355 68 C 410 70, 455 100, 495 100" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 355 68 C 390 90, 420 120, 430 150" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                <path d="M 355 68 C 320 100, 290 130, 280 160" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />
                {/* Green Trunk down into central Approval Hub */}
                <path d="M 430 150 C 435 185, 440 225, 440 260" stroke="#22c55e" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />

                {/* ── 3. ELECTRIC BLUE BRANCH (Employee to MAIN CENTRAL APPROVAL HUB) ── */}
                <path d="M 180 260 C 135 240, 105 205, 75 180" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 180 260 L 50 260" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 180 260 C 135 280, 105 320, 75 345" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 180 260 C 185 300, 190 340, 195 380" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 180 260 C 210 210, 250 175, 280 160" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                {/* PRIMARY CENTRAL TRUNK: Employee -> Approval */}
                <path d="M 180 260 C 270 260, 350 260, 440 260" stroke="#38bdf8" strokeWidth="2.8" strokeOpacity="0.95" strokeLinecap="round" />
                {/* Spokes radiating OUT from Central Approval Hub */}
                <path d="M 440 260 C 495 240, 550 215, 600 205" stroke="#38bdf8" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 440 260 L 570 260" stroke="#38bdf8" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 440 260 C 490 285, 545 320, 590 335" stroke="#38bdf8" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 440 260 C 455 300, 465 345, 475 385" stroke="#38bdf8" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 440 260 C 390 295, 345 330, 310 365" stroke="#38bdf8" strokeWidth="2.2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 570 260 C 620 270, 670 285, 715 290" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.85" strokeLinecap="round" />

                {/* ── 4. AMBER / GOLD BRANCH (Bottom: Manager & Workspace Role Access) ── */}
                <path d="M 150 465 C 180 450, 210 440, 240 435" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 240 435 C 220 375, 195 315, 180 260" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 150 465 C 180 475, 210 488, 235 495" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 150 465 C 230 490, 310 512, 395 512" stroke="#fbbf24" strokeWidth="2.4" strokeOpacity="0.95" strokeLinecap="round" />
                <path d="M 310 365 C 340 415, 375 465, 395 512" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 310 365 C 245 400, 195 435, 150 465" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />

                {/* ── 5. PURPLE / VIOLET BRANCH (Right: Administrator & Audit Network) ── */}
                <path d="M 690 440 C 655 430, 620 420, 585 415" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 690 440 C 650 455, 615 468, 575 475" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 690 440 L 690 535" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 585 415 C 550 405, 510 395, 475 385" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 575 475 C 550 495, 530 510, 505 525" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />
                <path d="M 505 525 C 470 520, 435 515, 395 512" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.9" strokeLinecap="round" />

                {/* ── CONNECTOR JOINT ANCHOR DOTS ── */}
                <circle cx="180" cy="50" r="3.5" fill="#22c55e" />
                <circle cx="520" cy="45" r="3.5" fill="#22c55e" />
                <circle cx="650" cy="65" r="3.5" fill="#22c55e" />
                <circle cx="745" cy="110" r="3.5" fill="#22c55e" />
                <circle cx="495" cy="100" r="3.5" fill="#22c55e" />
                <circle cx="430" cy="150" r="3.5" fill="#22c55e" />
                <circle cx="280" cy="160" r="3.5" fill="#22c55e" />
                <circle cx="75" cy="180" r="3.5" fill="#38bdf8" />
                <circle cx="50" cy="260" r="3.5" fill="#38bdf8" />
                <circle cx="75" cy="345" r="3.5" fill="#38bdf8" />
                <circle cx="195" cy="380" r="3.5" fill="#38bdf8" />
                <circle cx="600" cy="205" r="3.5" fill="#38bdf8" />
                <circle cx="570" cy="260" r="3.5" fill="#38bdf8" />
                <circle cx="590" cy="335" r="3.5" fill="#38bdf8" />
                <circle cx="715" cy="290" r="3.5" fill="#38bdf8" />
                <circle cx="310" cy="365" r="3.5" fill="#38bdf8" />
                <circle cx="475" cy="385" r="3.5" fill="#38bdf8" />
                <circle cx="240" cy="435" r="3.5" fill="#fbbf24" />
                <circle cx="235" cy="495" r="3.5" fill="#fbbf24" />
                <circle cx="585" cy="415" r="3.5" fill="#c084fc" />
                <circle cx="575" cy="475" r="3.5" fill="#c084fc" />
                <circle cx="505" cy="525" r="3.5" fill="#c084fc" />
                <circle cx="690" cy="535" r="3.5" fill="#c084fc" />
              </svg>

              {/* ════════════════════════════════════════════════════════════
                  CIRCULAR AVATARS (Natural Portrait Framing & Glowing Halos)
              ════════════════════════════════════════════════════════════ */}

              {/* 1. EMPLOYEE AVATAR (Center-Left) */}
              <div
                className="wf-avatar-interactive absolute z-20"
                style={{
                  left: "calc((180 / 760) * 100%)",
                  top: "calc((260 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3.5px] border-sky-400 bg-[#081524] shadow-[0_0_32px_rgba(56,189,248,0.45),0_8px_24px_rgba(0,0,0,0.85)]">
                    <img
                      src={person1}
                      alt="Employee"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "50% 25%" }}
                    />
                  </div>
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-400/50 bg-[#091422] px-3 py-0.5 text-[11px] font-semibold tracking-wide text-sky-200 shadow-lg">
                    Employee
                  </span>
                </div>
              </div>

              {/* 2. MANAGER AVATAR (Bottom-Left) */}
              <div
                className="wf-avatar-interactive absolute z-20"
                style={{
                  left: "calc((150 / 760) * 100%)",
                  top: "calc((465 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3.5px] border-amber-400 bg-[#181108] shadow-[0_0_32px_rgba(251,191,36,0.45),0_8px_24px_rgba(0,0,0,0.85)]">
                    <img
                      src={person2}
                      alt="Manager"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "50% 18%" }}
                    />
                  </div>
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-amber-400/50 bg-[#1a1206] px-3 py-0.5 text-[11px] font-semibold tracking-wide text-amber-200 shadow-lg">
                    Manager
                  </span>
                </div>
              </div>

              {/* 3. ADMINISTRATOR AVATAR (Anchored on Right Edge, Bleeding Outward) */}
              <div
                className="wf-avatar-interactive absolute z-20"
                style={{
                  left: "calc((690 / 760) * 100%)",
                  top: "calc((440 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-full border-[3.5px] border-purple-400 bg-[#160b24] shadow-[0_0_32px_rgba(192,132,252,0.45),0_8px_24px_rgba(0,0,0,0.85)]">
                    <img
                      src={person3}
                      alt="Administrator"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "50% 32%" }}
                    />
                  </div>
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-purple-400/50 bg-[#160c24] px-3 py-0.5 text-[11px] font-semibold tracking-wide text-purple-200 shadow-lg">
                    Administrator
                  </span>
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  TIER 1: PRIMARY NODES (Filled Pill Backgrounds, Largest Size)
              ════════════════════════════════════════════════════════════ */}

              {/* 1. THE MAIN CENTRAL HUB: Approval (Focal Anchor) */}
              <div
                className="wf-node-interactive wf-focal-hub absolute z-30 flex items-center gap-3 rounded-2xl border-[2.5px] border-sky-400 bg-[#071529] px-6 py-3.5 shadow-[0_0_36px_rgba(56,189,248,0.4),0_8px_24px_rgba(0,0,0,0.85)] backdrop-blur-md"
                style={{
                  left: "calc((440 / 760) * 100%)",
                  top: "calc((260 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <BadgeCheck className="h-5 w-5 text-sky-400 shrink-0" />
                <span className="text-[15px] font-bold tracking-wider text-white font-mono">Approval</span>
              </div>

              {/* 2. TOP PRIMARY HUB: Daily Logs */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2.5 rounded-xl border-2 border-emerald-400 bg-[#061a10] px-5 py-3 shadow-[0_0_24px_rgba(34,197,94,0.3),0_6px_18px_rgba(0,0,0,0.7)] backdrop-blur-md"
                style={{
                  left: "calc((355 / 760) * 100%)",
                  top: "calc((68 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <CheckSquare className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span className="text-[13px] font-bold tracking-wide text-white font-mono">Daily Logs</span>
              </div>

              {/* 3. BOTTOM PRIMARY HUB: Workspace / Role Access */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2.5 rounded-xl border-2 border-amber-400 bg-[#1a1106] px-5 py-3 shadow-[0_0_24px_rgba(251,191,36,0.3),0_6px_18px_rgba(0,0,0,0.7)] backdrop-blur-md"
                style={{
                  left: "calc((395 / 760) * 100%)",
                  top: "calc((512 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <ShieldCheck className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                <span className="text-[13px] font-bold tracking-wide text-white font-mono">Role Access</span>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  TIER 2: SECONDARY NODES (Outlined / Hollow Pills)
              ════════════════════════════════════════════════════════════ */}

              {/* Department */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2 rounded-full border border-emerald-500/60 bg-[#081810]/70 px-4 py-1.5 shadow-sm backdrop-blur-md"
                style={{
                  left: "calc((280 / 760) * 100%)",
                  top: "calc((160 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-white/90">Department</span>
              </div>

              {/* Reports */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2 rounded-full border border-sky-500/60 bg-[#081524]/70 px-4 py-1.5 shadow-sm backdrop-blur-md"
                style={{
                  left: "calc((310 / 760) * 100%)",
                  top: "calc((365 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <LineChart className="h-3.5 w-3.5 text-sky-300 shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-white/90">Reports</span>
              </div>

              {/* Dashboard */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#081524]/70 px-4 py-1.5 shadow-sm backdrop-blur-md"
                style={{
                  left: "calc((600 / 760) * 100%)",
                  top: "calc((205 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Activity className="h-3.5 w-3.5 text-sky-300 shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-white/90">Dashboard</span>
              </div>

              {/* Comments */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2 rounded-full border border-purple-500/60 bg-[#140a20]/70 px-4 py-1.5 shadow-sm backdrop-blur-md"
                style={{
                  left: "calc((475 / 760) * 100%)",
                  top: "calc((385 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 text-purple-300 shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-white/90">Comments</span>
              </div>

              {/* Search (Bleeding into the right canvas edge) */}
              <div
                className="wf-node-interactive absolute z-20 flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#081524]/70 px-4 py-1.5 shadow-sm backdrop-blur-md"
                style={{
                  left: "calc((715 / 760) * 100%)",
                  top: "calc((290 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Eye className="h-3.5 w-3.5 text-sky-300 shrink-0" />
                <span className="text-xs font-semibold tracking-wide text-white/90">Search</span>
              </div>

              {/* ════════════════════════════════════════════════════════════
                  TIER 3: TERTIARY NODES (Small Squircle Icon Tiles — 38px × 38px)
              ════════════════════════════════════════════════════════════ */}

              {/* ── 4 RECURRING RIVET FAVICON CONNECTOR NODES ── */}
              {/* Favicon 1 (Top-Right Green Satellite) */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((495 / 760) * 100%)",
                  top: "calc((100 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img src={rivetFavicon} alt="" className="h-[18px] w-[18px] object-contain" />
              </div>

              {/* Favicon 2 (Center-Right Blue Satellite) */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((590 / 760) * 100%)",
                  top: "calc((335 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img src={rivetFavicon} alt="" className="h-[18px] w-[18px] object-contain" />
              </div>

              {/* Favicon 3 (Bottom-Left Amber Satellite) */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-amber-500/50 bg-[#181108] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((240 / 760) * 100%)",
                  top: "calc((435 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img src={rivetFavicon} alt="" className="h-[18px] w-[18px] object-contain" />
              </div>

              {/* Favicon 4 (Bottom-Right Purple Satellite) */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-purple-500/50 bg-[#160b24] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((575 / 760) * 100%)",
                  top: "calc((475 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img src={rivetFavicon} alt="" className="h-[18px] w-[18px] object-contain" />
              </div>

              {/* ── GREEN SATELLITE ICONS ── */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((180 / 760) * 100%)",
                  top: "calc((50 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Code2 className="h-4 w-4 text-emerald-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((520 / 760) * 100%)",
                  top: "calc((45 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Send className="h-4 w-4 text-emerald-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((650 / 760) * 100%)",
                  top: "calc((65 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((430 / 760) * 100%)",
                  top: "calc((150 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Clock className="h-4 w-4 text-emerald-400" />
              </div>

              {/* Bleed tile on the top-right border */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-emerald-500/50 bg-[#0a1810] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((745 / 760) * 100%)",
                  top: "calc((110 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Layers className="h-4 w-4 text-emerald-400" />
              </div>

              {/* ── BLUE SATELLITE ICONS ── */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((75 / 760) * 100%)",
                  top: "calc((180 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Layers className="h-4 w-4 text-sky-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((50 / 760) * 100%)",
                  top: "calc((260 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <RefreshCw className="h-4 w-4 text-sky-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((75 / 760) * 100%)",
                  top: "calc((345 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Eye className="h-4 w-4 text-sky-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((195 / 760) * 100%)",
                  top: "calc((380 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Sparkles className="h-4 w-4 text-sky-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-sky-500/50 bg-[#081524] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((570 / 760) * 100%)",
                  top: "calc((260 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Sliders className="h-4 w-4 text-sky-400" />
              </div>

              {/* ── AMBER SATELLITE ICONS ── */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-amber-500/50 bg-[#181108] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((235 / 760) * 100%)",
                  top: "calc((495 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Star className="h-4 w-4 text-amber-400" />
              </div>

              {/* ── PURPLE SATELLITE ICONS ── */}
              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-purple-500/50 bg-[#160b24] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((585 / 760) * 100%)",
                  top: "calc((415 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Bell className="h-4 w-4 text-purple-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-purple-500/50 bg-[#160b24] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((505 / 760) * 100%)",
                  top: "calc((525 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Activity className="h-4 w-4 text-purple-400" />
              </div>

              <div
                className="wf-node-interactive absolute z-20 flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-purple-500/50 bg-[#160b24] shadow-md backdrop-blur-md"
                style={{
                  left: "calc((690 / 760) * 100%)",
                  top: "calc((535 / 560) * 100%)",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Database className="h-4 w-4 text-purple-400" />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section id="customers" className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-surface/30 to-background py-24 lg:py-32">
      <style>{`
        /* ── Roles Section Micro-Animations ── */
        @media (prefers-reduced-motion: no-preference) {
          @keyframes role-pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.08); }
          }
          @keyframes role-float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          @keyframes role-float-alt {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @keyframes role-flow-line {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          .role-float-1 { animation: role-float-slow 5.5s ease-in-out infinite; }
          .role-float-2 { animation: role-float-alt 6.2s ease-in-out infinite 0.7s; }
          .role-float-3 { animation: role-float-slow 5.8s ease-in-out infinite 1.4s; }
          .role-flow-active {
            stroke-dasharray: 6 6;
            animation: role-flow-line 1.8s linear infinite;
          }
        }
        .role-panel {
          transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 250ms ease, border-color 250ms ease;
        }
        .role-panel:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(179, 65, 56, 0.25);
        }
        .role-chip {
          transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease;
        }
        .role-chip:hover {
          transform: translateY(-1px);
        }
      `}</style>

      {/* ── Background Architectural Texture & Subtle Glows ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 right-10 h-[500px] w-[500px] rounded-full bg-primary/[0.035] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-10 h-[500px] w-[500px] rounded-full bg-primary/[0.025] blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-page relative z-10">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Role-Based Governance</span>
          </div>

          <h2 className="display-heading mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] text-foreground">
            Three distinct roles. One unified source of truth.
          </h2>

          <p className="mt-5 max-w-2xl text-[16px] sm:text-lg leading-relaxed text-muted-foreground">
            Every seat in the company operates in the same unified system, governed by strict database-level boundaries. Zero cross-department bleed, zero guesswork, complete accountability.
          </p>

          {/* System Telemetry Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Row-Level Security (RLS) Active
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 shadow-sm">
              <Lock className="h-3 w-3 text-primary" />
              API-Enforced Boundaries
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 shadow-sm">
              <Activity className="h-3 w-3 text-amber-500" />
              Real-Time Event Stream
            </span>
          </div>
        </div>

        {/* ── INTERACTIVE WORKFLOW SPIDER / SPINE ── */}
        <div className="relative mt-14 hidden lg:block">
          <div className="mx-auto max-w-5xl">
            {/* Visual connecting spine across the 3 roles */}
            <div className="relative flex items-center justify-between px-16">
              {/* SVG Connecting Paths with Pulses — uses absolute SVG viewBox coords for reliable positioning */}
              <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 w-full" viewBox="0 0 1000 40" preserveAspectRatio="none" fill="none">
                {/* Static background rail */}
                <line x1="130" y1="20" x2="870" y2="20" stroke="rgba(179,65,56,0.15)" strokeWidth="2" />
                {/* Animated dashed overlay */}
                <line x1="130" y1="20" x2="870" y2="20" stroke="rgba(179,65,56,0.45)" strokeWidth="2" className="role-flow-active" />
                {/* Pulse dot travels left→right along the rail */}
                <circle r="4" fill="#b34138" opacity="0">
                  <animateMotion
                    path="M 130,20 L 870,20"
                    dur="4s"
                    repeatCount="indefinite"
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;1;1;0"
                    keyTimes="0;0.05;0.15;0.85;1"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Step indicator 1 */}
              <div className="relative z-10 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>
                <span>Employee Submits</span>
              </div>

              {/* Step indicator 2 */}
              <div className="relative z-10 flex items-center gap-2 rounded-full border border-primary/30 bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">2</span>
                <span>Manager Validates</span>
              </div>

              {/* Step indicator 3 */}
              <div className="relative z-10 flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-[11px] font-bold text-foreground">3</span>
                <span>Admin Enterprise Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── THREE PRODUCT UI ROLE PANELS ── */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3 lg:gap-6">

          {/* ══════════════════════════════════════════
              ROLE 1: EMPLOYEE (FRONTLINE CONTRIBUTOR)
          ══════════════════════════════════════════ */}
          <div className="role-panel relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 sm:p-7 shadow-sm">
            {/* Top Bar: Role Meta & Avatar */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Role 01
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Contributor</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Logging
                </div>
              </div>

              {/* Profile Card Header */}
              <div className="mt-5 flex items-center gap-3.5">
                <div className="relative">
                  <div className="h-13 w-13 overflow-hidden rounded-full border-2 border-border shadow-inner">
                    <img src={person1} alt="Team Member" className="h-full w-full object-cover object-top" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Team Member</h3>
                  <p className="text-xs text-muted-foreground">Operations & Research</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                Logs daily work entries through structured, pre-defined forms. Focuses on pure execution without administrative distraction.
              </p>

              {/* ── Authentic Product UI: Daily Log Form Mockup ── */}
              <div className="mt-5 rounded-xl border border-border/80 bg-surface/50 p-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Daily Attendance & Task Log</span>
                  </div>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Submitted
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5 text-muted-foreground text-[11px]">
                  <div className="flex items-center justify-between bg-background/80 px-2.5 py-1.5 rounded border border-border/40">
                    <span>Research Workshop Attendance</span>
                    <span className="font-mono font-medium text-foreground">24 Attendees</span>
                  </div>
                  <div className="flex items-center justify-between bg-background/80 px-2.5 py-1.5 rounded border border-border/40">
                    <span>Task Execution State</span>
                    <span className="font-medium text-emerald-600">✓ Completed (4/4)</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Logged at 09:42 AM
                  </span>
                  <span className="text-primary font-medium">Locked for editing</span>
                </div>
              </div>

              {/* ── Granular Permissions List ── */}
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Granted Capabilities
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Scoped Module Forms
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Personal Log History
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Approval Alerts
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Draft Autosave
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Guardrail Footer */}
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary/80" />
                Scope: Own Department Only
              </span>
              <span className="font-mono text-[11px] text-foreground/70">RLS: Scoped</span>
            </div>
          </div>


          {/* ══════════════════════════════════════════
              ROLE 2: MANAGER (DEPARTMENT LEAD & APPROVER) - ELEVATED
          ══════════════════════════════════════════ */}
          <div className="role-panel relative flex flex-col justify-between rounded-2xl border-2 border-primary/40 bg-background p-6 sm:p-7 shadow-xl ring-1 ring-primary/10">
            {/* Elevated Badge Top Center */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                <img src={rivetFavicon} alt="" className="h-3 w-3 invert" />
                Core Approver
              </span>
            </div>

            {/* Top Bar: Role Meta & Avatar */}
            <div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    Role 02
                  </span>
                  <span className="text-xs font-semibold text-foreground">Department Lead</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  3 In Queue
                </div>
              </div>

              {/* Profile Card Header */}
              <div className="mt-5 flex items-center gap-3.5">
                <div className="relative">
                  <div className="h-13 w-13 overflow-hidden rounded-full border-2 border-primary shadow-md">
                    <img src={person2} alt="Reviewer" className="h-full w-full object-cover object-top" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-white shadow">
                    <BadgeCheck className="h-3 w-3 stroke-[2.5]" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-foreground">Reviewer</h3>
                    <span className="rounded bg-surface px-1.5 py-0.2 text-[10px] font-bold text-muted-foreground">LEAD</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Department Lead</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/90 font-normal">
                Owns department throughput. Reviews incoming logs in real time, adjusts counts inline, and approves or returns with remarks.
              </p>

              {/* ── Authentic Product UI: Approval Queue Mockup ── */}
              <div className="mt-5 rounded-xl border border-primary/25 bg-gradient-to-b from-primary/[0.04] to-surface/60 p-3.5 text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Workflow className="h-3.5 w-3.5 text-primary" />
                    <span>Review Queue & Inline Edit</span>
                  </div>
                  <span className="rounded-full bg-amber-500/15 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                    Pending (3)
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  <div className="rounded-lg border border-border/70 bg-background p-2 text-[11px] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Team Member — Log #1042</span>
                      <span className="font-mono text-[10px] text-muted-foreground">4 items</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button type="button" className="flex items-center gap-1 rounded bg-primary px-2 py-0.8 text-[10px] font-bold text-white shadow-sm">
                        <Check className="h-2.5 w-2.5 stroke-[3]" /> Approve
                      </button>
                      <button type="button" className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.8 text-[10px] font-medium text-foreground/80">
                        <Sliders className="h-2.5 w-2.5" /> Edit Counts
                      </button>
                      <button type="button" className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.8 text-[10px] font-medium text-muted-foreground hover:text-primary">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="font-medium text-emerald-600">✓ 98.4% team log completion</span>
                  <span className="font-medium text-primary">Kanban + List</span>
                </div>
              </div>

              {/* ── Granular Permissions List ── */}
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Granted Capabilities
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="role-chip rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
                    Approval Queue & Kanban
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Inline Count Adjustments
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Department Dashboards
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Team Status Reports
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Guardrail Footer */}
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Authority: Full Department
              </span>
              <span className="font-mono text-[11px] text-primary font-semibold">Triage: Real-time</span>
            </div>
          </div>


          {/* ══════════════════════════════════════════
              ROLE 3: ADMIN (ENTERPRISE CONTROLLER)
          ══════════════════════════════════════════ */}
          <div className="role-panel relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 sm:p-7 shadow-sm">
            {/* Top Bar: Role Meta & Avatar */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Role 03
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Enterprise Controller</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Full Governance
                </div>
              </div>

              {/* Profile Card Header */}
              <div className="mt-5 flex items-center gap-3.5">
                <div className="relative">
                  <div className="h-13 w-13 overflow-hidden rounded-full border-2 border-border shadow-inner">
                    <img src={person3} alt="Administrator" className="h-full w-full object-cover object-top" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-foreground text-background shadow">
                    <KeyRound className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Administrator</h3>
                  <p className="text-xs text-muted-foreground">System & Compliance</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                Manages global users, activates departmental modules, provisions permission sets, and exports tamper-evident datasets.
              </p>

              {/* ── Authentic Product UI: Enterprise Audit & Telemetry Mockup ── */}
              <div className="mt-5 rounded-xl border border-border/80 bg-surface/50 p-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    <span>Global Governance & Security</span>
                  </div>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    100% Synced
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5 text-muted-foreground text-[11px]">
                  <div className="flex items-center justify-between bg-background/80 px-2.5 py-1.5 rounded border border-border/40">
                    <span>Active Departments</span>
                    <span className="font-semibold text-foreground">Research · Data · Brand</span>
                  </div>
                  <div className="flex items-center justify-between bg-background/80 px-2.5 py-1.5 rounded border border-border/40">
                    <span>Immutable Audit Log</span>
                    <span className="font-mono font-medium text-primary">All Events Recorded</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span>124 Active Users Provisioned</span>
                  <span className="text-foreground font-medium">CSV/Excel Full Export</span>
                </div>
              </div>

              {/* ── Granular Permissions List ── */}
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Granted Capabilities
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Cross-Dept Dashboards
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    User & Role Provisioning
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Immutable Audit Trail
                  </span>
                  <span className="role-chip rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground/90 shadow-sm hover:border-primary/40 hover:text-primary">
                    Custom Module Activation
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Guardrail Footer */}
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary/80" />
                Scope: Organization-Wide
              </span>
              <span className="font-mono text-[11px] text-foreground/70">Full Audit Access</span>
            </div>
          </div>

        </div>

        {/* ── UNIFIED BOTTOM ARCHITECTURAL BANNER ── */}
        <div className="mt-12 rounded-2xl border border-border bg-surface/70 p-6 lg:p-8 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  One relational core. Zero permission leaks.
                </h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Security rules are enforced on PostgreSQL schemas and API endpoints, never delegated to client-side toggles.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero Cross-Dept Bleed</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Instant Outcome Sync</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Audit Trail Immutability</span>
              </div>
            </div>
          </div>
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
          Set up RIVET for one department first. Add the rest when you are ready. Your data stays
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
          <p>© {new Date().getFullYear()} RIVET. All rights reserved.</p>
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
