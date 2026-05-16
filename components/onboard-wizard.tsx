"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";

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
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea
          className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          value={(editedCompany[key] as string) ?? ""}
          onChange={e => setEditedCompany(prev => ({ ...prev, [key]: e.target.value }))}
        />
      ) : (
        <input
          className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              {i < 2 && <span className="text-gray-300 mx-1">→</span>}
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
                <span className="text-2xl">📄</span>
              </div>
              <p className="text-sm font-medium text-emerald-700">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · PDF</p>
            </div>
          ) : (
            <div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📤</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Drop pitch deck here</p>
              <p className="text-xs text-gray-400 mt-1">PDF · Gemini will extract the company profile</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleExtract}
            disabled={!file}
            className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Extract Profile with Gemini →
          </button>
          <button
            onClick={handleUseDemoFile}
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Use Demo Deck
          </button>
        </div>
      </div>
    );
  }

  if (step === "extracting") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-3xl">🤖</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">Extracting company profile…</h3>
        <p className="text-sm text-gray-500">Gemini is reading the pitch deck</p>
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
      </div>
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
              }`}>{i === 0 ? "✓" : i + 1}</div>
              <span className={`text-sm ${i <= 1 ? "text-gray-900 font-medium" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <span className="text-gray-300 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* Extracted badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <span className="text-emerald-600 text-sm">✓</span>
          <span className="text-sm text-emerald-700 font-medium">Profile extracted from pitch deck</span>
          <span className="text-xs text-emerald-500 ml-auto">Gemini · {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">Company Profile <span className="text-gray-400 font-normal">(edit before saving)</span></h3>

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
            <label className="block text-xs font-medium text-gray-600 mb-1">What They Need</label>
            <div className="flex flex-wrap gap-2">
              {(editedCompany.needs ?? []).map((need, i) => (
                <div key={i} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-sm text-gray-700">{need}</span>
                  <button
                    onClick={() => setEditedCompany(prev => ({ ...prev, needs: (prev.needs ?? []).filter((_, j) => j !== i) }))}
                    className="text-gray-400 hover:text-red-500 ml-1 text-xs"
                  >✕</button>
                </div>
              ))}
              <button
                onClick={() => {
                  const v = prompt("Add a need:");
                  if (v) setEditedCompany(prev => ({ ...prev, needs: [...(prev.needs ?? []), v] }));
                }}
                className="text-xs text-emerald-600 border border-emerald-200 rounded-full px-3 py-1 hover:bg-emerald-50"
              >+ Add</button>
            </div>
          </div>
        </div>

        {/* CEO LinkedIn enrichment */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">CEO LinkedIn Enrichment</h3>
              <p className="text-xs text-gray-500 mt-0.5">Apify scraper · pulls headline, education, past roles</p>
            </div>
            <button
              onClick={handleEnrich}
              disabled={enriching}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {enriching ? (
                <>
                  <span className="animate-spin">⟳</span> Enriching…
                </>
              ) : (
                "Enrich via Apify →"
              )}
            </button>
          </div>

          {company.ceo_profile && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-900">{company.ceo_profile.headline}</p>
              <p className="text-xs text-gray-600">📍 {company.ceo_profile.current_role}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {company.ceo_profile.past_roles.map(r => (
                  <span key={r} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveAndMatch}
          className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
        >
          Save Profile &amp; Find Matches →
        </button>
      </div>
    );
  }

  return null;
}
