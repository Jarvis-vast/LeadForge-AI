import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Sliders,
  Building,
  Shield,
  CheckCircle,
  RotateCcw,
  Download,
  Info,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    workspace,
    updateWorkspace,
    opportunities,
    accounts,
    reopenOnboarding,
    reopenICPConfirmation,
  } = useLeadForge();

  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [agencyType, setAgencyType] = useState(workspace.agencyType);
  const [saved, setSaved] = useState(false);

  const agencyPresets = [
    { id: 'AI Automation Agency', label: 'AI Automation Agency' },
    { id: 'Web & Software Development Agency', label: 'Web & Software Development Agency' },
    { id: 'Performance Marketing Agency', label: 'Performance Marketing Agency' },
    { id: 'SEO & Content Strategy Agency', label: 'SEO & Content Strategy Agency' },
    { id: 'B2B Tech & Services', label: 'B2B Tech & Services' },
  ];

  const handleSave = () => {
    updateWorkspace({
      name: workspaceName,
      agencyType,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const backup = {
      workspace,
      opportunities,
      accounts,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadforge-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
          <Sliders className="w-3.5 h-3.5" />
          <span>Workspace Preferences</span>
        </div>
        <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
          Settings & Architecture
        </h1>
        <p className="text-sm font-ui text-white/60 font-light mt-1">
          Configure agency positioning archetype, scoring factor baselines, and data exports.
        </p>
      </div>

      {/* Workspace Profile */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/[0.1] space-y-6">
        <h2 className="font-ui font-semibold text-sm uppercase tracking-wider text-white">
          Agency Identity & Positioning
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-ui text-white/60 block mb-1.5">
              Workspace Brand Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-ui text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs font-ui text-white/60 block mb-1.5">
              Agency Archetype (Influences Default Signals & Personalization)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {agencyPresets.map((preset) => {
                const isSelected = agencyType === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setAgencyType(preset.id)}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-ui transition-all ${
                      isSelected
                        ? 'bg-white text-black font-medium border-white shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-white/[0.06]">
          <div className="text-xs font-ui text-white/40">
            {saved ? 'Saved to local workspace!' : 'Changes are stored persistently in browser state.'}
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs font-ui hover:bg-white/90 transition-all shadow-md"
          >
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Onboarding & ICP Setup Controls (Screens 02 & 03) */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/[0.1] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-ui font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white/70" />
              <span>ICP Calibration & Onboarding</span>
            </h2>
            <p className="text-xs font-ui text-white/60 font-light leading-relaxed max-w-xl">
              Re-open the AI Ideal Customer Profile confirmation review (Screen 03) or restart the full natural-language workspace onboarding (Screen 02).
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={reopenICPConfirmation}
              className="px-4 py-2.5 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-black font-ui text-xs font-medium border border-white/[0.15] transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Review ICP (Screen 03)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={reopenOnboarding}
              className="px-4 py-2.5 rounded-full glass-pill hover:bg-white/[0.08] text-white/70 hover:text-white font-ui text-xs font-medium transition-all flex items-center gap-2"
            >
              <span>Run Onboarding (Screen 02)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scoring Engine Specification (Technical Architecture #17) */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/[0.1] space-y-4">
        <h2 className="font-ui font-semibold text-sm uppercase tracking-wider text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-white/70" />
          Deterministic Opportunity Formula
        </h2>
        <p className="text-xs font-ui text-white/60 font-light leading-relaxed">
          LeadForge guarantees explainability: every opportunity score is computed from five verifiable sub-scores rather than opaque LLM guesses.
        </p>

        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-mono text-xs text-white/80 space-y-2">
          <div className="text-white font-semibold">
            Score = Math.round(0.30·Fit + 0.25·Need + 0.20·Timing + 0.15·Commercial + 0.10·EvidenceQuality - RiskPenalty)
          </div>
          <div className="text-white/50 text-[11px] pt-1">
            • 30% ICP Fit: Account industry, employee count, and technology match.<br />
            • 25% Need Signal: Problem intensity identified from job descriptions and public roadmaps.<br />
            • 20% Timing Trigger: Freshness of funding round or leadership appointments.<br />
            • 15% Commercial Value: Budget capacity and contract size potential.<br />
            • 10% Evidence Quality: Ratio of grounded source URLs to inferences.
          </div>
        </div>
      </div>

      {/* Data Export & Backup */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/[0.1] space-y-3">
        <h2 className="font-ui font-semibold text-sm uppercase tracking-wider text-white">
          Data Portability & Backup
        </h2>
        <p className="text-xs font-ui text-white/60 font-light">
          Export full JSON snapshot containing all accounts, opportunities, evidence items, and generated drafts.
        </p>
        <div className="pt-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-full glass-pill hover:bg-white/[0.08] text-xs font-ui text-white flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Workspace JSON Snapshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
