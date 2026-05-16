import { createRelationship, getRelationships } from "@/lib/services/data";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("company_id") ?? undefined;
  return Response.json(await getRelationships(companyId));
}

export async function POST(request: Request) {
  const body = await request.json();
  const rel = await createRelationship({
    company_id: body.company_id,
    target_type: body.target_type,
    target_id: body.target_id,
    state: "Proposed",
    rationale: body.rationale,
    score: body.score,
  });
  return Response.json(rel, { status: 201 });
}
