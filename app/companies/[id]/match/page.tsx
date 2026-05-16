import { ChevronRight } from "lucide-react";
import Link from "next/link";
import MatchingBoard from "@/components/matching-board";
import { getCompany } from "@/lib/services/data";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await getCompany(id);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <Link href="/companies" className="hover:text-gray-600">Portfolio</Link>
          <span>→</span>
          <Link href={`/companies/${id}`} className="text-gray-600 hover:text-gray-900">{company?.name ?? id}</Link>
          <span>→</span>
          <span className="text-gray-900 font-medium">Find Matches</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Find Matches for {company?.name ?? "Startup"}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {company?.sector} · {company?.stage} · ADK MatchingOrchestrator running 3 sub-agents in parallel
        </p>
      </div>
      <MatchingBoard companyId={id} companyName={company?.name ?? id} />
    </div>
  );
}
