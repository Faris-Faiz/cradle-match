import { getMentor, getProgramme, getPartner } from "@/lib/services/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (type === "mentor") {
    const m = await getMentor(id);
    if (!m) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ name: m.name, subtitle: m.headline, tags: m.expertise.slice(0, 4) });
  }

  if (type === "programme") {
    const p = await getProgramme(id);
    if (!p) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ name: p.name, subtitle: p.description, tags: p.support_type.slice(0, 3) });
  }

  if (type === "partner") {
    const p = await getPartner(id);
    if (!p) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ name: p.org_name, subtitle: `${p.type} · ${p.warmth} relationship`, tags: p.deal_types.slice(0, 3) });
  }

  return Response.json({ error: "Unknown type" }, { status: 400 });
}
