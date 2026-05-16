import { getCompany, getMentors, getPartners, getProgrammes, saveCandidates } from "@/lib/services/data";
import { runMatching } from "@/lib/services/matching";
import type { CandidatesResult } from "@/lib/types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return Response.json({ error: "Not found" }, { status: 404 });

  const [mentors, programmes, partners] = await Promise.all([
    getMentors(),
    getProgrammes(),
    getPartners(),
  ]);

  const { mentors: scoredMentors, programmes: scoredProgrammes, partners: scoredPartners } =
    await runMatching(company, mentors, programmes, partners);

  const result: CandidatesResult = {
    company_id: id,
    mentors: scoredMentors,
    programmes: scoredProgrammes,
    partners: scoredPartners,
    generated_at: new Date().toISOString(),
  };

  await saveCandidates(result);
  return Response.json(result);
}
