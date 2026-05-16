import { getMilestones } from "@/lib/services/data";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("company_id") ?? undefined;
  return Response.json(await getMilestones(companyId));
}
