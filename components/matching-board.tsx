"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, ChevronUp, ClipboardList, Handshake, Loader2, Search, Users } from "lucide-react";
import type { CandidatesResult, MatchCandidate, MatchRationale } from "@/lib/types";

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

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = (score / 5) * 100;
  const color = score >= 4 ? "bg-emerald-500" : score >= 3 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-4 text-right">{score}</span>
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
  const [expanded, setExpanded] = useState(false);
  const totalScore = Math.round(candidate.score * 100);

  return (
    <div className={`bg-white border rounded-xl p-5 transition-all ${approved ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200"}`}>
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
          <span key={t} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{t}</span>
        ))}
      </div>

      <div className="space-y-1.5 mb-3">
        {(Object.entries(candidate.rationale) as [keyof MatchRationale, { score: number; reason: string }][]).map(([dim, val]) => (
          <ScoreBar key={dim} score={val.score} label={dimensionLabels[dim]} />
        ))}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-3"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide rationale" : "Show rationale"}
      </button>

      {expanded && (
        <div className="mb-3 space-y-2 bg-gray-50 rounded-lg p-3">
          {(Object.entries(candidate.rationale) as [keyof MatchRationale, { score: number; reason: string }][]).map(([dim, val]) => (
            <div key={dim}>
              <p className="text-xs font-semibold text-gray-700">{dimensionLabels[dim]}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{val.reason}</p>
            </div>
          ))}
        </div>
      )}

      {approved ? (
        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">Approved</span>
        </div>
      ) : (
        <button
          onClick={onApprove}
          disabled={approving}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {approving ? "Approving…" : <>Approve <ArrowRight className="w-4 h-4" /></>}
        </button>
      )}
    </div>
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

  const runMatch = async () => {
    setRunning(true);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(p => Math.min(p + 15, 90));
    }, 400);

    const res = await fetch(`/api/companies/${companyId}/match`, { method: "POST" });
    const data: CandidatesResult = await res.json();

    clearInterval(timer);
    setProgress(100);

    const info: Record<string, TargetInfo> = {};
    for (const c of [...data.mentors, ...data.programmes, ...data.partners]) {
      const r = await fetch(`/api/target-info/${c.target_type}/${c.target_id}`);
      if (r.ok) info[c.target_id] = await r.json();
    }
    setTargetInfo(info);
    setResult(data);
    setRunning(false);
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

  if (!running && !result) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-2xl mx-auto">
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
        <button
          onClick={runMatch}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Run Matching Agents <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (running) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">ADK agents running…</h3>
        <p className="text-sm text-gray-500 mb-6">MentorMatcher · ProgrammeMatcher · PartnerMatcher running in parallel</p>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-400">
          <p className={progress > 0 ? "text-emerald-600" : ""}>▸ MatchingOrchestrator initialised</p>
          <p className={progress > 20 ? "text-emerald-600" : ""}>▸ Fetching {companyName} profile from Firestore</p>
          <p className={progress > 35 ? "text-emerald-600" : ""}>▸ MentorMatcher: ranking 15 mentor profiles…</p>
          <p className={progress > 50 ? "text-emerald-600" : ""}>▸ ProgrammeMatcher: evaluating 3 tracks…</p>
          <p className={progress > 65 ? "text-emerald-600" : ""}>▸ PartnerMatcher: scoring 10 ecosystem partners…</p>
          <p className={progress > 80 ? "text-emerald-600" : "animate-pulse"}>▸ Collating results into unified review…</p>
        </div>
      </div>
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
          <button
            onClick={activateApproved}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Activate Approved ({Object.keys(approved).length}) <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.key}>
            <div className="flex items-center gap-2 mb-3">
              <col.icon className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-800 text-sm">{col.label}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{col.candidates.length}</span>
            </div>
            <div className="space-y-4">
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
