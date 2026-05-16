"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ClipboardList, Handshake, HelpCircle, Radar, Search, Users } from "lucide-react";
import type { CandidatesResult, MatchCandidate, MatchRationale } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TargetInfo {
  name: string;
  subtitle: string;
  tags: string[];
}

const dimensionLabels: Record<keyof MatchRationale, string> = {
  skill_fit: "Skill Fit",
  stage_fit: "Stage Fit",
  chemistry: "Chemistry",
  goal_alignment: "Goal Alignment",
};

// Sonar scan counter — deliberately non-linear (it repeats and jumps) so the
// sweep reads as a live, noisy ecosystem scan rather than a smooth progress bar.
const SCAN_SEQUENCE = [0, 3, 3, 8, 9, 14, 14, 14, 15];
const SCAN_STEP_MS = 480;
const SCAN_TARGET = SCAN_SEQUENCE[SCAN_SEQUENCE.length - 1];

// Fixed blip coordinates (% of the sonar box); revealed one-by-one as the
// counter climbs, so each detected profile lands somewhere on the sweep.
const SONAR_BLIPS = [
  { x: 38, y: 22 }, { x: 62, y: 30 }, { x: 56, y: 18 },
  { x: 74, y: 52 }, { x: 30, y: 48 }, { x: 42, y: 40 },
  { x: 80, y: 38 }, { x: 24, y: 60 }, { x: 68, y: 64 },
  { x: 50, y: 66 }, { x: 86, y: 56 }, { x: 34, y: 72 },
  { x: 58, y: 78 }, { x: 70, y: 80 }, { x: 46, y: 84 },
];

const SONAR_AGENTS = ["MentorMatcher", "ProgrammeMatcher", "PartnerMatcher"];

function ScoreBar({ score, label, reason }: { score: number; label: string; reason: string }) {
  const color = score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex items-center gap-1 flex-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={cn("h-2 flex-1 rounded-full", n <= score ? color : "bg-gray-200")}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700 w-4 text-right">{score}</span>
      <Tooltip>
        <TooltipTrigger
          aria-label={`${label} rationale`}
          className="text-gray-300 transition-colors hover:text-gray-500"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function CandidateCard({
  candidate,
  info,
  onApprove,
  approved,
  approving,
}: {
  candidate: MatchCandidate;
  info: TargetInfo;
  onApprove: () => void;
  approved: boolean;
  approving: boolean;
}) {
  const totalScore = Math.round(candidate.score * 100);

  return (
    <Card className={cn("h-full transition-all", approved && "ring-emerald-300")}>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {info.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{info.name}</p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5 line-clamp-2">{info.subtitle}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className={`text-sm font-bold ${totalScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{totalScore}%</div>
            <div className="text-xs text-gray-400">match</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {info.tags.slice(0, 3).map(t => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>

        <div className="space-y-1.5 mb-3">
          {(Object.entries(candidate.rationale) as [keyof MatchRationale, { score: number; reason: string }][]).map(([dim, val]) => (
            <ScoreBar key={dim} score={val.score} label={dimensionLabels[dim]} reason={val.reason} />
          ))}
        </div>

        {approved ? (
          <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 mt-auto">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">Approved</span>
          </div>
        ) : (
          <Button onClick={onApprove} disabled={approving} className="w-full mt-auto">
            {approving ? "Approving…" : "Approve"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MatchingBoard({ companyId, companyName }: { companyId: string; companyName: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CandidatesResult | null>(null);
  const [targetInfo, setTargetInfo] = useState<Record<string, TargetInfo>>({});
  const [approved, setApproved] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runMatch = async () => {
    setRunning(true);
    setProgress(0);
    setScanned(0);
    setError(null);

    // Step the sonar counter through SCAN_SEQUENCE; repeated values make the
    // sweep visibly stall, mimicking a real scan ranking noisy candidates.
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step < SCAN_SEQUENCE.length) {
        setScanned(SCAN_SEQUENCE[step]);
        setProgress(Math.round((step / (SCAN_SEQUENCE.length - 1)) * 90));
      }
    }, SCAN_STEP_MS);

    // Keep the sonar on screen long enough for the full sweep to complete,
    // even when the mock API resolves near-instantly.
    const minDuration = new Promise(resolve => setTimeout(resolve, SCAN_SEQUENCE.length * SCAN_STEP_MS));

    try {
      const res = await fetch(`/api/companies/${companyId}/match`, { method: "POST" });
      const data: Partial<CandidatesResult> & { error?: string } = await res.json();

      // The match route returns { error } on failure; bail before spreading.
      if (!res.ok || !data.mentors || !data.programmes || !data.partners) {
        throw new Error(data.error ?? `Match request failed (${res.status})`);
      }

      const info: Record<string, TargetInfo> = {};
      for (const c of [...data.mentors, ...data.programmes, ...data.partners]) {
        const r = await fetch(`/api/target-info/${c.target_type}/${c.target_id}`);
        if (r.ok) info[c.target_id] = await r.json();
      }

      await minDuration;
      setScanned(SCAN_TARGET);
      setProgress(100);
      setTargetInfo(info);
      setResult(data as CandidatesResult);
    } catch (e) {
      await minDuration;
      setError(e instanceof Error ? e.message : "Something went wrong while matching.");
    } finally {
      clearInterval(timer);
      setRunning(false);
    }
  };

  const approve = async (candidate: MatchCandidate) => {
    setApproving(candidate.target_id);
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        target_type: candidate.target_type,
        target_id: candidate.target_id,
        rationale: candidate.rationale,
        score: candidate.score,
      }),
    });
    const rel = await res.json();
    setApproved(prev => ({ ...prev, [candidate.target_id]: rel.id }));
    setApproving(null);
  };

  const activateApproved = () => {
    const mentorRel = result?.mentors.map(m => approved[m.target_id]).find(Boolean);
    if (mentorRel) router.push(`/relationships/${mentorRel}`);
  };

  if (!running && error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Matching scan failed</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button size="lg" onClick={runMatch}>
            Retry Scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!running && !result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Ready to run matching</h3>
          <p className="text-sm text-gray-500 mb-6">
            The MatchingOrchestrator ADK agent will spin up 3 sub-agents in parallel — MentorMatcher, ProgrammeMatcher, and PartnerMatcher — each using Gemini 2.5 Pro to rank and score candidates.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-400 mb-8">
            {["MentorMatcher", "ProgrammeMatcher", "PartnerMatcher"].map(a => (
              <div key={a} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                {a}
              </div>
            ))}
          </div>
          <Button size="lg" onClick={runMatch}>
            Run Matching Agents
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (running) {
    return (
      <Card className="max-w-2xl mx-auto overflow-hidden">
        <CardContent className="p-12 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 mb-8">
            <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: "2.4s" }} />
            MatchingOrchestrator · sweeping the ecosystem
          </div>

          {/* Sonar scope — concentric rings, a rotating sweep, and detected blips */}
          <div className="relative w-64 h-64 mb-8 select-none">
            {[0, 18, 36].map(inset => (
              <div
                key={inset}
                className="absolute rounded-full border border-emerald-200/70"
                style={{ inset: `${inset}%` }}
              />
            ))}
            {/* crosshair axes */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-emerald-100" />
            <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-emerald-100" />

            {/* outward radar pulse */}
            <div className="absolute inset-[26%] rounded-full border border-emerald-300 animate-ping" />

            {/* rotating conic sweep */}
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                animationDuration: "2.4s",
                background:
                  "conic-gradient(from 0deg, transparent 0deg 300deg, rgba(16,185,129,0.04) 320deg, rgba(16,185,129,0.32) 360deg)",
              }}
            />
            {/* leading sweep spoke */}
            {/* <div
              className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left animate-spin"
              style={{
                animationDuration: "2.4s",
                background: "linear-gradient(to right, rgba(5,150,105,0.9), transparent)",
              }}
            /> */}

            {/* detected blips, revealed as the counter climbs */}
            {SONAR_BLIPS.map((b, i) => (
              <div
                key={i}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500",
                  i < scanned ? "opacity-100" : "opacity-0",
                )}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                <span className="absolute -inset-1.5 rounded-full bg-emerald-400/40 animate-ping" />
                <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
              </div>
            ))}

            {/* live counter at the centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center w-28 h-28 rounded-full bg-white/80 backdrop-blur-sm">
                <span className="text-5xl font-bold text-emerald-600 tabular-nums leading-none">{scanned}</span>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 mt-1">profiles scanned</span>
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">Scanning matches for {companyName}…</h3>
          <p className="text-sm text-gray-500 mb-6">3 ADK sub-agents sweeping mentors, programmes and partners in parallel</p>

          <div className="h-1.5 w-full max-w-sm bg-gray-100 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
            {SONAR_AGENTS.map((a, i) => {
              const active = progress > (i + 1) * 20;
              return (
                <div key={a} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      active ? "bg-emerald-500 animate-pulse" : "bg-gray-300",
                    )}
                  />
                  <span className={cn(active && "text-emerald-600")}>{a}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    { label: "Mentors", key: "mentors", candidates: result!.mentors, icon: Users },
    { label: "Programmes", key: "programmes", candidates: result!.programmes, icon: ClipboardList },
    { label: "Partners", key: "partners", candidates: result!.partners, icon: Handshake },
  ];

  const anyApproved = Object.keys(approved).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          Results ready · {new Date(result!.generated_at).toLocaleTimeString()} · Select candidates to approve
        </p>
        {anyApproved && (
          <Button size="lg" onClick={activateApproved}>
            Activate Approved ({Object.keys(approved).length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <col.icon className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">{col.label}</h3>
              <Badge variant="secondary">{col.candidates.length}</Badge>
            </div>
            <div className="grid auto-rows-fr gap-4">
              {col.candidates.map(c => (
                <CandidateCard
                  key={c.target_id}
                  candidate={c}
                  info={targetInfo[c.target_id] ?? { name: c.target_id, subtitle: "", tags: [] }}
                  onApprove={() => approve(c)}
                  approved={!!approved[c.target_id]}
                  approving={approving === c.target_id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
