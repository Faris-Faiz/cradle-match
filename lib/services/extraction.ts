import { config } from "@/lib/config";
import type { Company } from "@/lib/types";

export type ExtractedProfile = Omit<Company, "id" | "created_at" | "created_by" | "ceo_profile">;

// ── Mock ──────────────────────────────────────────────────────────────────────

const MOCK_PROFILE: ExtractedProfile = {
  name: "TechVenture",
  sector: "SaaS",
  stage: "Seed",
  founded_year: 2024,
  ceo_name: "Alex Chong",
  ceo_linkedin_url: "https://linkedin.com/in/alex-chong",
  funding_rationale:
    "TechVenture is building an AI-powered workflow automation platform targeting SMEs in Malaysia's manufacturing sector. The founding team brings deep domain expertise from their combined 20 years at top industrial firms, and the product has demonstrated 60% reduction in manual data entry in a 3-month pilot. Cradle is backing the company to scale beyond the pilot and secure 10 enterprise contracts in 2026.",
  needs: [
    "Enterprise sales strategy",
    "Manufacturing sector network",
    "Series A fundraising prep",
    "Technical co-founder recruitment",
  ],
};

async function mockExtract(nameOverride?: string): Promise<ExtractedProfile> {
  await new Promise(r => setTimeout(r, 1500));
  return { ...MOCK_PROFILE, name: nameOverride || MOCK_PROFILE.name };
}

// ── Live: Gemini multimodal ──────────────────────────────────────────

const EXTRACTION_PROMPT = `You are a startup profile extraction assistant for Cradle, Malaysia's national startup programme.

Given the pitch deck below, extract the following fields and return ONLY a valid JSON object (no markdown, no explanation):
{
  "name": "company legal name",
  "sector": "primary sector (e.g. FinTech, MedTech, EdTech, CleanTech, Food Tech, SaaS)",
  "stage": "one of: Pre-Seed | Seed | Pre-Series A | Series A | Series B+",
  "founded_year": 2024,
  "ceo_name": "full name of CEO/founder",
  "ceo_linkedin_url": "LinkedIn URL if visible, otherwise empty string",
  "funding_rationale": "2-3 sentence summary of why this company is investable — problem, solution, traction",
  "needs": ["3-5 specific things the company needs help with, as short phrases"]
}`;

async function geminiExtract(pdfBase64: string, mimeType: string): Promise<ExtractedProfile> {
  const { VertexAI } = await import("@google-cloud/vertexai");

  const vertexai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.VERTEX_AI_LOCATION ?? "us-central1",
  });

  const model = vertexai.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-pro",
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: pdfBase64, mimeType } },
          { text: EXTRACTION_PROMPT },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json" },
  });

  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = JSON.parse(text);

  return {
    name: parsed.name ?? "Unknown",
    sector: parsed.sector ?? "Other",
    stage: parsed.stage ?? "Seed",
    founded_year: Number(parsed.founded_year) || new Date().getFullYear(),
    ceo_name: parsed.ceo_name ?? "",
    ceo_linkedin_url: parsed.ceo_linkedin_url ?? "",
    funding_rationale: parsed.funding_rationale ?? "",
    needs: Array.isArray(parsed.needs) ? parsed.needs : [],
  };
}

// ── Public ─────────────────────────────────────────────────────────────────────

export async function extractProfile(
  file: File | null,
  nameOverride?: string,
): Promise<ExtractedProfile> {
  if (config.mockExtraction || !file) {
    return mockExtract(nameOverride);
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const profile = await geminiExtract(base64, file.type || "application/pdf");
  return { ...profile, name: nameOverride || profile.name };
}
