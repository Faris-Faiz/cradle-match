import Link from "next/link";
import { getCompany, getRelationships, getMilestones, getMentor, getProgramme, getPartner } from "@/lib/services/data";
import { notFound } from "next/navigation";

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
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/companies" className="hover:text-gray-600">Portfolio</Link>
        <span>→</span>
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
        <Link href={`/companies/${id}/match`} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          Find Matches →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Investment Rationale</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{company.funding_rationale}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">What They Need</h2>
            <div className="flex flex-wrap gap-2">
              {company.needs.map(n => <span key={n} className="text-sm bg-gray-100 text-gray-700 rounded-full px-3 py-1.5">{n}</span>)}
            </div>
          </div>

          {enrichedRels.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Active Pairings</h2>
              <div className="space-y-2">
                {enrichedRels.map(rel => (
                  <div key={rel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full capitalize">{rel.target_type}</span>
                      <span className="text-sm font-medium text-gray-800">{rel.targetName}</span>
                    </div>
                    <Link href={`/relationships/${rel.id}`} className="text-xs text-emerald-600 hover:underline">View →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {milestones.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 text-sm mb-3">Milestones</h2>
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
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Founding CEO</h2>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">{company.ceo_name[0]}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{company.ceo_name}</p>
                <a href={company.ceo_linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">LinkedIn ↗</a>
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
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Details</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}
