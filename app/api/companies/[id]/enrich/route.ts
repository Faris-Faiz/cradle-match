import { getCompany, updateCompany } from "@/lib/services/data";
import { enrichCeoProfile } from "@/lib/services/enrichment";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) return Response.json({ error: "Not found" }, { status: 404 });

  const ceo_profile = await enrichCeoProfile(id, company.ceo_linkedin_url);
  const updated = await updateCompany(id, { ceo_profile });
  return Response.json(updated);
}
