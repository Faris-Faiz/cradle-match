import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getCompanies, getRelationships, getMilestones, getMentor, getProgramme, getPartner } from "@/lib/services/data";
import type { Milestone } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  on_track: "bg-emerald-100 text-emerald-800",
  at_risk: "bg-amber-100 text-amber-800",
  pending: "bg-gray-100 text-gray-600",
  achieved: "bg-blue-100 text-blue-800",
};

const milestoneStatusDot: Record<string, string> = {
  on_track: "bg-emerald-400",
  at_risk: "bg-amber-400",
  pending: "bg-gray-300",
  achieved: "bg-blue-400",
};

export default async function DashboardPage() {
  const [companies, relationships, milestones] = await Promise.all([
    getCompanies(),
    getRelationships(),
    getMilestones(),
  ]);

  const activeRels = relationships.filter(r => r.state === "Active");

  const pairings = await Promise.all(
    activeRels.map(async rel => {
      const company = companies.find(c => c.id === rel.company_id) ?? null;
      const companyMilestones = milestones.filter(m => m.company_id === rel.company_id);

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

      const atRisk = companyMilestones.filter(m => m.status === "at_risk").length;
      const achieved = companyMilestones.filter(m => m.status === "achieved").length;
      const health: "on_track" | "at_risk" | "pending" = atRisk > 0 ? "at_risk" : companyMilestones.length > 0 ? "on_track" : "pending";

      return { relationship: rel, company, target, milestones: companyMilestones, health, milestone_summary: { total: companyMilestones.length, achieved, at_risk: atRisk } };
    })
  );

  const stats = {
    total_companies: companies.length,
    active_pairings: activeRels.length,
    milestones_at_risk: milestones.filter(m => m.status === "at_risk").length,
    milestones_due_soon: milestones.filter(m => {
      const diff = (new Date(m.target_date).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30 && m.status !== "achieved";
    }).length,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cohort Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">2026 Portfolio — Active Pairings & Milestone Health</p>
        </div>
        <Link href="/companies/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> Onboard Startup
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Portfolio Companies", value: stats.total_companies, color: "text-gray-900" },
          { label: "Active Pairings", value: stats.active_pairings, color: "text-emerald-600" },
          { label: "Milestones Due (30d)", value: stats.milestones_due_soon, color: "text-blue-600" },
          { label: "At Risk", value: stats.milestones_at_risk, color: "text-amber-600" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="py-0 gap-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm">Active Pairings</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pairings.length === 0 && (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              No active pairings yet.{" "}
              <Link href="/companies/new" className="text-emerald-600 hover:underline">Onboard your first startup</Link>
            </div>
          )}
          {pairings.map(({ relationship, company, target, milestones: cms, health, milestone_summary }) => (
            <div key={relationship.id} className="px-6 py-4 flex items-center gap-6 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {company?.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <Link href={`/companies/${company?.id}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-700 transition-colors">
                      {company?.name ?? "Unknown"}
                    </Link>
                    <p className="text-xs text-gray-500">{company?.sector} · {company?.stage}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="capitalize">{relationship.target_type}</Badge>
                  <span className="text-sm text-gray-700 truncate font-medium">{target?.name ?? "—"}</span>
                </div>
                {target?.headline && <p className="text-xs text-gray-400 truncate mt-0.5">{target.headline}</p>}
              </div>

              <div className="w-48 shrink-0">
                <div className="flex items-center gap-1 mb-1.5">
                  {cms.slice(0, 4).map((m: Milestone) => (
                    <div key={m.id} className={`h-2 flex-1 rounded-full ${milestoneStatusDot[m.status]}`} title={`${m.title} — ${m.status.replace("_", " ")}`} />
                  ))}
                  {cms.length === 0 && <span className="text-xs text-gray-400">No milestones</span>}
                </div>
                <p className="text-xs text-gray-400">
                  {milestone_summary.achieved}/{milestone_summary.total} achieved
                  {milestone_summary.at_risk > 0 && <span className="text-amber-600 ml-1">· {milestone_summary.at_risk} at risk</span>}
                </p>
              </div>

              <div className="w-24 shrink-0 flex justify-end">
                <Badge variant="secondary" className={cn("capitalize", statusColors[health])}>
                  {health.replace("_", " ")}
                </Badge>
              </div>

              <div className="shrink-0">
                <Link href={`/relationships/${relationship.id}`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors font-medium">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
