import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ExternalLink,
  Flag,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  getCompany,
  getRelationships,
  getMilestones,
  getMentor,
  getProgramme,
  getPartner,
} from "@/lib/services/data";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/page-header";
import { cn } from "@/lib/utils";

const milestoneMeta: Record<string, { label: string; badge: string }> = {
  pending: { label: "Not started", badge: "bg-slate-100 text-slate-600" },
  on_track: { label: "On track", badge: "bg-emerald-100 text-emerald-700" },
  at_risk: { label: "At risk", badge: "bg-amber-100 text-amber-700" },
  achieved: { label: "Achieved", badge: "bg-blue-100 text-blue-700" },
};

const targetTypeLabel: Record<string, string> = {
  mentor: "Mentor",
  programme: "Programme",
  partner: "Partner",
};

const relStateMeta: Record<string, { label: string; badge: string }> = {
  Proposed: { label: "Proposed", badge: "bg-blue-100 text-blue-700" },
  AwaitingReview: { label: "In review", badge: "bg-amber-100 text-amber-700" },
  Active: { label: "Active", badge: "bg-emerald-100 text-emerald-700" },
};

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [allRels, milestones] = await Promise.all([
    getRelationships(id),
    getMilestones(id),
  ]);
  const relationships = allRels.filter((r) => r.state !== "Closed");

  const enrichedRels = await Promise.all(
    relationships.map(async (rel) => {
      let name = rel.target_id;
      if (rel.target_type === "mentor")
        name = (await getMentor(rel.target_id))?.name ?? name;
      if (rel.target_type === "programme")
        name = (await getProgramme(rel.target_id))?.name ?? name;
      if (rel.target_type === "partner")
        name = (await getPartner(rel.target_id))?.org_name ?? name;
      return { ...rel, targetName: name };
    }),
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        icon={Building2}
        title={company.name}
        description={`${company.sector} · ${company.stage} · Founded ${company.founded_year}`}
        breadcrumb={[
          { label: "Companies", href: "/companies" },
          { label: company.name },
        ]}
        actions={
          <Link
            href={`/companies/${id}/match`}
            className={buttonVariants({ size: "lg" })}
          >
            <Sparkles /> Find Matches
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Why this company is in the portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {company.funding_rationale}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-muted-foreground" />
                What they need help with
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.needs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.needs.map((n) => (
                    <Badge key={n} variant="secondary">
                      {n}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No needs recorded yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                Support relationships
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrichedRels.length > 0 ? (
                <div className="space-y-2">
                  {enrichedRels.map((rel) => {
                    const stateMeta =
                      relStateMeta[rel.state] ?? relStateMeta.Proposed;
                    return (
                      <Link
                        key={rel.id}
                        href={`/relationships/${rel.id}`}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge variant="secondary">
                            {targetTypeLabel[rel.target_type]}
                          </Badge>
                          <span className="truncate text-sm font-medium text-foreground">
                            {rel.targetName}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={stateMeta.badge}
                          >
                            {stateMeta.label}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground">
                            Open
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Not matched yet. Run{" "}
                    <Link
                      href={`/companies/${id}/match`}
                      className="font-medium text-primary hover:underline"
                    >
                      Find Matches
                    </Link>{" "}
                    to pair this startup with mentors, programmes, or partners.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {milestones.map((m) => {
                    const meta = milestoneMeta[m.status];
                    return (
                      <div
                        key={m.id}
                        className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {m.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Target {m.target_date} · {m.quarter}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn("shrink-0", meta.badge)}>
                          {meta.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Founding CEO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                  {company.ceo_name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {company.ceo_name}
                  </p>
                  <a
                    href={company.ceo_linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              {company.ceo_profile && (
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {company.ceo_profile.headline}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {company.ceo_profile.current_role}
                  </p>
                  {company.ceo_profile.past_roles.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="section-label mb-1.5">Past roles</p>
                      {company.ceo_profile.past_roles.map((r) => (
                        <p key={r} className="text-xs text-muted-foreground">
                          · {r}
                        </p>
                      ))}
                    </div>
                  )}
                  {company.ceo_profile.education.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="section-label mb-1.5">Education</p>
                      {company.ceo_profile.education.map((e) => (
                        <p key={e} className="text-xs text-muted-foreground">
                          · {e}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Company ID", value: company.id, mono: true },
                  { label: "Sector", value: company.sector },
                  { label: "Stage", value: company.stage },
                  { label: "Founded", value: company.founded_year.toString() },
                  {
                    label: "Onboarded",
                    value: new Date(company.created_at).toLocaleDateString(),
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span
                      className={cn(
                        "text-xs font-medium text-foreground",
                        mono && "font-mono uppercase",
                      )}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
