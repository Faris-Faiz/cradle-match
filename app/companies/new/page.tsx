import OnboardWizard from "@/components/onboard-wizard";

export default function NewCompanyPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Onboard New Startup</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a pitch deck to extract a structured company profile, then find mentor and programme matches.</p>
      </div>
      <OnboardWizard />
    </div>
  );
}
