import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { getCompany, getRelationships, getMilestones, getMentor, getProgramme, getPartner } from "@/lib/services/data";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const milestoneStatusColors: Record<string, string> = {
  pending: "text-gray-500",
  on_track: "text-emerald-600",
  at_risk: "text-amber-600",
  achieved: "text-blue-600",
};

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [allRels, milestones] = await Promise.all([
    getRelationships(id),
    getMilestones(id),
  ]);
  const relationships = allRels.filter(r => r.state === "Active");

  const enrichedRels = await Promise.all(
    relationships.map(async rel => {
      let name = rel.target_id;
      if (rel.target_type === "mentor") name = (await getMentor(rel.target_id))?.name ?? name;
      if (rel.target_type === "programme") name = (await getProgramme(rel.target_id))?.name ?? name;
      if (rel.target_type === "partner") name = (await getPartner(rel.target_id))?.org_name ?? name;
      return { ...rel, targetName: name };
    })
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/companies" className="hover:text-gray-600">Portfolio</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">{company.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-bold">{company.name[0]}</div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-500">{company.sector} · {company.stage} · Est. {company.founded_year}</p>
          </div>
        </div>
        <Link href={`/companies/${id}/match`} className={buttonVariants({ size: "lg" })}>
          Find Matches <ArrowRight />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Rationale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">{company.funding_rationale}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What They Need</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {company.needs.map(n => <Badge key={n} variant="secondary">{n}</Badge>)}
              </div>
            </CardContent>
          </Card>

          {enrichedRels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Pairings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enrichedRels.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{rel.target_type}</Badge>
                        <span className="text-sm font-medium text-gray-800">{rel.targetName}</span>
                      </div>
                      <Link href={`/relationships/${rel.id}`} className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">View <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.map(m => (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className={`mt-1 text-xs font-medium w-16 shrink-0 ${milestoneStatusColors[m.status]}`}>{m.status.replace("_", " ")}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.title}</p>
                        <p className="text-xs text-gray-500">{m.target_date} · {m.quarter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Founding CEO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">{company.ceo_name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{company.ceo_name}</p>
                  <a href={company.ceo_linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">LinkedIn <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
              {company.ceo_profile && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 leading-relaxed">{company.ceo_profile.headline}</p>
                  <p className="text-xs text-gray-500">{company.ceo_profile.current_role}</p>
                  {company.ceo_profile.past_roles.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1.5">Past Roles</p>
                      {company.ceo_profile.past_roles.map(r => <p key={r} className="text-xs text-gray-500">· {r}</p>)}
                    </div>
                  )}
                  {company.ceo_profile.education.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <p className="text-xs font-medium text-gray-600 mb-1.5">Education</p>
                      {company.ceo_profile.education.map(e => <p key={e} className="text-xs text-gray-500">· {e}</p>)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Sector", value: company.sector },
                  { label: "Stage", value: company.stage },
                  { label: "Founded", value: company.founded_year.toString() },
                  { label: "Onboarded", value: new Date(company.created_at).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-700">{value}</span>
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
