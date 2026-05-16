import { getDrafts, updateDraft } from "@/lib/services/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const drafts = await getDrafts(id);
  const draft = drafts[0];
  if (!draft) return Response.json({ error: "No draft found" }, { status: 404 });
  return Response.json(draft);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await request.json();
  const drafts = await getDrafts(id);
  const draft = drafts[0];
  if (!draft) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = await updateDraft(draft.id, patch);
  return Response.json(updated);
}
