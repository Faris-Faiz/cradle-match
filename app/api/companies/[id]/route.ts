import { getCompany, updateCompany } from "@/lib/services/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(company);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patch = await request.json();
  const updated = await updateCompany(id, patch);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(updated);
}
