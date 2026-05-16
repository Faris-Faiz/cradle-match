import { config } from "@/lib/config";
import type { CeoProfile } from "@/lib/types";

// ── Mock ──────────────────────────────────────────────────────────────────────

const MOCK_PROFILES: Record<string, CeoProfile> = {
  "co-001": {
    headline: "CEO & Co-Founder at NutriTech | ex-Nestlé | Forbes 30 Under 30",
    current_role: "Chief Executive Officer, NutriTech",
    education: ["MSc Food Science, University of Wageningen", "BSc Biochemistry, UM"],
    past_roles: ["Product Manager, Nestlé MENA", "Research Scientist, Mondelēz"],
  },
  default: {
    headline: "Founder & CEO | Entrepreneur | Building the future of tech in SEA",
    current_role: "Chief Executive Officer",
    education: ["BEng, Universiti Malaya", "Executive Programme, INSEAD"],
    past_roles: ["Senior Manager, McKinsey & Company", "Product Lead, Grab"],
  },
};

async function mockEnrich(companyId: string): Promise<CeoProfile> {
  await new Promise(r => setTimeout(r, 2000));
  return MOCK_PROFILES[companyId] ?? MOCK_PROFILES.default;
}

// ── Live: Apify LinkedIn profile scraper ─────────────────────────────────────

async function apifyEnrich(linkedinUrl: string): Promise<CeoProfile> {
  const { ApifyClient } = await import("apify-client");

  const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN! });

  const run = await client.actor(process.env.APIFY_ACTOR_ID ?? "apify/linkedin-profile-scraper").call({
    startUrls: [{ url: linkedinUrl }],
    proxyConfiguration: { useApifyProxy: true },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profile = items[0] as Record<string, unknown> | undefined;

  if (!profile) throw new Error("Apify returned no results for LinkedIn URL");

  const positions = (profile.positions as { title: string; companyName: string }[] | undefined) ?? [];
  const education = (profile.education as { schoolName: string; fieldOfStudy?: string; degreeName?: string }[] | undefined) ?? [];

  return {
    headline: (profile.headline as string) ?? "",
    current_role: positions[0] ? `${positions[0].title}, ${positions[0].companyName}` : "",
    education: education.map(e =>
      [e.degreeName, e.fieldOfStudy, e.schoolName].filter(Boolean).join(", ")
    ),
    past_roles: positions.slice(1, 4).map(p => `${p.title}, ${p.companyName}`),
  };
}

// ── Public ─────────────────────────────────────────────────────────────────────

export async function enrichCeoProfile(
  companyId: string,
  linkedinUrl: string,
): Promise<CeoProfile> {
  if (config.mockEnrichment) {
    return mockEnrich(companyId);
  }
  return apifyEnrich(linkedinUrl);
}
