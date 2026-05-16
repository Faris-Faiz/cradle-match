import { config } from "@/lib/config";
import { engagementBonus } from "@/lib/services/engagement";
import type {
  Company, Mentor, Partner, Programme,
  MatchCandidate, MatchRationale, TargetType, EngagementSignal,
} from "@/lib/types";

function clamp(n: number): number {
  return Math.max(0, Math.min(1, n));
}

// ── Mock scoring (keyword overlap) ────────────────────────────────────────────

function mockMentorRationale(company: Company, mentor: Mentor): MatchRationale {
  const overlap = mentor.expertise.filter(e =>
    company.needs.some(n => n.toLowerCase().includes(e.toLowerCase().split(" ")[0]))
  );
  const skillScore = Math.min(5, overlap.length > 0 ? 3 + overlap.length : 3);
  const stageScore = mentor.stage_experience.includes(company.stage) ? 5 : 3;
  return {
    skill_fit: {
      score: skillScore,
      reason: overlap.length > 0
        ? `Mentor's expertise in ${overlap[0]} directly addresses ${company.name}'s stated need`
        : `Broad expertise in ${mentor.expertise[0]} offers relevant adjacent value`,
    },
    stage_fit: {
      score: stageScore,
      reason: stageScore === 5
        ? `Has mentored multiple companies through ${company.stage} stage challenges`
        : `Experience skews toward adjacent stages; ${company.stage} dynamics are similar`,
    },
    chemistry: {
      score: 4,
      reason: "Shared regional context and complementary professional backgrounds create strong communication foundation",
    },
    goal_alignment: {
      score: skillScore,
      reason: `Mentor's network in ${mentor.expertise[0]} directly serves ${company.name}'s immediate objectives`,
    },
  };
}

function mockProgrammeRationale(company: Company, prog: Programme): MatchRationale {
  const stageMatch = prog.stage_focus.includes(company.stage);
  const sectorMatch = prog.sector_focus.includes(company.sector);
  const s = (v: boolean) => (v ? 5 : 3);
  return {
    skill_fit: {
      score: s(sectorMatch),
      reason: sectorMatch
        ? `Programme is specifically designed for ${company.sector} startups`
        : `Programme support types include relevant cross-sector tools`,
    },
    stage_fit: {
      score: s(stageMatch),
      reason: stageMatch
        ? `Programme stage focus aligns exactly with ${company.stage} requirements`
        : `Programme curriculum can be adapted for ${company.stage} needs`,
    },
    chemistry: { score: 4, reason: "Programme cohort composition and past alumni suggest strong peer network fit" },
    goal_alignment: {
      score: sectorMatch && stageMatch ? 5 : 4,
      reason: `Support types (${prog.support_type.slice(0, 2).join(", ")}) directly map to stated company objectives`,
    },
  };
}

function mockPartnerRationale(company: Company, partner: Partner): MatchRationale {
  const sectorMatch = partner.focus_sectors.includes(company.sector);
  const warmthScore = partner.warmth === "existing" ? 5 : partner.warmth === "warm" ? 4 : 3;
  return {
    skill_fit: {
      score: sectorMatch ? 5 : 3,
      reason: sectorMatch
        ? `${partner.org_name} has active ${company.sector} partnerships and proven deal structures`
        : `${partner.org_name}'s deal types include cross-sector applicable models`,
    },
    stage_fit: { score: 4, reason: `Organisation has history of engaging startups at ${company.stage} for pilot programmes` },
    chemistry: {
      score: warmthScore,
      reason:
        partner.warmth === "existing"
          ? "Existing Cradle relationship — warm introduction possible immediately"
          : partner.warmth === "warm"
          ? "Previous positive engagement with Cradle portfolio companies"
          : "No prior engagement; cold outreach required with clear value proposition",
    },
    goal_alignment: {
      score: sectorMatch ? 5 : 4,
      reason: `Deal types (${partner.deal_types[0]}) directly address ${company.name}'s partnership objectives`,
    },
  };
}

function avgScore(r: MatchRationale) {
  return (r.skill_fit.score + r.stage_fit.score + r.chemistry.score + r.goal_alignment.score) / 20;
}

async function mockMatch(
  company: Company,
  mentors: Mentor[],
  programmes: Programme[],
  partners: Partner[],
  signals: Map<string, EngagementSignal>,
) {
  await new Promise(r => setTimeout(r, 3000));

  function rank<T extends { id: string }>(
    items: T[],
    type: TargetType,
    rationaleFor: (company: Company, item: T) => MatchRationale,
  ): MatchCandidate[] {
    return items
      .map(item => {
        const rationale = rationaleFor(company, item);
        const signal = signals.get(item.id);
        // Learning loop: tilt the profile-fit score by the target's past
        // engagement outcomes, then re-rank.
        const score = clamp(avgScore(rationale) + engagementBonus(signal));
        return { target_type: type, target_id: item.id, score, rationale, track_record: signal };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  return {
    mentors: rank(mentors, "mentor", mockMentorRationale),
    programmes: rank(programmes, "programme", mockProgrammeRationale),
    partners: rank(partners, "partner", mockPartnerRationale),
  };
}

// ── Live: Gemini re-ranking ───────────────────────────────────────────────────

// Learning loop: a per-target digest of how prior Cradle pairings performed.
function formatSignals(ids: string[], signals: Map<string, EngagementSignal>): string {
  return ids
    .map(id => {
      const s = signals.get(id);
      return `- ${id}: ${s ? s.summary : "no prior Cradle engagements on record"}`;
    })
    .join("\n");
}

const ENGAGEMENT_RULE =
  "The past engagement signals above summarise how prior Cradle pairings performed against their milestones. " +
  "Weight a proven track record of achieved milestones into goal_alignment and the overall ranking — a candidate with a strong history should outrank an equally well-fitting but unproven candidate, and a poor track record should pull a candidate down. " +
  "Treat candidates with no history as neutral. Never invent outcomes not stated in the signals.";

const MENTOR_PROMPT = (company: Company, mentors: Mentor[], signals: Map<string, EngagementSignal>) => `
You are MentorMatcher, an AI sub-agent for Cradle's startup programme matching system.

Company profile:
${JSON.stringify({ name: company.name, sector: company.sector, stage: company.stage, needs: company.needs, rationale: company.funding_rationale }, null, 2)}

Available mentors (score all of them):
${JSON.stringify(mentors.map(m => ({ id: m.id, name: m.name, expertise: m.expertise, stage_experience: m.stage_experience, bio: m.bio })), null, 2)}

Past engagement signals:
${formatSignals(mentors.map(m => m.id), signals)}

${ENGAGEMENT_RULE}

Score each mentor on 4 dimensions (1–5 integer scale). Return ONLY a JSON array of the top 3 objects:
[{
  "target_id": "mn-xxx",
  "skill_fit": { "score": 1-5, "reason": "one sentence grounded in the profiles" },
  "stage_fit": { "score": 1-5, "reason": "one sentence" },
  "chemistry": { "score": 1-5, "reason": "one sentence" },
  "goal_alignment": { "score": 1-5, "reason": "one sentence" }
}]
Dimensions: skill_fit = domain expertise match; stage_fit = experience with this growth phase; chemistry = communication/language/cultural fit; goal_alignment = mentor strengths vs company's current needs. Do not invent details not present in the input.`;

const PROGRAMME_PROMPT = (company: Company, programmes: Programme[], signals: Map<string, EngagementSignal>) => `
You are ProgrammeMatcher, an AI sub-agent for Cradle's startup programme matching system.

Company: ${JSON.stringify({ name: company.name, sector: company.sector, stage: company.stage, needs: company.needs })}
Programmes: ${JSON.stringify(programmes)}

Past engagement signals:
${formatSignals(programmes.map(p => p.id), signals)}

${ENGAGEMENT_RULE}

Return ONLY a JSON array of all ${programmes.length} programmes ranked best-to-worst:
[{ "target_id": "pr-xxx", "skill_fit": { "score": 1-5, "reason": "..." }, "stage_fit": { "score": 1-5, "reason": "..." }, "chemistry": { "score": 1-5, "reason": "..." }, "goal_alignment": { "score": 1-5, "reason": "..." } }]`;

const PARTNER_PROMPT = (company: Company, partners: Partner[], signals: Map<string, EngagementSignal>) => `
You are PartnerMatcher, an AI sub-agent for Cradle's startup programme matching system.

Company: ${JSON.stringify({ name: company.name, sector: company.sector, stage: company.stage, needs: company.needs })}
Partners: ${JSON.stringify(partners)}

Past engagement signals:
${formatSignals(partners.map(p => p.id), signals)}

${ENGAGEMENT_RULE}

Return ONLY a JSON array of all ${partners.length} partners ranked best-to-worst:
[{ "target_id": "pa-xxx", "skill_fit": { "score": 1-5, "reason": "..." }, "stage_fit": { "score": 1-5, "reason": "..." }, "chemistry": { "score": 1-5, "reason": "..." }, "goal_alignment": { "score": 1-5, "reason": "..." } }]`;

async function callGemini(prompt: string): Promise<unknown[]> {
  const { VertexAI } = await import("@google-cloud/vertexai");
  const vertexai = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.VERTEX_AI_LOCATION ?? "us-central1",
  });
  const model = vertexai.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-pro",
  });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });
  const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  return JSON.parse(text);
}

function parseGeminiCandidates(
  items: unknown[],
  targetType: TargetType,
  signals: Map<string, EngagementSignal>,
): MatchCandidate[] {
  return (items as Record<string, unknown>[]).map(item => {
    const rationale: MatchRationale = {
      skill_fit: (item.skill_fit as { score: number; reason: string }),
      stage_fit: (item.stage_fit as { score: number; reason: string }),
      chemistry: (item.chemistry as { score: number; reason: string }),
      goal_alignment: (item.goal_alignment as { score: number; reason: string }),
    };
    const targetId = item.target_id as string;
    return {
      target_type: targetType,
      target_id: targetId,
      score: avgScore(rationale),
      rationale,
      track_record: signals.get(targetId),
    };
  }).slice(0, 3);
}

async function geminiMatch(
  company: Company,
  mentors: Mentor[],
  programmes: Programme[],
  partners: Partner[],
  signals: Map<string, EngagementSignal>,
) {
  const [mentorItems, progItems, partnerItems] = await Promise.all([
    callGemini(MENTOR_PROMPT(company, mentors, signals)),
    callGemini(PROGRAMME_PROMPT(company, programmes, signals)),
    callGemini(PARTNER_PROMPT(company, partners, signals)),
  ]);
  return {
    mentors: parseGeminiCandidates(mentorItems, "mentor", signals),
    programmes: parseGeminiCandidates(progItems, "programme", signals),
    partners: parseGeminiCandidates(partnerItems, "partner", signals),
  };
}

// ── Public ─────────────────────────────────────────────────────────────────────

export async function runMatching(
  company: Company,
  mentors: Mentor[],
  programmes: Programme[],
  partners: Partner[],
  signals: Map<string, EngagementSignal>,
): Promise<{ mentors: MatchCandidate[]; programmes: MatchCandidate[]; partners: MatchCandidate[] }> {
  if (config.mockMatching) {
    return mockMatch(company, mentors, programmes, partners, signals);
  }
  return geminiMatch(company, mentors, programmes, partners, signals);
}
