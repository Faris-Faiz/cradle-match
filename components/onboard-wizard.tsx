"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, FileText, Loader2, MapPin, Plus, Upload, X } from "lucide-react";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { pushSnackbar } from "@/components/ui/snackbar";

type Step = "upload" | "extracting" | "review" | "enriching" | "done";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    if (!f.name.endsWith(".pdf")) {
      pushSnackbar("warning", "Unsupported file", "Pitch decks must be uploaded as a PDF.");
      return;
    }
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
    try {
      // Hold the extraction animation 2s longer so it stays legible on fast responses.
      const [res] = await Promise.all([
        fetch("/api/companies", { method: "POST", body: fd }),
        sleep(2000),
      ]);
      if (!res.ok) throw new Error(`Extraction request failed (${res.status})`);
      const data: Company = await res.json();
      setCompany(data);
      setEditedCompany(data);
      setStep("review");
      pushSnackbar("success", "Profile extracted", `${data.name}'s profile is ready to review.`);
    } catch (e) {
      setStep("upload");
      pushSnackbar("error", "Extraction failed", e instanceof Error ? e.message : "Could not read the pitch deck.");
    }
  };

  const handleUseDemoFile = async () => {
    setStep("extracting");
    const fd = new FormData();
    fd.append("company_name", "TechVenture");
    try {
      // Hold the extraction animation 2s longer so it stays legible on fast responses.
      const [res] = await Promise.all([
        fetch("/api/companies", { method: "POST", body: fd }),
        sleep(2000),
      ]);
      if (!res.ok) throw new Error(`Extraction request failed (${res.status})`);
      const data: Company = await res.json();
      setCompany(data);
      setEditedCompany(data);
      setStep("review");
      pushSnackbar("success", "Demo profile extracted", `${data.name}'s profile is ready to review.`);
    } catch (e) {
      setStep("upload");
      pushSnackbar("error", "Extraction failed", e instanceof Error ? e.message : "Could not load the demo deck.");
    }
  };

  const handleEnrich = async () => {
    if (!company) return;
    setEnriching(true);
    try {
      const res = await fetch(`/api/companies/${company.id}/enrich`, { method: "POST" });
      if (!res.ok) throw new Error(`Enrichment request failed (${res.status})`);
      const updated: Company = await res.json();
      setCompany(updated);
      setEditedCompany(updated);
      pushSnackbar("success", "CEO profile enriched", `Pulled LinkedIn details for ${updated.ceo_name}.`);
    } catch (e) {
      pushSnackbar("error", "Enrichment failed", e instanceof Error ? e.message : "Could not reach LinkedIn.");
    } finally {
      setEnriching(false);
    }
  };

  const handleSaveAndMatch = async () => {
    if (!company) return;
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedCompany),
      });
      if (!res.ok) throw new Error(`Save request failed (${res.status})`);
      pushSnackbar("success", "Profile saved", "Finding mentor and programme matches…");
      router.push(`/companies/${company.id}/match`);
    } catch (e) {
      pushSnackbar("error", "Save failed", e instanceof Error ? e.message : "Could not save the company profile.");
    }
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
              <p className="text-xs text-gray-400 mt-1">PDF · our extracting agent will pull out the company profile</p>
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
            Extract Profile
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
    return <ExtractionLoader />;
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
                <p className="text-xs text-gray-500 mt-0.5">Pulls the CEO&apos;s headline, education, and past roles from LinkedIn</p>
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
                    Enrich Profile
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

// ── Extraction loader (scan-and-stream animation) ─────────────────────────────
// Self-contained: ships its own scoped CSS so the keyframe-heavy animation
// doesn't need Tailwind utilities. All classes are `ext-` prefixed to avoid
// colliding with global styles.

function ExtractionLoader() {
  return (
    <div className="ext-stage flex flex-col items-center rounded-xl p-12">
      <style>{EXTRACTION_STYLES}</style>
      <div className="ext-loader-wrapper">
          <div className="ext-server-container">
            <div className="ext-server-disk"><div className="ext-server-light" /></div>
            <div className="ext-server-disk"><div className="ext-server-light" /></div>
            <div className="ext-server-disk"><div className="ext-server-light" /></div>
          </div>

          <div className="ext-upload-beam" />

          <div className="ext-data-stream">
            <span className="ext-data-particle ext-dp-1" data-char="1" />
            <span className="ext-data-particle ext-dp-2" data-char="{" />
            <span className="ext-data-particle ext-dp-3" data-char="0" />
            <span className="ext-data-particle ext-dp-4" data-char="A" />
            <span className="ext-data-particle ext-dp-5" data-char="}" />
            <span className="ext-data-particle ext-dp-6" data-char="1" />
            <span className="ext-data-particle ext-dp-7" data-char="X" />
            <span className="ext-data-particle ext-dp-8" data-char="0" />
          </div>

          <div className="ext-document-container">
            <div className="ext-scanner-beam" />
            <div className="ext-doc-line ext-title" />
            <div className="ext-doc-line" />
            <div className="ext-doc-line ext-medium" />
            <div className="ext-doc-line" />
            <div className="ext-doc-line ext-short" />
            <div className="ext-doc-line" />
          </div>
        </div>

      <div className="ext-loading-container">
        <div className="ext-loading-title">Extracting Company Profile</div>
        <div className="ext-loading-subtitle">
          Our extracting agent is reading the pitch deck<span className="ext-dots" />
        </div>
        <div className="ext-progress-track">
          <div className="ext-progress-fill" />
        </div>
      </div>
    </div>
  );
}

const EXTRACTION_STYLES = `
.ext-stage {
  background: transparent;
}

.ext-loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.ext-server-container {
  position: relative;
  width: 60px;
  height: 50px;
  margin-bottom: 70px;
  z-index: 10;
}

.ext-server-disk {
  position: absolute;
  width: 100%;
  height: 20px;
  border: 2px solid #22c55e;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(187,247,208,0.4), inset 0 2px 4px rgba(34,197,94,0.3);
}

.ext-server-disk:nth-child(1) { top: 0; z-index: 3; }
.ext-server-disk:nth-child(2) { top: 12px; z-index: 2; }
.ext-server-disk:nth-child(3) { top: 24px; z-index: 1; }

.ext-server-light {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #86efac;
  border-radius: 50%;
  left: 10px;
  top: 8px;
  box-shadow: 0 0 5px #86efac;
  animation: ext-blink-light 1.5s infinite alternate;
}

.ext-server-disk:nth-child(2) .ext-server-light { animation-delay: 0.5s; background-color: #bef264; box-shadow: 0 0 5px #bef264; }
.ext-server-disk:nth-child(3) .ext-server-light { animation-delay: 1s; }

@keyframes ext-blink-light {
  0%, 20% { opacity: 0.2; }
  80%, 100% { opacity: 1; }
}

.ext-document-container {
  position: relative;
  width: 72px;
  height: 96px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 4px 16px 4px 4px;
  padding: 12px 10px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(187,247,208,0.4), 0 2px 5px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
}

.ext-document-container::before {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 17px 17px 0;
  border-color: transparent transparent transparent transparent;
}

.ext-document-container::after {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 17px;
  height: 17px;
  background: #bbf7d0;
  border-bottom-left-radius: 4px;
  box-shadow: -2px 2px 4px rgba(0,0,0,0.08);
  z-index: 2;
}

.ext-doc-line {
  height: 4px;
  background-color: #bbf7d0;
  border-radius: 2px;
  width: 100%;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.ext-doc-line.ext-short { width: 60%; }
.ext-doc-line.ext-medium { width: 85%; }
.ext-doc-line.ext-title {
  height: 6px;
  width: 75%;
  margin-bottom: 4px;
  background-color: #86efac;
}

.ext-doc-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: #4ade80;
  box-shadow: 0 0 5px #4ade80;
  animation: ext-scan-highlight 2s infinite linear;
}

.ext-doc-line:nth-child(2)::after { animation-delay: 0.1s; }
.ext-doc-line:nth-child(3)::after { animation-delay: 0.2s; }
.ext-doc-line:nth-child(4)::after { animation-delay: 0.3s; }
.ext-doc-line:nth-child(5)::after { animation-delay: 0.4s; }
.ext-doc-line:nth-child(6)::after { animation-delay: 0.5s; }

@keyframes ext-scan-highlight {
  0% { left: -100%; }
  20%, 100% { left: 200%; }
}

.ext-scanner-beam {
  position: absolute;
  top: 0;
  left: -5%;
  width: 110%;
  height: 2px;
  background-color: #4ade80;
  box-shadow: 0 0 8px #4ade80, 0 2px 15px rgba(56,189,248,0.3);
  border-radius: 50%;
  z-index: 6;
  animation: ext-scan-sweep 2s infinite ease-in-out;
}

.ext-scanner-beam::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  background: linear-gradient(to bottom, rgba(74,222,128,0.1) 0%, transparent 100%);
  pointer-events: none;
}

@keyframes ext-scan-sweep {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.ext-data-stream {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  height: 120px;
  pointer-events: none;
  z-index: 4;
}

.ext-data-particle {
  position: absolute;
  color: #22c55e;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  opacity: 0;
  text-shadow: 0 1px 2px rgba(99,102,241,0.2);
}

.ext-data-particle::before { content: attr(data-char); }

.ext-dp-1 { left: 10%; bottom: 10px; animation: ext-extract-data 2.2s infinite 0.1s ease-in; }
.ext-dp-2 { left: 30%; bottom: 10px; animation: ext-extract-data 2.5s infinite 0.6s ease-in; color: #16a34a; }
.ext-dp-3 { left: 50%; bottom: 10px; animation: ext-extract-data 1.8s infinite 0.3s ease-in; }
.ext-dp-4 { left: 70%; bottom: 10px; animation: ext-extract-data 2.1s infinite 0.8s ease-in; color: #047857; }
.ext-dp-5 { left: 85%; bottom: 10px; animation: ext-extract-data 2.4s infinite 0.4s ease-in; }
.ext-dp-6 { left: 20%; bottom: 10px; animation: ext-extract-data 1.9s infinite 1.1s ease-in; }
.ext-dp-7 { left: 60%; bottom: 10px; animation: ext-extract-data 2.6s infinite 0.9s ease-in; color: #16a34a; }
.ext-dp-8 { left: 40%; bottom: 10px; animation: ext-extract-data 2.3s infinite 1.4s ease-in; }

@keyframes ext-extract-data {
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  20% { opacity: 1; transform: translateY(-20px) scale(1); }
  80% { opacity: 0.9; transform: translateY(-80px) scale(0.9); }
  100% { transform: translateY(-110px) scale(0.4); opacity: 0; filter: blur(1px); }
}

.ext-upload-beam {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 100px;
  background: linear-gradient(to top, transparent, rgba(34,197,94,0.1));
  clip-path: polygon(20% 100%, 80% 100%, 100% 0, 0 0);
  z-index: 1;
  animation: ext-pulse-beam 2s infinite alternate;
}

@keyframes ext-pulse-beam {
  0% { opacity: 0.2; width: 25px; }
  100% { opacity: 0.6; width: 35px; }
}

.ext-loading-container {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ext-loading-title {
  color: #14532d;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.ext-loading-subtitle {
  color: #166534;
  font-size: 12px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.ext-dots {
  display: inline-block;
  width: 20px;
  text-align: left;
}

.ext-dots::after {
  content: '';
  animation: ext-typing-dots 1.5s infinite steps(4, end);
}

@keyframes ext-typing-dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

.ext-progress-track {
  width: 150px;
  height: 4px;
  background: #dcfce7;
  border-radius: 4px;
  margin-top: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.ext-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a);
  width: 0%;
  border-radius: 4px;
  animation: ext-load-progress 4s infinite ease-in-out;
  box-shadow: 0 0 8px rgba(34,197,94,0.4);
}

@keyframes ext-load-progress {
  0% { width: 0%; left: 0; }
  50% { width: 100%; left: 0; }
  100% { width: 0%; left: 100%; }
}
`;
