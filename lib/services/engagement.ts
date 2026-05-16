// The learning loop: derive how prior Cradle pairings performed against their
// milestones, so matching can rank proven targets above unproven ones.
// A relationship counts as a "prior engagement" once it is Active or Closed.

import type { Relationship, Milestone, EngagementSignal } from "@/lib/types";

const ENGAGED_STATES = new Set(["Active", "Closed"]);

function buildSummary(
  pairings: number,
  companies: number,
  achieved: number,
  atRisk: number,
  onTrack: number,
  successRate: number | null,
): string {
  const head =
    `${pairings} prior pairing${pairings === 1 ? "" : "s"}` +
    (companies > 1 ? ` across ${companies} companies` : "");
  if (successRate !== null) {
    const resolved = achieved + atRisk;
    return `${head} · ${achieved}/${resolved} milestones achieved (${Math.round(successRate * 100)}% success rate)`;
  }
  if (onTrack > 0) {
    return `${head} · ${onTrack} milestone${onTrack === 1 ? "" : "s"} on track, none completed yet`;
  }
  return `${head} · engagement just started, no milestone data yet`;
}

// ── Aggregate past engagement per target ──────────────────────────────────────

export function computeEngagementSignals(
  relationships: Relationship[],
  milestones: Milestone[],
): Map<string, EngagementSignal> {
  const milestonesByRel = new Map<string, Milestone[]>();
  for (const m of milestones) {
    if (!m.relationship_id) continue;
    const arr = milestonesByRel.get(m.relationship_id) ?? [];
    arr.push(m);
    milestonesByRel.set(m.relationship_id, arr);
  }

  const relsByTarget = new Map<string, Relationship[]>();
  for (const rel of relationships) {
    if (!ENGAGED_STATES.has(rel.state)) continue;
    const arr = relsByTarget.get(rel.target_id) ?? [];
    arr.push(rel);
    relsByTarget.set(rel.target_id, arr);
  }

  const signals = new Map<string, EngagementSignal>();
  for (const [targetId, rels] of relsByTarget) {
    let achieved = 0;
    let atRisk = 0;
    let onTrack = 0;
    let total = 0;
    const companies = new Set<string>();

    for (const rel of rels) {
      companies.add(rel.company_id);
      for (const m of milestonesByRel.get(rel.id) ?? []) {
        total += 1;
        if (m.status === "achieved") achieved += 1;
        else if (m.status === "at_risk") atRisk += 1;
        else if (m.status === "on_track") onTrack += 1;
      }
    }

    const resolved = achieved + atRisk;
    const successRate = resolved > 0 ? achieved / resolved : null;

    signals.set(targetId, {
      prior_pairings: rels.length,
      companies_engaged: companies.size,
      milestones_total: total,
      milestones_achieved: achieved,
      milestones_at_risk: atRisk,
      success_rate: successRate,
      summary: buildSummary(rels.length, companies.size, achieved, atRisk, onTrack, successRate),
    });
  }

  return signals;
}

// ── Ranking nudge ─────────────────────────────────────────────────────────────

// Score delta applied on top of the profile-fit score (0..1 scale). Bounded to
// roughly ±0.08 so past performance tilts close calls without overriding fit.
export function engagementBonus(signal: EngagementSignal | undefined): number {
  if (!signal) return 0;
  // No resolved milestones yet — a small credit just for having engaged before.
  if (signal.success_rate === null) {
    return Math.min(signal.prior_pairings, 2) * 0.01;
  }
  // Centre success rate around 0.5; scale by how much evidence backs it.
  const evidence = Math.min(signal.milestones_achieved + signal.milestones_at_risk, 4) / 4;
  return (signal.success_rate - 0.5) * 0.16 * evidence;
}
