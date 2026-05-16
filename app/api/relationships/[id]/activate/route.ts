import {
  getRelationship, getCompany, getMentor,
  updateRelationship, createMilestones, saveDraft,
} from "@/lib/services/data";

function generateMilestones(companyId: string, relId: string, needs: string[], rationale: string) {
  const now = new Date();
  const q2End = new Date(now.getFullYear(), 5, 30).toISOString().split("T")[0];
  const q3End = new Date(now.getFullYear(), 8, 30).toISOString().split("T")[0];
  const q2 = `Q${Math.ceil((now.getMonth() + 2) / 3)} ${now.getFullYear()}`;
  const q3 = `Q${Math.ceil((now.getMonth() + 4) / 3)} ${now.getFullYear()}`;

  return [
    {
      company_id: companyId, relationship_id: relId,
      title: `${needs[0] ?? "First milestone"} — initial engagement`,
      description: `Establish first working session with mentor to map out approach for: ${needs[0]}. Produce action plan with 30/60/90-day checkpoints anchored to the investment thesis.`,
      target_date: q2End, quarter: q2, status: "pending" as const, source: "ai_drafted" as const,
    },
    {
      company_id: companyId, relationship_id: relId,
      title: `${needs[1] ?? "Partnership milestone"} — first partnership secured`,
      description: `Secure at least one signed LOI or pilot agreement in the domain of: ${needs[1] ?? "key partnership target"}. Cradle's investment rationale cited the founding team's ability to close enterprise deals — this milestone validates that thesis.`,
      target_date: q2End, quarter: q2, status: "pending" as const, source: "ai_drafted" as const,
    },
    {
      company_id: companyId, relationship_id: relId,
      title: "Fundraising narrative completed",
      description: `Draft and iterate on fundraising deck incorporating learnings from mentor engagement, anchored to: "${rationale.slice(0, 100)}…"`,
      target_date: q3End, quarter: q3, status: "pending" as const, source: "ai_drafted" as const,
    },
  ];
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rel = await getRelationship(id);
  if (!rel) return Response.json({ error: "Not found" }, { status: 404 });

  await new Promise(r => setTimeout(r, 2500));

  await updateRelationship(id, { state: "Active", activated_at: new Date().toISOString() });

  const company = await getCompany(rel.company_id);
  if (!company) return Response.json({ error: "Company not found" }, { status: 404 });

  const milestones = await createMilestones(
    generateMilestones(company.id, id, company.needs, company.funding_rationale)
  );

  let draft = null;
  if (rel.target_type === "mentor" && rel.rationale) {
    const mentor = await getMentor(rel.target_id);
    if (mentor) {
      draft = await saveDraft({
        relationship_id: id,
        type: "intro_email",
        subject: `Introduction: ${company.name} ↔ ${mentor.name} | Cradle Programme`,
        body: `Dear ${mentor.name},\n\nI hope this message finds you well. I'm reaching out from the Cradle programme team to introduce you to ${company.ceo_name}, founder and CEO of ${company.name} — one of our newest portfolio companies.\n\n${rel.rationale.skill_fit.reason}. ${rel.rationale.goal_alignment.reason}. We believe this is an unusually strong match and would love to facilitate a connection.\n\n${company.name} is at an exciting inflection point, and the team is looking for exactly the kind of grounded, strategic guidance you bring. Would you be open to a 15-minute introductory call at your convenience?\n\nWarm regards,\nLabubu | Cradle Programme Manager`,
        approved: false,
      });
    }
  }

  return Response.json({ relationship: await getRelationship(id), milestones, draft });
}
