import { Sparkles } from "lucide-react";
import MatchingBoard from "@/components/matching-board";
import PageHeader from "@/components/page-header";
import OnboardingHint from "@/components/onboarding-hint";
import { getCompany } from "@/lib/services/data";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  const name = company?.name ?? id;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        icon={Sparkles}
        title={`Find Matches for ${name}`}
        description="AI ranks the best-fit mentors, programmes, and partners for this startup. Review the suggestions and approve the ones you want to pursue."
        breadcrumb={[
          { label: "Companies", href: "/companies" },
          { label: name, href: `/companies/${id}` },
          { label: "Find Matches" },
        ]}
      />

      <OnboardingHint id="match" title="How matching works">
        Run the matching tool and it checks your whole network in seconds,
        scoring every candidate on fit. Each card explains <em>why</em> it was
        suggested — approve a candidate to start a working relationship.
      </OnboardingHint>

      <MatchingBoard companyId={id} companyName={name} />
    </div>
  );
}
