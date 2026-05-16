import RelationshipDetail from "@/components/relationship-detail";
import { getRelationship, getCompany, getMentor, getProgramme, getPartner, getMilestones, getDrafts } from "@/lib/services/data";
import { notFound } from "next/navigation";

export default async function RelationshipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rel = await getRelationship(id);
  if (!rel) notFound();

  const [company, allMilestones, allDrafts] = await Promise.all([
    getCompany(rel.company_id),
    getMilestones(rel.company_id),
    getDrafts(id),
  ]);

  const milestones = allMilestones.filter(m => m.relationship_id === id || m.company_id === rel.company_id);
  const draft = allDrafts[0] ?? null;

  let targetName = "";
  let targetHeadline = "";
  if (rel.target_type === "mentor") {
    const m = await getMentor(rel.target_id);
    targetName = m?.name ?? rel.target_id;
    targetHeadline = m?.headline ?? "";
  } else if (rel.target_type === "programme") {
    const p = await getProgramme(rel.target_id);
    targetName = p?.name ?? rel.target_id;
    targetHeadline = p?.description ?? "";
  } else {
    const p = await getPartner(rel.target_id);
    targetName = p?.org_name ?? rel.target_id;
    targetHeadline = p ? `${p.type} · ${p.warmth}` : "";
  }

  return (
    <RelationshipDetail
      relationship={rel}
      company={company ?? null}
      targetName={targetName}
      targetHeadline={targetHeadline}
      initialMilestones={milestones}
      initialDraft={draft}
    />
  );
}
