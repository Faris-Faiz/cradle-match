import Link from "next/link";
import { Building2, Plus, Search, Sparkles } from "lucide-react";
import { getCompanies, getRelationships, getMilestones } from "@/lib/services/data";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/page-header";
import OnboardingHint from "@/components/onboarding-hint";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  "Pre-Seed": "bg-slate-100 text-slate-600",
  Seed: "bg-blue-100 text-blue-700",
  "Pre-Series A": "bg-violet-100 text-violet-700",
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
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        icon={Building2}
        title="Companies"
        description="Every startup in your portfolio. Open a company to review its profile or find new mentor, programme, and partner matches."
        breadcrumb={[{ label: "Workspace" }, { label: "Companies" }]}
        actions={
          <Link href="/companies/new" className={buttonVariants({ size: "lg" })}>
            <Plus /> Onboard a Startup
          </Link>
        }
      />

      <OnboardingHint id="companies" title="What you can do here">
        Each card is one startup. A green “matched” tag means it already has
        active support; companies without it still need matching — use{" "}
        <span className="font-medium">Find Matches</span> to get AI-ranked
        suggestions.
      </OnboardingHint>

      <div className="space-y-3">
        {companies.map((company) => {
          const companyRels = relationships.filter(
            (r) => r.company_id === company.id && r.state === "Active",
          );
          const companyMilestones = milestones.filter(
            (m) => m.company_id === company.id,
          );
          const atRisk = companyMilestones.filter(
            (m) => m.status === "at_risk",
          ).length;
          const matched = companyRels.length > 0;

          return (
            <Card key={company.id} className="transition-colors hover:border-primary/40">
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-foreground text-base font-bold text-background">
                    {company.name[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/companies/${company.id}`}
                        className="text-base font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {company.name}
                      </Link>
                      <Badge
                        variant="secondary"
                        className={cn(stageColors[company.stage] ?? "bg-slate-100 text-slate-600")}
                      >
                        {company.stage}
                      </Badge>
                      <Badge variant="outline">{company.sector}</Badge>
                      {matched ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                          Matched
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Needs matching
                        </Badge>
                      )}
                      <span className="entity-id ml-auto hidden sm:inline">
                        {company.id}
                      </span>
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {company.funding_rationale}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>CEO · {company.ceo_name}</span>
                      <span>Founded {company.founded_year}</span>
                      {matched && (
                        <span className="font-medium text-primary">
                          {companyRels.length} active pairing
                          {companyRels.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {atRisk > 0 && (
                        <span className="font-medium text-amber-600">
                          {atRisk} milestone{atRisk !== 1 ? "s" : ""} at risk
                        </span>
                      )}
                    </div>

                    {company.needs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {company.needs.map((n) => (
                          <Badge key={n} variant="secondary">
                            {n}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <Link
                      href={`/companies/${company.id}/match`}
                      className={cn(buttonVariants({ size: "sm" }), "flex-1 sm:flex-none")}
                    >
                      <Sparkles /> Find Matches
                    </Link>
                    <Link
                      href={`/companies/${company.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "flex-1 sm:flex-none",
                      )}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {companies.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                No companies yet
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Onboard your first startup by uploading its pitch deck.
              </p>
              <Link href="/companies/new" className={cn(buttonVariants(), "mt-4")}>
                <Plus /> Onboard a Startup
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
