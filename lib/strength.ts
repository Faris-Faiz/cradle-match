// Connection strength — every ecosystem linkage is formed automatically, so
// each one carries a plain-language sense of how strong the match is, derived
// from its 0–1 match score. Tiers share the 80% threshold used elsewhere.

export type StrengthTier = "strong" | "moderate" | "light";

export interface ConnectionStrength {
  tier: StrengthTier;
  label: string;
  percent: number;
}

export function matchStrength(score: number): ConnectionStrength {
  const percent = Math.round(score * 100);
  if (score >= 0.8) return { tier: "strong", label: "Strong", percent };
  if (score >= 0.6) return { tier: "moderate", label: "Moderate", percent };
  return { tier: "light", label: "Light", percent };
}
