import { createCompany, getCompanies } from "@/lib/services/data";
import { extractProfile } from "@/lib/services/extraction";

export async function GET() {
  return Response.json(await getCompanies());
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("pitch_deck") as File | null;
  const nameOverride = formData.get("company_name") as string | null;

  const extracted = await extractProfile(file, nameOverride ?? undefined);
  const company = await createCompany({
    ...extracted,
    pitch_deck_url: file ? `gs://${process.env.GCS_BUCKET_NAME ?? "cradle-decks"}/${file.name}` : undefined,
  });

  return Response.json(company, { status: 201 });
}
