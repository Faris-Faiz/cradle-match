import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Handshake,
  LayoutDashboard,
  Network,
  Plus,
} from "lucide-react";
import {
  getCompanies,
  getRelationships,
  getMilestones,
  getMentor,
  getProgramme,
  getPartner,
} from "@/lib/services/data";
import type { Milestone } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/page-header";
import OnboardingHint from "@/components/onboarding-hint";
import StatTile from "@/components/stat-tile";
import EmptyState from "@/components/empty-state";
import { cn } from "@/lib/utils";

// Plain-language health labels — what a manager sees, not the raw status code.
const healthMeta: Record<string, { label: string; badge: string; dot: string }> = {
  on_track: {
    label: "On track",
    badge: "bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  at_risk: {
    label: "Needs attention",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  pending: {
    label: "Getting started",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-300",
  },
};

const milestoneDot: Record<string, string> = {
  on_track: "bg-emerald-400",
  at_risk: "bg-amber-400",
  pending: "bg-slate-300",
  achieved: "bg-blue-400",
};

const targetTypeLabel: Record<string, string> = {
  mentor: "Mentor",
  programme: "Programme",
  partner: "Partner",
};

// Wrapped so the "deadlines soon" window is computed off a single timestamp.
function getCurrentTimestamp() {
  return Date.now();
}

export default async function DashboardPage() {
  const [companies, relationships, milestones] = await Promise.all([
    getCompanies(),
    getRelationships(),
    getMilestones(),
  ]);

  const activeRels = relationships.filter((r) => r.state === "Active");

  const pairings = await Promise.all(
    activeRels.map(async (rel) => {
      const company = companies.find((c) => c.id === rel.company_id) ?? null;
      const companyMilestones = milestones.filter(
        (m) => m.company_id === rel.company_id,
      );

      let target: { name: string; headline?: string } | null = null;
      if (rel.target_type === "mentor") {
        const m = await getMentor(rel.target_id);
        target = m ? { name: m.name, headline: m.headline } : null;
      } else if (rel.target_type === "programme") {
        const p = await getProgramme(rel.target_id);
        target = p ? { name: p.name } : null;
      } else {
        const p = await getPartner(rel.target_id);
        target = p ? { name: p.org_name } : null;
      }

      const atRisk = companyMilestones.filter((m) => m.status === "at_risk").length;
      const achieved = companyMilestones.filter((m) => m.status === "achieved").length;
      const health: "on_track" | "at_risk" | "pending" =
        atRisk > 0 ? "at_risk" : companyMilestones.length > 0 ? "on_track" : "pending";

      return {
        relationship: rel,
        company,
        target,
        milestones: companyMilestones,
        health,
        milestone_summary: {
          total: companyMilestones.length,
          achieved,
          at_risk: atRisk,
        },
      };
    }),
  );

  const now = getCurrentTimestamp();
  const stats = {
    total_companies: companies.length,
    active_pairings: activeRels.length,
    milestones_at_risk: milestones.filter((m) => m.status === "at_risk").length,
    milestones_due_soon: milestones.filter((m) => {
      const diff = (new Date(m.target_date).getTime() - now) / 86400000;
      return diff >= 0 && diff <= 30 && m.status !== "achieved";
    }).length,
  };

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Portfolio Overview"
        description="A snapshot of every startup you manage and how their support relationships are progressing."
        breadcrumb={[{ label: "Workspace" }, { label: "Overview" }]}
        actions={
          <>
            <Link
              href="/network"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Network /> Relationship Map
            </Link>
            <Link
              href="/companies/new"
              className={buttonVariants({ size: "lg" })}
            >
              <Plus /> Onboard a Startup
            </Link>
          </>
        }
      />

      <OnboardingHint id="dashboard" title="Welcome to your operations console">
        Start here every day. The four tiles below summarise portfolio health;
        the table lists every startup actively working with a mentor, programme,
        or partner. Click any row to open its working relationship.
      </OnboardingHint>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Companies"
          value={stats.total_companies}
          icon={Building2}
          hint="The total number of startups currently in your 2026 portfolio."
        />
        <StatTile
          label="Active Pairings"
          value={stats.active_pairings}
          icon={Handshake}
          tone="primary"
          hint="A pairing is a startup that has been matched with, and is actively working alongside, a mentor, programme, or partner."
        />
        <StatTile
          label="Deadlines Soon"
          value={stats.milestones_due_soon}
          icon={CalendarClock}
          tone="info"
          sublabel="Due within 30 days"
          hint="Milestones (the goals set for each startup) with a target date in the next 30 days that haven't been completed yet."
        />
        <StatTile
          label="At Risk"
          value={stats.milestones_at_risk}
          icon={AlertTriangle}
          tone="warning"
          sublabel="Milestones flagged"
          hint="Milestones a programme manager has marked as at risk of missing their target — these need attention."
        />
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              Active Pairings
            </h2>
            <Badge variant="secondary">{pairings.length}</Badge>
          </div>
          <Link
            href="/companies"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all companies
          </Link>
        </div>

        {pairings.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="No active pairings yet"
            description="Once you onboard a startup and approve a match, it will appear here so you can track its progress."
            action={
              <Link href="/companies/new" className={buttonVariants()}>
                <Plus /> Onboard your first startup
              </Link>
            }
          />
        ) : (
          <>
            {/* Column headers */}
            <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_9rem] gap-6 border-b border-border px-5 py-2 md:grid">
              <span className="section-label">Company</span>
              <span className="section-label">Working with</span>
              <span className="section-label">Milestone progress</span>
              <span className="section-label">Status</span>
            </div>
            <div className="divide-y divide-border">
              {pairings.map(
                ({
                  relationship,
                  company,
                  target,
                  milestones: cms,
                  health,
                  milestone_summary,
                }) => (
                  <Link
                    key={relationship.id}
                    href={`/relationships/${relationship.id}`}
                    className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted md:grid-cols-[1.4fr_1.4fr_1fr_9rem] md:items-center md:gap-6"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
                        {company?.name?.[0] ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {company?.name ?? "Unknown"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {company?.sector} · {company?.stage}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary">
                          {targetTypeLabel[relationship.target_type]}
                        </Badge>
                        <span className="truncate text-sm font-medium text-foreground">
                          {target?.name ?? "—"}
                        </span>
                      </div>
                      {target?.headline && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {target.headline}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-1">
                        {cms.slice(0, 4).map((m: Milestone) => (
                          <div
                            key={m.id}
                            className={cn(
                              "h-1.5 flex-1 rounded-full",
                              milestoneDot[m.status],
                            )}
                            title={`${m.title} — ${m.status.replace("_", " ")}`}
                          />
                        ))}
                        {cms.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No milestones
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {milestone_summary.achieved} of {milestone_summary.total}{" "}
                        done
                        {milestone_summary.at_risk > 0 && (
                          <span className="ml-1 text-amber-600">
                            · {milestone_summary.at_risk} at risk
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full",
                          healthMeta[health].dot,
                        )}
                      />
                      <Badge
                        variant="secondary"
                        className={healthMeta[health].badge}
                      >
                        {healthMeta[health].label}
                      </Badge>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
