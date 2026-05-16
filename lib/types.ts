export type Stage = "Pre-Seed" | "Seed" | "Pre-Series A" | "Series A" | "Series B+";
export type RelationshipState = "Proposed" | "AwaitingReview" | "Active" | "Closed";
export type MilestoneStatus = "pending" | "on_track" | "at_risk" | "achieved";
export type PartnerWarmth = "cold" | "warm" | "existing";
export type PartnerType = "corporate" | "vc" | "lab" | "distributor";
export type TargetType = "mentor" | "partner" | "programme";
export type MilestoneSource = "ai_drafted" | "pic_added";

export interface CeoProfile {
  headline: string;
  current_role: string;
  education: string[];
  past_roles: string[];
}

export interface Company {
  id: string;
  name: string;
  sector: string;
  stage: Stage;
  founded_year: number;
  ceo_name: string;
  ceo_linkedin_url: string;
  ceo_profile?: CeoProfile;
  funding_rationale: string;
  needs: string[];
  pitch_deck_url?: string;
  created_at: string;
  created_by: string;
}

export interface Mentor {
  id: string;
  name: string;
  headline: string;
  expertise: string[];
  stage_experience: Stage[];
  languages: string[];
  bio: string;
  linkedin_url: string;
  avatar_initials: string;
}

export interface Partner {
  id: string;
  org_name: string;
  type: PartnerType;
  focus_sectors: string[];
  deal_types: string[];
  warmth: PartnerWarmth;
  contact_email: string;
}

export interface Programme {
  id: string;
  name: string;
  stage_focus: Stage[];
  sector_focus: string[];
  support_type: string[];
  description: string;
}

export interface MatchRationale {
  skill_fit: { score: number; reason: string };
  stage_fit: { score: number; reason: string };
  chemistry: { score: number; reason: string };
  goal_alignment: { score: number; reason: string };
}

// Past engagement data for a single target (mentor/programme/partner),
// aggregated from prior relationships and their milestone outcomes. Feeds the
// matching agents so proven track records influence future ranking.
export interface EngagementSignal {
  prior_pairings: number;
  companies_engaged: number;
  milestones_total: number;
  milestones_achieved: number;
  milestones_at_risk: number;
  // achieved / (achieved + at_risk); null when no milestones have resolved yet
  success_rate: number | null;
  summary: string;
}

export interface MatchCandidate {
  target_type: TargetType;
  target_id: string;
  score: number;
  rationale: MatchRationale;
  // Past engagement signal that informed this ranking; absent for targets
  // with no prior Cradle engagements.
  track_record?: EngagementSignal;
}

export interface Relationship {
  id: string;
  company_id: string;
  target_type: TargetType;
  target_id: string;
  state: RelationshipState;
  rationale?: MatchRationale;
  score?: number;
  created_at: string;
  activated_at?: string;
}

export interface Milestone {
  id: string;
  company_id: string;
  relationship_id?: string;
  title: string;
  description: string;
  target_date: string;
  quarter: string;
  status: MilestoneStatus;
  source: MilestoneSource;
  created_at: string;
}

export interface EmailDraft {
  id: string;
  relationship_id: string;
  type: "intro_email" | "partner_outreach";
  subject: string;
  body: string;
  approved: boolean;
  sent_at?: string;
}

export interface CandidatesResult {
  company_id: string;
  mentors: MatchCandidate[];
  programmes: MatchCandidate[];
  partners: MatchCandidate[];
  generated_at: string;
}
