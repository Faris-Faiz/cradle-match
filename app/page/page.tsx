import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cradle Match — AI Relationship Intelligence",
  description: "AI-powered relationship intelligence for startup ecosystems, mentors, partners, and programmes.",
};

const metrics = [
  { value: "3.4x", label: "faster portfolio triage" },
  { value: "72%", label: "less manual partner matching" },
  { value: "18k+", label: "ecosystem signals unified" },
  { value: "14 days", label: "from intake to qualified action" },
];

const workflow = [
  "Ingest startup profiles, mentor capacity, programme mandates, and partner theses into one operating graph.",
  "Score fit, urgency, and readiness with explainable AI recommendations for every relationship path.",
  "Launch warm introductions, milestone plans, and partner briefings from the same trusted dashboard.",
];

const valueCards = [
  {
    audience: "Ecosystem operators",
    title: "Run the portfolio like an intelligence desk.",
    copy: "See which companies need capital, technical guidance, market access, or intervention before momentum is lost.",
  },
  {
    audience: "Startups",
    title: "Receive the right relationship at the right moment.",
    copy: "Convert programme intake into targeted mentor, partner, and support pathways with a clear rationale behind every match.",
  },
  {
    audience: "Strategic partners",
    title: "Access qualified dealflow with context.",
    copy: "Understand readiness, strategic alignment, and milestone risk before committing people, capital, or distribution.",
  },
];

const previewRows = [
  { company: "AstraGrid", need: "Grid resilience pilot", fit: "96", status: "Partner ready" },
  { company: "Nura Bio", need: "Regulatory mentor", fit: "91", status: "Intro drafted" },
  { company: "KitePay", need: "Enterprise buyer access", fit: "88", status: "Due diligence" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#06101f] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_34%),radial-gradient(circle_at_80%_10%,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(180deg,_#06101f_0%,_#08111c_48%,_#030712_100%)]" />
      <div className="relative z-10">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-sm font-semibold text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.18)]">
              C
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-cyan-100 uppercase">Cradle Match</p>
              <p className="text-xs text-slate-400">AI ecosystem operating layer</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-200/50 hover:text-white sm:inline-flex"
          >
            View dashboard
          </Link>
        </header>

        <main>
          <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Built for investor demos, operator decisions, and partner confidence
              </div>
              <h1 className="max-w-4xl text-5xl leading-[0.95] font-semibold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-7xl">
                Turn startup ecosystems into investable relationship intelligence.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                Cradle Match helps programme teams identify which startups need support, who can unlock their next milestone, and why each connection matters to the portfolio thesis.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-200 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_20px_60px_rgba(34,211,238,0.25)] transition hover:bg-white"
                >
                  Explore live dashboard
                </Link>
                <Link
                  href="/companies/new"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-200/50 hover:bg-white/10"
                >
                  Onboard a startup
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-cyan-950/40 backdrop-blur">
              <div className="rounded-[1.5rem] border border-cyan-100/15 bg-[#f7f1e7] p-5 text-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Portfolio command</p>
                    <h2 className="mt-1 text-xl font-semibold">Relationship pipeline</h2>
                  </div>
                  <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">AI scored</div>
                </div>
                <div className="mt-5 grid gap-3">
                  {previewRows.map(row => (
                    <div key={row.company} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">{row.company}</p>
                          <p className="mt-1 text-sm text-slate-500">{row.need}</p>
                        </div>
                        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-cyan-100">{row.fit}% fit</div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${row.fit}%` }} />
                      </div>
                      <p className="mt-3 text-xs font-medium text-slate-500">{row.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-white/10 bg-white/[0.03]">
            <div className="mx-auto grid max-w-7xl gap-px px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
              {metrics.map(metric => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 lg:grid-cols-2 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">The problem</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">High-potential companies stall inside fragmented support systems.</h2>
              <p className="mt-5 leading-7 text-slate-300">
                Operators manage disconnected spreadsheets, ad hoc mentor notes, partner requests, and milestone updates. The result is slow triage, inconsistent introductions, and limited visibility for leadership or investors.
              </p>
            </div>
            <div className="rounded-[2rem] border border-cyan-200/20 bg-[#f7f1e7] p-8 text-slate-950 shadow-[0_24px_80px_rgba(34,211,238,0.10)]">
              <p className="text-sm font-semibold tracking-[0.2em] text-blue-700 uppercase">The solution</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">A single AI layer that recommends, explains, and operationalizes every next-best relationship.</h2>
              <p className="mt-5 leading-7 text-slate-600">
                Cradle Match converts messy ecosystem context into ranked connections, milestone plans, and executive-ready portfolio intelligence without adding operational overhead.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 lg:p-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">AI workflow</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">From raw ecosystem signal to confident action.</h2>
              </div>
              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {workflow.map((step, index) => (
                  <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-200 text-sm font-bold text-slate-950">0{index + 1}</div>
                    <p className="mt-6 leading-7 text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {valueCards.map(card => (
                <article key={card.audience} className="rounded-[2rem] border border-white/10 bg-[#f7f1e7] p-7 text-slate-950">
                  <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">{card.audience}</p>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">{card.title}</h3>
                  <p className="mt-4 leading-7 text-slate-600">{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
            <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-8 lg:p-10">
                <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">Product preview</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">Executive clarity without waiting for an analyst pack.</h2>
                <p className="mt-5 leading-7 text-slate-300">
                  Static dashboard views show what leadership needs in the room: portfolio health, active pairings, milestone exposure, and recommended partner motion.
                </p>
              </div>
              <div className="border-t border-white/10 bg-[#f7f1e7] p-5 text-slate-950 lg:border-t-0 lg:border-l">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Active pairings</p>
                    <p className="mt-2 text-3xl font-semibold">128</p>
                    <p className="mt-2 text-xs text-cyan-700">+24 this quarter</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Milestone risk</p>
                    <p className="mt-2 text-3xl font-semibold">11</p>
                    <p className="mt-2 text-xs text-amber-700">needs operator review</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Partner demand</p>
                    <p className="mt-2 text-3xl font-semibold">42</p>
                    <p className="mt-2 text-xs text-blue-700">qualified asks</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Recommended next moves</p>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-cyan-100">Board ready</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {["Prioritize energy pilots with infrastructure partners", "Escalate two at-risk healthtech milestones", "Prepare strategic partner briefing for fintech cohort"].map(item => (
                      <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        <p className="text-sm text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-6 pb-24 text-center lg:px-8">
            <div className="rounded-[2rem] border border-cyan-200/20 bg-gradient-to-br from-white/10 to-cyan-300/10 p-8 shadow-[0_24px_90px_rgba(34,211,238,0.12)] lg:p-12">
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">Ready for the demo</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">Show a smarter way to manage venture support, partnership readiness, and portfolio outcomes.</h2>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-cyan-200 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white">
                  Open dashboard
                </Link>
                <Link href="/companies/new" className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-200/50 hover:bg-white/10">
                  Add startup profile
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
