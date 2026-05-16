"use client";

import { useState } from "react";
import { ArrowLeftRight, Calendar, Check, Loader2, Mail, Send } from "lucide-react";
import type {
  Company,
  EmailDraft,
  Milestone,
  MatchRationale,
  Relationship,
} from "@/lib/types";
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
import { pushSnackbar } from "@/components/ui/snackbar";
import { Breadcrumb } from "@/components/page-header";
import InfoHint from "@/components/info-hint";
import { matchStrength, type StrengthTier } from "@/lib/strength";
import { cn } from "@/lib/utils";

const strengthBadge: Record<StrengthTier, string> = {
  strong: "bg-emerald-100 text-emerald-700",
  moderate: "bg-amber-100 text-amber-700",
  light: "bg-slate-100 text-slate-600",
};

const milestoneMeta: Record<
  string,
  { bg: string; dot: string; label: string }
> = {
  pending: { bg: "border-slate-200 bg-slate-50", dot: "bg-slate-300", label: "Not started" },
  on_track: { bg: "border-emerald-200 bg-emerald-50", dot: "bg-emerald-400", label: "On track" },
  at_risk: { bg: "border-amber-200 bg-amber-50", dot: "bg-amber-400", label: "At risk" },
  achieved: { bg: "border-blue-200 bg-blue-50", dot: "bg-blue-400", label: "Achieved" },
};

const dimensionLabels: Record<keyof MatchRationale, string> = {
  skill_fit: "Skill fit",
  stage_fit: "Stage fit",
  chemistry: "Chemistry",
  goal_alignment: "Goal alignment",
};

const dimensionHints: Record<keyof MatchRationale, string> = {
  skill_fit: "How well the candidate's expertise covers what this startup needs.",
  stage_fit: "How much experience the candidate has with companies at this funding stage.",
  chemistry: "How well the working styles and personalities are expected to mesh.",
  goal_alignment: "How closely the candidate's focus matches the startup's current goals.",
};

const stateMeta: Record<string, { label: string; badge: string }> = {
  Proposed: { label: "Proposed", badge: "bg-slate-100 text-slate-600" },
  AwaitingReview: { label: "Awaiting review", badge: "bg-amber-100 text-amber-700" },
  Active: { label: "Active", badge: "bg-emerald-100 text-emerald-700" },
  Closed: { label: "Closed", badge: "bg-red-100 text-red-600" },
};

const targetTypeLabel: Record<string, string> = {
  mentor: "Mentor",
  programme: "Programme",
  partner: "Partner",
};

function ScoreCell({ score, reason }: { score: number; reason: string }) {
  const color =
    score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-600" : "text-red-500";
  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              i < score
                ? score >= 4
                  ? "bg-emerald-500"
                  : "bg-amber-400"
                : "bg-slate-200",
            )}
          />
        ))}
        <span className={cn("ml-1 text-xs font-bold", color)}>{score}/5</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{reason}</p>
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
    try {
      const res = await fetch(
        `/api/relationships/${relationship.id}/activate`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(`Activation request failed (${res.status})`);
      const data = await res.json();
      if (data.milestones) setMilestones(data.milestones);
      if (data.draft) {
        setDraft(data.draft);
        setDraftBody(data.draft.body);
      }
      setActivated(true);
      const count = data.milestones?.length ?? 0;
      pushSnackbar(
        "success",
        "Relationship activated",
        `${count} milestones drafted${data.draft ? " and an intro email prepared" : ""}.`,
      );
    } catch (e) {
      pushSnackbar(
        "error",
        "Activation failed",
        e instanceof Error ? e.message : "Could not activate this relationship.",
      );
    } finally {
      setActivating(false);
    }
  };

  const saveDraft = async () => {
    setSavingDraft(true);
    try {
      const res = await fetch(`/api/relationships/${relationship.id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draftBody }),
      });
      if (!res.ok) throw new Error(`Save request failed (${res.status})`);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
      pushSnackbar("success", "Draft saved", "Your changes to the intro email are stored.");
    } catch (e) {
      pushSnackbar(
        "error",
        "Save failed",
        e instanceof Error ? e.message : "Could not save the email draft.",
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const updateMilestoneStatus = async (
    milestoneId: string,
    status: Milestone["status"],
  ) => {
    const previous = milestones;
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, status } : m)),
    );
    try {
      const res = await fetch(`/api/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Update request failed (${res.status})`);
      const title = previous.find((m) => m.id === milestoneId)?.title ?? "Milestone";
      pushSnackbar(
        "success",
        "Milestone updated",
        `${title} marked “${milestoneMeta[status].label}”.`,
      );
    } catch (e) {
      // Roll back the optimistic update so the UI matches the server.
      setMilestones(previous);
      pushSnackbar(
        "error",
        "Update failed",
        e instanceof Error ? e.message : "Could not update the milestone.",
      );
    }
  };

  const state = stateMeta[relationship.state] ?? stateMeta.Proposed;
  const strength =
    relationship.score != null ? matchStrength(relationship.score) : null;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <Breadcrumb
        trail={[
          { label: "Companies", href: "/companies" },
          {
            label: company?.name ?? "Company",
            href: company ? `/companies/${company.id}` : undefined,
          },
          { label: "Relationship" },
        ]}
      />

      {/* Pairing header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {company?.name}
            </span>
            <ArrowLeftRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {targetName}
            </span>
            <Badge variant="secondary" className={state.badge}>
              {state.label}
            </Badge>
            {strength && (
              <Badge
                variant="secondary"
                className={strengthBadge[strength.tier]}
              >
                {strength.label} match · {strength.percent}%
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{targetHeadline}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {targetTypeLabel[relationship.target_type]} · Connected{" "}
            {new Date(relationship.created_at).toLocaleDateString()}
          </p>
        </div>

        {!activated && (
          <Button size="lg" onClick={activate} disabled={activating}>
            {activating ? (
              <>
                <Loader2 className="animate-spin" /> Activating…
              </>
            ) : (
              <>
                <Check /> Activate Relationship
              </>
            )}
          </Button>
        )}
      </div>

      {!activated && !activating && (
        <div className="mb-6 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Next step:</span>{" "}
          activate this relationship to automatically draft starter milestones
          and a ready-to-send introduction email.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Rationale + Milestones */}
        <div className="space-y-6 lg:col-span-2">
          {relationship.rationale && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Why this match was suggested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {(
                    Object.entries(relationship.rationale) as [
                      keyof MatchRationale,
                      { score: number; reason: string },
                    ][]
                  ).map(([dim, val]) => (
                    <div key={dim}>
                      <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-foreground">
                        {dimensionLabels[dim]}
                        <InfoHint label={dimensionLabels[dim]}>
                          {dimensionHints[dim]}
                        </InfoHint>
                      </p>
                      <ScoreCell score={val.score} reason={val.reason} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm">Milestones</CardTitle>
                {!activated && !activating && (
                  <p className="text-xs text-muted-foreground">
                    Activate to generate starter milestones
                  </p>
                )}
                {activating && (
                  <p className="animate-pulse text-xs text-primary">
                    Drafting milestones…
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No milestones yet. Activate the relationship and we&apos;ll
                  draft the first set of goals for you.
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m) => {
                    const meta = milestoneMeta[m.status];
                    return (
                      <div
                        key={m.id}
                        className={cn("rounded-lg border p-4", meta.bg)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={cn(
                                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                meta.dot,
                              )}
                            />
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {m.title}
                              </p>
                              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                {m.description}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  {m.target_date}
                                </span>
                                <Badge variant="outline">{m.quarter}</Badge>
                                {m.source === "ai_drafted" && (
                                  <Badge variant="outline">AI draft</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Select
                            value={m.status}
                            onValueChange={(v) =>
                              updateMilestoneStatus(
                                m.id,
                                v as Milestone["status"],
                              )
                            }
                          >
                            <SelectTrigger
                              className="shrink-0 bg-card"
                              size="sm"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Not started</SelectItem>
                              <SelectItem value="on_track">On track</SelectItem>
                              <SelectItem value="at_risk">At risk</SelectItem>
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

        {/* Right: Company + Email draft */}
        <div className="space-y-6">
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
                    {company.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {company.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {company.sector} · {company.stage}
                    </p>
                  </div>
                </div>
                {company.needs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {company.needs.slice(0, 4).map((n) => (
                      <Badge key={n} variant="secondary">
                        {n}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Introduction email
                </CardTitle>
                {draft && <Badge variant="outline">AI draft</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              {!draft && !activating && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  An introduction email will be drafted for you when you
                  activate this relationship.
                </p>
              )}
              {activating && (
                <p className="animate-pulse py-4 text-center text-xs text-primary">
                  Writing the introduction email…
                </p>
              )}

              {draft && (
                <div className="space-y-3">
                  <div>
                    <p className="section-label mb-1">Subject</p>
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                      {draft.subject}
                    </p>
                  </div>
                  <div>
                    <p className="section-label mb-1">Body — edit as needed</p>
                    <Textarea
                      className="resize-none text-xs"
                      rows={10}
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={saveDraft}
                    disabled={savingDraft}
                  >
                    {savingDraft ? (
                      "Saving…"
                    ) : draftSaved ? (
                      <>
                        <Check /> Saved
                      </>
                    ) : (
                      "Save Draft"
                    )}
                  </Button>
                  {!draft.sent_at && (
                    <Button className="w-full">
                      <Send /> Mark as Sent
                    </Button>
                  )}
                  {draft.sent_at && (
                    <p className="text-center text-xs text-muted-foreground">
                      Sent {new Date(draft.sent_at).toLocaleDateString()}
                    </p>
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
