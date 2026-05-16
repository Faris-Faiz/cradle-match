import { getCompanies, getRelationships, getMilestones, getMentor, getProgramme, getPartner } from "@/lib/services/data";

export async function GET() {
  const [companies, relationships, milestones] = await Promise.all([
    getCompanies(),
    getRelationships(),
    getMilestones(),
  ]);

  const activeRels = relationships.filter(r => r.state === "Active");
  // Closed relationships carry historical milestones (the learning-loop data) —
  // scope the dashboard to milestones owned by an active relationship only.
  const activeRelIds = new Set(activeRels.map(r => r.id));
  const activeMilestones = milestones.filter(m => m.relationship_id && activeRelIds.has(m.relationship_id));

  const pairings = await Promise.all(
    activeRels.map(async rel => {
      const company = companies.find(c => c.id === rel.company_id) ?? null;
      const relMilestones = milestones.filter(m => m.relationship_id === rel.id);

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

      const atRisk = relMilestones.filter(m => m.status === "at_risk").length;
      const achieved = relMilestones.filter(m => m.status === "achieved").length;
      const health = atRisk > 0 ? "at_risk" : relMilestones.length > 0 ? "on_track" : "pending";

      return {
        relationship: rel,
        company,
        target,
        milestones: relMilestones,
        health,
        milestone_summary: { total: relMilestones.length, achieved, at_risk: atRisk },
      };
    })
  );

  const stats = {
    total_companies: companies.length,
    active_pairings: activeRels.length,
    milestones_at_risk: activeMilestones.filter(m => m.status === "at_risk").length,
    milestones_due_soon: activeMilestones.filter(m => {
      const diff = (new Date(m.target_date).getTime() - Date.now()) / 86400000;
      return diff >= 0 && diff <= 30 && m.status !== "achieved";
    }).length,
  };

  return Response.json({ stats, pairings });
}
