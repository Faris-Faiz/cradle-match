"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight, Calendar, Check, ChevronRight, Loader2 } from "lucide-react";
import type { Company, EmailDraft, Milestone, MatchRationale, Relationship } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const milestoneColors: Record<string, { bg: string; dot: string; label: string }> = {
  pending: { bg: "bg-gray-50 border-gray-200", dot: "bg-gray-300", label: "Pending" },
  on_track: { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-400", label: "On Track" },
  at_risk: { bg: "bg-amber-50 border-amber-200", dot: "bg-amber-400", label: "At Risk" },
  achieved: { bg: "bg-blue-50 border-blue-200", dot: "bg-blue-400", label: "Achieved" },
};

const dimensionLabels: Record<keyof MatchRationale, string> = {
  skill_fit: "Skill Fit",
  stage_fit: "Stage Fit",
  chemistry: "Chemistry",
  goal_alignment: "Goal Alignment",
};

function ScoreCell({ score, reason }: { score: number; reason: string }) {
  const color = score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-600" : "text-red-500";
  const dots = Array.from({ length: 5 }, (_, i) => i < score);
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {dots.map((filled, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full ${filled ? (score >= 4 ? "bg-emerald-500" : "bg-amber-400") : "bg-gray-200"}`} />
        ))}
        <span className={`text-xs font-bold ml-1 ${color}`}>{score}/5</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{reason}</p>
    </div>
  );
}

interface Props {
  relationship: Relationship;
  company: Company | null;
  targetName: string;
  targetHeadline: string;
  initialMilestones: Milestone[];
  initialDraft: EmailDraft | null;
}

export default function RelationshipDetail({
  relationship,
  company,
  targetName,
  targetHeadline,
  initialMilestones,
  initialDraft,
}: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [draft, setDraft] = useState(initialDraft);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(relationship.state === "Active");
  const [draftBody, setDraftBody] = useState(initialDraft?.body ?? "");
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const activate = async () => {
    setActivating(true);
    const res = await fetch(`/api/relationships/${relationship.id}/activate`, { method: "POST" });
    const data = await res.json();
    if (data.milestones) setMilestones(data.milestones);
    if (data.draft) { setDraft(data.draft); setDraftBody(data.draft.body); }
    setActivated(true);
    setActivating(false);
  };

  const saveDraft = async () => {
    setSavingDraft(true);
    await fetch(`/api/relationships/${relationship.id}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draftBody }),
    });
    setSavingDraft(false);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const updateMilestoneStatus = async (milestoneId: string, status: Milestone["status"]) => {
    await fetch(`/api/milestones/${milestoneId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status } : m));
  };

  const stateColor: Record<string, string> = {
    Proposed: "bg-gray-100 text-gray-600",
    AwaitingReview: "bg-amber-100 text-amber-700",
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-600",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard" className="hover:text-gray-600">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/companies/${company?.id}`} className="hover:text-gray-600">{company?.name ?? "Company"}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">Relationship</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              {company?.name}
              <ArrowLeftRight className="w-5 h-5 text-gray-400 shrink-0" />
              {targetName}
            </h1>
            <Badge variant="secondary" className={cn("capitalize", stateColor[relationship.state])}>
              {relationship.state}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{targetHeadline}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">
            {relationship.target_type} · Paired {new Date(relationship.created_at).toLocaleDateString()}
            {relationship.score && ` · ${Math.round(relationship.score * 100)}% match`}
          </p>
        </div>

        {!activated && (
          <Button size="lg" onClick={activate} disabled={activating}>
            {activating ? (
              <>
                <Loader2 className="animate-spin" />
                Activating…
              </>
            ) : (
              <>
                Activate Relationship <ArrowRight />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Rationale + Milestones */}
        <div className="col-span-2 space-y-6">
          {/* Match rationale */}
          {relationship.rationale && (
            <Card>
              <CardHeader>
                <CardTitle>Match Rationale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-5">
                  {(Object.entries(relationship.rationale) as [keyof MatchRationale, { score: number; reason: string }][]).map(
                    ([dim, val]) => (
                      <div key={dim}>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">{dimensionLabels[dim]}</p>
                        <ScoreCell score={val.score} reason={val.reason} />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Milestones</CardTitle>
                {!activated && !activating && (
                  <p className="text-xs text-gray-400">Activate the relationship to generate AI milestones</p>
                )}
                {activating && <p className="text-xs text-emerald-600 animate-pulse">MilestoneDrafter agent running…</p>}
              </div>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No milestones yet. Activate the relationship to generate milestones.
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map(m => {
                    const colors = milestoneColors[m.status];
                    return (
                      <div key={m.id} className={`border rounded-xl p-4 ${colors.bg}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colors.dot}`} />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3 shrink-0" /> {m.target_date}</span>
                                <Badge variant="outline" className="text-gray-400">{m.quarter}</Badge>
                                {m.source === "ai_drafted" && (
                                  <Badge variant="outline" className="bg-white text-gray-400">AI drafted</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Select value={m.status} onValueChange={(v) => updateMilestoneStatus(m.id, v as Milestone["status"])}>
                            <SelectTrigger className="shrink-0 bg-white text-gray-600" size="sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="on_track">On Track</SelectItem>
                              <SelectItem value="at_risk">At Risk</SelectItem>
                              <SelectItem value="achieved">Achieved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Email draft */}
        <div className="space-y-6">
          {/* Company summary */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center text-xs font-bold">{company.name[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{company.name}</p>
                      <p className="text-xs text-gray-500">{company.sector} · {company.stage}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {company.needs.slice(0, 3).map(n => (
                      <Badge key={n} variant="secondary" className="bg-gray-100 text-gray-600">{n}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email draft */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Intro Email Draft</CardTitle>
                {draft && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-400">EmailDrafter agent</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!draft && !activating && (
                <p className="text-xs text-gray-400 text-center py-4">Email draft will be generated when you activate the relationship.</p>
              )}
              {activating && (
                <p className="text-xs text-emerald-600 text-center py-4 animate-pulse">EmailDrafter writing intro email…</p>
              )}

              {draft && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Subject</p>
                    <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{draft.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Body</p>
                    <Textarea
                      className="text-xs text-gray-700 resize-none"
                      rows={10}
                      value={draftBody}
                      onChange={e => setDraftBody(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="w-full" onClick={saveDraft} disabled={savingDraft}>
                    {savingDraft ? "Saving…" : draftSaved ? <><Check /> Saved</> : "Save Draft"}
                  </Button>
                  {!draft.sent_at && (
                    <Button className="w-full">
                      Mark as Sent <ArrowRight />
                    </Button>
                  )}
                  {draft.sent_at && (
                    <p className="text-xs text-center text-gray-400">Sent {new Date(draft.sent_at).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
