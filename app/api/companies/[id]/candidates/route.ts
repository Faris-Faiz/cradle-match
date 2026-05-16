import { getCandidates } from "@/lib/services/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidates = await getCandidates(id);
  if (!candidates) return Response.json({ error: "No candidates yet. Run /match first." }, { status: 404 });
  return Response.json(candidates);
}
