import { CirclePlus } from "lucide-react";
import OnboardWizard from "@/components/onboard-wizard";
import PageHeader from "@/components/page-header";
import OnboardingHint from "@/components/onboarding-hint";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-3xl p-8">
      <PageHeader
        icon={CirclePlus}
        title="Onboard a Startup"
        description="Upload a pitch deck and we'll build a structured company profile for you. Review it, then move straight into finding matches."
        breadcrumb={[
          { label: "Companies", href: "/companies" },
          { label: "Onboard a Startup" },
        ]}
      />

      <OnboardingHint id="onboard" title="Three simple steps">
        Follow the steps along the top: upload the pitch deck, check the details
        we pulled out (you can edit anything), then save to start matching. No
        technical knowledge needed.
      </OnboardingHint>

      <OnboardWizard />
    </div>
  );
}
