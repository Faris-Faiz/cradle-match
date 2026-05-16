import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { getCompanies, getRelationships, getMilestones } from "@/lib/services/data";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  "Pre-Seed": "bg-gray-100 text-gray-600",
  "Seed": "bg-blue-100 text-blue-700",
  "Pre-Series A": "bg-purple-100 text-purple-700",
  "Series A": "bg-emerald-100 text-emerald-700",
  "Series B+": "bg-orange-100 text-orange-700",
};

export default async function CompaniesPage() {
  const [companies, relationships, milestones] = await Promise.all([
    getCompanies(),
    getRelationships(),
    getMilestones(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio Companies</h1>
          <p className="text-sm text-gray-500 mt-1">{companies.length} companies in the 2026 cohort</p>
        </div>
        <Link href="/companies/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> Onboard Startup
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {companies.map(company => {
          const companyRels = relationships.filter(r => r.company_id === company.id && r.state === "Active");
          const companyMilestones = milestones.filter(m => m.company_id === company.id);
          const atRisk = companyMilestones.filter(m => m.status === "at_risk").length;

          return (
            <Card key={company.id} className="hover:shadow-sm transition-shadow">
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {company.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/companies/${company.id}`} className="text-base font-semibold text-gray-900 hover:text-emerald-700 transition-colors">
                        {company.name}
                      </Link>
                      <Badge variant="secondary" className={cn(stageColors[company.stage] ?? "bg-gray-100 text-gray-600")}>
                        {company.stage}
                      </Badge>
                      <Badge variant="outline">{company.sector}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{company.funding_rationale}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-400">CEO: {company.ceo_name}</span>
                      <span className="text-xs text-gray-400">Est. {company.founded_year}</span>
                      {companyRels.length > 0 && <span className="text-xs text-emerald-600 font-medium">{companyRels.length} active pairing{companyRels.length !== 1 ? "s" : ""}</span>}
                      {atRisk > 0 && <span className="text-xs text-amber-600 font-medium">{atRisk} milestone{atRisk !== 1 ? "s" : ""} at risk</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {company.needs.map(n => <Badge key={n} variant="secondary">{n}</Badge>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Link href={`/companies/${company.id}/match`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Find Matches <ArrowRight />
                    </Link>
                    <Link href={`/companies/${company.id}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      View Profile
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
