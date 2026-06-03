import { Link } from "react-router-dom";
import {
  Layers3,
  Target,
  Compass,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  ArrowRight,
  Workflow,
  Brain,
  LayoutDashboard,
  Users,
  Check,
  ExternalLink,
  Server,
  Database,
  Globe,
  Award,
  BookOpen
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-poppins antialiased selection:bg-blue-100 selection:text-[#1B3A6B]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B3A6B] text-white shadow-sm transition-transform group-hover:scale-105">
              <Layers3 size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight text-[#1B3A6B]">
              WorkflowOS
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-500 hover:text-[#1B3A6B] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B3A6B] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#152e55] transition-all hover:shadow"
            >
              Go to Workspace
              <ArrowRight size={12} />
            </Link>
          </nav>
        </div>
      </header>

      {/* SECTION 1 — HERO ABOUT SECTION */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(27,58,107,0.03),transparent_40%)]" />
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-3.5 py-1 text-xs font-semibold text-[#1B3A6B]">
                <Activity size={12} className="text-[#1B3A6B]" />
                <span>Software Engineering FYP Platform</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                About <span className="text-[#1B3A6B]">WorkflowOS</span>
              </h1>

              <p className="text-lg font-medium text-slate-700 leading-snug">
                AI-Powered Workflow & Productivity Platform
              </p>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                WorkflowOS is a modern workflow and productivity platform developed to help teams manage projects, organize tasks, streamline collaboration, and improve productivity through intelligent automation and data-driven insights.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {[
                  { name: "Project Management", icon: LayoutDashboard },
                  { name: "AI Copilot", icon: Brain },
                  { name: "Task Automation", icon: Workflow },
                  { name: "Analytics Dashboard", icon: Activity },
                  { name: "Team Collaboration", icon: Users }
                ].map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <span
                      key={badge.name}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-[#1B3A6B] hover:text-[#1B3A6B]"
                    >
                      <Icon size={12} className="text-[#1B3A6B]" />
                      {badge.name}
                    </span>
                  );
                })}
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#152e55] transition-all hover:scale-[1.01]"
                >
                  Explore WorkflowOS
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200/50 opacity-30 blur-lg" />
              <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm hover:border-[#1B3A6B]/30 transition-all duration-300">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded px-3 py-0.5 shadow-2xs">
                    workflowos.app/workspace/fyp
                  </div>
                </div>

                {/* Mockup Content */}
                <div className="space-y-3 font-sans">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[#1B3A6B] bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 px-2 py-0.5 rounded">
                        AI INSIGHT
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Updated 2m ago</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-normal">
                      <strong className="text-slate-800">Critical Bottleneck Identified:</strong> DB Migration query optimization completed. API request latency reduced by <span className="text-green-600 font-bold">140ms</span>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">FYP Sprint Execution</span>
                      <span className="text-[10px] font-semibold text-[#1B3A6B]">87% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1B3A6B] h-full rounded-full" style={{ width: "87%" }} />
                    </div>
                  </div>

                  {/* Kanban Simulator */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">IN PROGRESS</span>
                      <div className="border-l-2 border-[#1B3A6B] pl-1.5 py-0.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 block truncate">JWT Security Implementation</span>
                        <span className="text-[8px] bg-slate-50 text-slate-500 border px-1 py-0.2 rounded font-medium">Auth</span>
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">COMPLETED</span>
                      <div className="border-l-2 border-emerald-500 pl-1.5 py-0.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-700 block truncate">Supabase DB Schema Setup</span>
                        <span className="text-[8px] bg-slate-50 text-slate-500 border px-1 py-0.2 rounded font-medium">Database</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2 — MISSION / VISION / VALUES */}
      <section className="py-16 bg-slate-50/50 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">

            {/* Card 1: Mission */}
            <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3A6B]/5 text-[#1B3A6B]">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To simplify workflow management through structured project planning, intelligent automation, and collaborative productivity systems.
              </p>
            </div>

            {/* Card 2: Vision */}
            <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3A6B]/5 text-[#1B3A6B]">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To build a reliable productivity ecosystem that helps students, startups, freelancers, and organizations manage work efficiently.
              </p>
            </div>

            {/* Card 3: Core Values */}
            <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B3A6B]/5 text-[#1B3A6B]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Core Values</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {[
                  "Simplicity",
                  "Collaboration",
                  "Productivity",
                  "Transparency",
                  "Continuous Improvement"
                ].map((val) => (
                  <li key={val} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B]">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <span className="font-medium text-slate-700">{val}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY WORKFLOWOS WAS BUILT */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Why WorkflowOS Was Developed
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              WorkflowOS was developed as a Software Engineering Final Year Project to address common workflow challenges such as poor task tracking, communication gaps, inefficient project monitoring, and lack of intelligent productivity support.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Task Organization",
                desc: "Centralized Kanban boards and list views to eliminate scattered task tracking and ensure clear ownership.",
                icon: Layers
              },
              {
                title: "Workflow Automation",
                desc: "Custom triggers and automated status updates to reduce manual coordination overhead.",
                icon: Workflow
              },
              {
                title: "Productivity Analytics",
                desc: "Executive velocity graphs, burndown charts, and workload logs to monitor execution progress.",
                icon: Activity
              },
              {
                title: "AI Assistance",
                desc: "Intelligent copilot providing real-time risk predictions and summary analysis of project bottlenecks.",
                icon: Brain
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 text-[#1B3A6B] font-bold text-xs">
                      0{idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{card.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 4 — DEVELOPER PROFILE */}
      <section className="py-16 bg-slate-50/30 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-12">

          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PROJECT CREATOR</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Developer Profile</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-start max-w-5xl mx-auto">

            {/* Left Side Portrait Placeholder */}
            <div className="lg:col-span-4 flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#1B3A6B] to-blue-400 opacity-20 blur-sm group-hover:opacity-35 transition-opacity" />
                <div className="relative w-48 h-48 rounded-full border-4 border-white bg-slate-50 overflow-hidden shadow-sm flex items-center justify-center">
                  <img
                    src="/profile.jpg"
                    alt="M Minhas Asghar"
                    className="w-full h-full object-cover"
                    style={{ display: 'none' }}
                    onLoad={(e) => {
                      e.target.style.display = 'block';
                      const fallback = document.getElementById('dev-profile-fallback');
                      if (fallback) fallback.style.display = 'none';
                    }}
                  />
                  <div
                    id="dev-profile-fallback"
                    style={{ display: 'flex' }}
                    className="w-full h-full items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="w-40 h-40 text-slate-400"
                      fill="currentColor"
                    >
                      {/* SVG Professional Developer Portrait Silhouette */}
                      <circle cx="50" cy="42" r="18" className="text-slate-300" />
                      <path
                        d="M26 80c0-12 10-20 24-20s24 8 24 20v4H26v-4z"
                        className="text-slate-400"
                      />
                      <path
                        d="M32 40h4v20h-4zm32 0h4v20h-4z"
                        className="opacity-10 text-[#1B3A6B]"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Developed by</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#1B3A6B]">
                  <Award size={12} />
                  M Minhas Asghar
                </span>
              </div>
            </div>

            {/* Right Side Info Card */}
            <div className="lg:col-span-8 bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">M Minhas Asghar</h3>
                <p className="text-sm font-semibold text-[#1B3A6B]">
                  Software Engineering Student & Full Stack Developer
                </p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                M Minhas Asghar is a Software Engineering student and developer of WorkflowOS, focused on building scalable, modern, and practical software solutions using contemporary web technologies and software engineering principles.
              </p>

              {/* Details Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50 flex items-start gap-3">
                  <div className="p-2 bg-white rounded border border-slate-200/60 text-[#1B3A6B] shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ACADEMIC BACKGROUND</span>
                    <span className="text-xs font-bold text-slate-800">Bachelor of Software Engineering</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/50 flex items-start gap-3">
                  <div className="p-2 bg-white rounded border border-slate-200/60 text-[#1B3A6B] shrink-0">
                    <Terminal size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ROLE</span>
                    <span className="text-xs font-bold text-slate-800">Full Stack Developer — WorkflowOS</span>
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Focus Areas</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Full Stack Web Development",
                    "Software Architecture",
                    "REST API Development",
                    "Database Design",
                    "AI Integration",
                    "Authentication Systems",
                    "Frontend Engineering",
                    "Backend Development",
                    "System Design",
                    "Software Testing"
                  ].map((item) => (
                    <span
                      key={item}
                      className="bg-[#1B3A6B]/5 text-[#1B3A6B] text-[11px] font-semibold px-2.5 py-1 rounded border border-[#1B3A6B]/10 hover:border-[#1B3A6B]/30 hover:bg-[#1B3A6B]/10 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Stack */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "React.js",
                    "TypeScript",
                    "Tailwind CSS",
                    "FastAPI",
                    "PostgreSQL",
                    "Supabase",
                    "SQLAlchemy",
                    "Zustand",
                    "JWT Authentication",
                    "REST APIs",
                    "Git & GitHub"
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="bg-slate-50 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded border border-slate-200 hover:border-slate-400 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social CTA Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://github.com/minhas-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  GitHub
                  <ExternalLink size={10} className="text-slate-400" />
                </a>
                <a
                  href="https://www.linkedin.com/in/minhas014/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  LinkedIn
                  <ExternalLink size={10} className="text-slate-400" />
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5 — TECHNOLOGY STACK GRID */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-12">

          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Technology Architecture</h2>
            <p className="text-sm text-slate-600">
              The full-stack architectural block diagram of technologies powering WorkflowOS.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              {
                title: "Frontend",
                techs: ["React", "TypeScript", "Tailwind CSS", "Zustand"],
                icon: Cpu
              },
              {
                title: "Backend",
                techs: ["FastAPI", "Python", "JWT Auth"],
                icon: Server
              },
              {
                title: "Database",
                techs: ["PostgreSQL", "Supabase", "SQLAlchemy"],
                icon: Database
              },
              {
                title: "AI Services",
                techs: ["Claude API", "OpenAI API"],
                icon: Brain
              },
              {
                title: "Deployment",
                techs: ["Vercel", "Render"],
                icon: Globe
              }
            ].map((stack) => {
              const Icon = stack.icon;
              return (
                <div
                  key={stack.title}
                  className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs hover:border-[#1B3A6B]/30 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/50 text-[#1B3A6B]">
                      <Icon size={16} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{stack.title}</h4>
                  </div>
                  <ul className="space-y-1.5 pt-2">
                    {stack.techs.map((t) => (
                      <li key={t} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B3A6B]/40 shrink-0" />
                        <span className="font-medium">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 6 — FOOTER CTA */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_35%)]" />
        <div className="mx-auto max-w-5xl px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl max-w-2xl mx-auto">
            Building Better Workflows Through Software Engineering
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Designed and engineered as a modern task, collaboration, and productivity command layer.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-all hover:scale-[1.01]"
            >
              Back to Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER METADATA */}
      <footer className="py-6 border-t border-slate-100 bg-white text-xs text-slate-500 text-center">
        <p>© 2026 WorkflowOS. Designed and developed by M Minhas Asghar for Final Year Project (FYP).</p>
      </footer>

    </div>
  );
}