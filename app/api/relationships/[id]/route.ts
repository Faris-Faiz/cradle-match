import { getRelationship, updateRelationship } from "@/lib/services/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rel = await getRelationship(id);
  if (!rel) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(rel);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await request.json();
  const updated = await updateRelationship(id, patch);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}
