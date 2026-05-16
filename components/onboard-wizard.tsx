"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bot, Check, ChevronRight, FileText, Loader2, MapPin, Plus, Upload, X } from "lucide-react";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Step = "upload" | "extracting" | "review" | "enriching" | "done";

export default function OnboardWizard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});
  const [enriching, setEnriching] = useState(false);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".pdf")) return;
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleExtract = async () => {
    if (!file) return;
    setStep("extracting");
    const fd = new FormData();
    fd.append("pitch_deck", file);
    const res = await fetch("/api/companies", { method: "POST", body: fd });
    const data: Company = await res.json();
    setCompany(data);
    setEditedCompany(data);
    setStep("review");
  };

  const handleUseDemoFile = async () => {
    setStep("extracting");
    const fd = new FormData();
    fd.append("company_name", "TechVenture");
    const res = await fetch("/api/companies", { method: "POST", body: fd });
    const data: Company = await res.json();
    setCompany(data);
    setEditedCompany(data);
    setStep("review");
  };

  const handleEnrich = async () => {
    if (!company) return;
    setEnriching(true);
    const res = await fetch(`/api/companies/${company.id}/enrich`, { method: "POST" });
    const updated: Company = await res.json();
    setCompany(updated);
    setEditedCompany(updated);
    setEnriching(false);
  };

  const handleSaveAndMatch = async () => {
    if (!company) return;
    await fetch(`/api/companies/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedCompany),
    });
    router.push(`/companies/${company.id}/match`);
  };

  const field = (key: keyof Company, label: string, multiline = false) => (
    <div key={key}>
      <Label className="mb-1 text-xs text-gray-600">{label}</Label>
      {multiline ? (
        <Textarea
          className="resize-none text-gray-900"
          rows={3}
          value={(editedCompany[key] as string) ?? ""}
          onChange={e => setEditedCompany(prev => ({ ...prev, [key]: e.target.value }))}
        />
      ) : (
        <Input
          className="text-gray-900"
          value={(editedCompany[key] as string) ?? ""}
          onChange={e => setEditedCompany(prev => ({ ...prev, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  if (step === "upload") {
    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {["Upload Deck", "Review Profile", "Find Matches"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"}`}>{i + 1}</div>
              <span className={`text-sm ${i === 0 ? "text-gray-900 font-medium" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver ? "border-emerald-400 bg-emerald-50" : file ? "border-emerald-300 bg-emerald-50" : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          {file ? (
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-emerald-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · PDF</p>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">Drop pitch deck here</p>
              <p className="text-xs text-gray-400 mt-1">PDF · Gemini 2.5 Pro will extract the company profile</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={handleExtract}
            disabled={!file}
            className="flex-1"
          >
            Extract Profile with Gemini
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleUseDemoFile}
          >
            Use Demo Deck
          </Button>
        </div>
      </div>
    );
  }

  if (step === "extracting") {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Extracting company profile…</h3>
          <p className="text-sm text-gray-500">Gemini 2.5 Pro is reading the pitch deck</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full bg-emerald-400 animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
          <div className="mt-5 text-left bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-400 space-y-1">
            <p>▸ Parsing pitch deck structure…</p>
            <p>▸ Identifying company overview slide…</p>
            <p>▸ Extracting sector, stage, founding year…</p>
            <p>▸ Locating CEO LinkedIn URL…</p>
            <p className="animate-pulse">▸ Generating structured JSON profile…</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if ((step === "review" || step === "enriching") && company) {
    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {["Upload Deck", "Review Profile", "Find Matches"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? "bg-emerald-600 text-white" : i === 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
              }`}>{i === 0 ? <Check className="w-3.5 h-3.5" /> : i + 1}</div>
              <span className={`text-sm ${i <= 1 ? "text-gray-900 font-medium" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        {/* Extracted badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">Profile extracted from pitch deck</span>
          <span className="text-xs text-emerald-500 ml-auto">Gemini 2.5 Pro · {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Company Profile <span className="text-gray-400 font-normal">(edit before saving)</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {field("name", "Company Name")}
              {field("sector", "Sector")}
              {field("stage", "Stage")}
              {field("founded_year", "Founded Year")}
              {field("ceo_name", "CEO Name")}
              {field("ceo_linkedin_url", "CEO LinkedIn URL")}
            </div>
            {field("funding_rationale", "Investment Rationale (from deck)", true)}

            {/* Needs */}
            <div>
              <Label className="mb-1 text-xs text-gray-600">What They Need</Label>
              <div className="flex flex-wrap items-center gap-2">
                {(editedCompany.needs ?? []).map((need, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    <span>{need}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setEditedCompany(prev => ({ ...prev, needs: (prev.needs ?? []).filter((_, j) => j !== i) }))}
                      className="text-gray-400 hover:text-red-500"
                    ><X /></Button>
                  </Badge>
                ))}
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    const v = prompt("Add a need:");
                    if (v) setEditedCompany(prev => ({ ...prev, needs: [...(prev.needs ?? []), v] }));
                  }}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                ><Plus /> Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CEO LinkedIn enrichment */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">CEO LinkedIn Enrichment</h3>
                <p className="text-xs text-gray-500 mt-0.5">Apify scraper · pulls headline, education, past roles</p>
              </div>
              <Button
                variant="outline"
                onClick={handleEnrich}
                disabled={enriching}
              >
                {enriching ? (
                  <>
                    <Loader2 className="animate-spin" /> Enriching…
                  </>
                ) : (
                  <>
                    Enrich via Apify
                  </>
                )}
              </Button>
            </div>

            {company.ceo_profile && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">{company.ceo_profile.headline}</p>
                <p className="flex items-center gap-1 text-xs text-gray-600"><MapPin className="w-3 h-3 shrink-0" /> {company.ceo_profile.current_role}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {company.ceo_profile.past_roles.map(r => (
                    <Badge key={r} variant="secondary">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          size="lg"
          onClick={handleSaveAndMatch}
          className="w-full"
        >
          Save Profile &amp; Find Matches
        </Button>
      </div>
    );
  }

  return null;
}
