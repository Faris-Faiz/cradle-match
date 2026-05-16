import {
  getCompany,
  getMentors,
  getPartners,
  getProgrammes,
  getRelationships,
  getMilestones,
  saveCandidates,
  createRelationship,
} from "@/lib/services/data";
import { runMatching } from "@/lib/services/matching";
import { computeEngagementSignals } from "@/lib/services/engagement";
import type { CandidatesResult, MatchCandidate, RelationshipState } from "@/lib/types";

interface FormedConnection {
  target_id: string;
  relationship_id: string;
  state: RelationshipState;
  created: boolean;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return Response.json({ error: "Not found" }, { status: 404 });

  const [mentors, programmes, partners, relationships, milestones] = await Promise.all([
    getMentors(),
    getProgrammes(),
    getPartners(),
    getRelationships(),
    getMilestones(),
  ]);

  // Learning loop: feed past engagement outcomes into the matching agents.
  const signals = computeEngagementSignals(relationships, milestones);

  const { mentors: scoredMentors, programmes: scoredProgrammes, partners: scoredPartners } =
    await runMatching(company, mentors, programmes, partners, signals);

  const result: CandidatesResult = {
    company_id: id,
    mentors: scoredMentors,
    programmes: scoredProgrammes,
    partners: scoredPartners,
    generated_at: new Date().toISOString(),
  };

  await saveCandidates(result);

  // Automatically form the ecosystem linkages. Rather than the programme
  // manager approving each ranked candidate by hand, the platform creates a
  // relationship for every match — each one carrying its score as the
  // connection's strength. Existing relationships for a pair are reused, so
  // re-running the matcher is idempotent.
  const priorForCompany = relationships.filter(r => r.company_id === id);
  const ranked: MatchCandidate[] = [...scoredMentors, ...scoredProgrammes, ...scoredPartners];
  const connections: FormedConnection[] = [];

  for (const candidate of ranked) {
    const existing = priorForCompany.find(r => r.target_id === candidate.target_id);
    if (existing) {
      connections.push({
        target_id: candidate.target_id,
        relationship_id: existing.id,
        state: existing.state,
        created: false,
      });
      continue;
    }
    const rel = await createRelationship({
      company_id: id,
      target_type: candidate.target_type,
      target_id: candidate.target_id,
      state: "Proposed",
      rationale: candidate.rationale,
      score: candidate.score,
    });
    connections.push({
      target_id: candidate.target_id,
      relationship_id: rel.id,
      state: rel.state,
      created: true,
    });
  }

  return Response.json({ ...result, connections });
}
