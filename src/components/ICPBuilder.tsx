import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  RotateCw,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const ICPBuilder: React.FC = () => {
  const { icp, updateICP, parseICPWithAI, isAIWorking, aiWorkingMessage, setActiveTab } = useLeadForge();

  const [prompt, setPrompt] = useState(icp.naturalLanguageDefinition);
  const [newTag, setNewTag] = useState<{ category: string; value: string }>({ category: '', value: '' });

  const examplePrompts = [
    'Fast-growing Series A or B B2B SaaS in US and UK with 20-100 employees, using Next.js or PostgreSQL, currently hiring senior engineering leaders.',
    'E-commerce tech and Shopify Plus brands with $5M-$30M revenue seeking autonomous customer support and margin analytics workflows.',
    'FinTech and HealthTech companies expanding regional compliance teams who recently announced new security or API infrastructure initiatives.',
  ];

  const handleParse = async () => {
    if (!prompt.trim()) return;
    await parseICPWithAI(prompt);
  };

  const handleRemoveItem = (category: keyof typeof icp.criteria, index: number) => {
    const list = [...icp.criteria[category]];
    list.splice(index, 1);
    updateICP({
      criteria: {
        ...icp.criteria,
        [category]: list,
      },
    });
  };

  const handleAddItem = (category: keyof typeof icp.criteria, value: string) => {
    if (!value.trim()) return;
    updateICP({
      criteria: {
        ...icp.criteria,
        [category]: [...icp.criteria[category], value.trim()],
      },
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
          <Sliders className="w-3.5 h-3.5" />
          <span>Ideal Customer Profile Intelligence</span>
        </div>
        <h1 className="font-editorial italic text-4xl sm:text-5xl text-white font-normal">
          Define who you want to sell to in plain English.
        </h1>
        <p className="mt-2 text-sm sm:text-base font-ui text-white/60 font-light max-w-3xl">
          Describe your sweet spot accounts, buyer roles, and trigger signals. LeadForge translates your narrative into structured scoring rules and transparent inference assumptions.
        </p>
      </div>

      {/* Main Glass Input Panel */}
      <div className="rounded-3xl glass-panel-elevated p-6 md:p-8 border border-white/[0.12] space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-ui uppercase tracking-wider text-white/60 font-semibold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white/80" />
            Natural-Language Criteria Definition
          </label>
          <span className="text-[11px] font-mono text-white/40">Gemini 3.8 Flash Parser</span>
        </div>

        <textarea
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. We are targeting Series A-B B2B SaaS companies in North America with 30-150 employees that recently hired heads of marketing and are scaling engineering velocity..."
          className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 leading-relaxed font-light transition-all resize-none"
        />

        {/* Quick Example Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-ui text-white/40 block">Try an agency example:</span>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] font-ui text-white/60 hover:text-white transition-all text-left truncate max-w-xs"
              >
                "{ex.slice(0, 48)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Parse CTA */}
        <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs font-ui text-white/50">
            {isAIWorking ? aiWorkingMessage : 'Updates scoring weights & re-evaluates all workspace pursuits'}
          </div>

          <button
            onClick={handleParse}
            disabled={isAIWorking || !prompt.trim()}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-ui text-xs font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAIWorking ? 'animate-spin' : ''}`} />
            <span>{isAIWorking ? 'Synthesizing ICP...' : 'Parse & Update ICP Model'}</span>
          </button>
        </div>
      </div>

      {/* Structured Criteria Breakdown (PRD SCR-02 requirement: separate inferred vs explicit) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-ui font-semibold text-base text-white">
              Active Structured Criteria
            </h2>
            <p className="text-xs font-ui text-white/50">
              Directly editable parameters used by the deterministic scoring engine.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full glass-pill text-xs font-ui text-white/70">
            Profile: {icp.name}
          </span>
        </div>

        {/* Inferred Assumptions Card (Trust Rule: show which criteria were inferred) */}
        {icp.criteria.inferredAssumptions && icp.criteria.inferredAssumptions.length > 0 && (
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.1] bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2 text-xs font-ui font-medium text-white/80">
              <HelpCircle className="w-4 h-4 text-white/60" />
              <span>Inferred AI Assumptions (Explicitly Tracked)</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-xs font-ui text-white/60 font-light">
              {icp.criteria.inferredAssumptions.map((asm, idx) => (
                <li key={idx}>{asm}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Industries */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                Target Industries
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.industries.length} items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {icp.criteria.industries.map((ind, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-ui text-white flex items-center gap-1.5 group"
                >
                  <span>{ind}</span>
                  <button
                    onClick={() => handleRemoveItem('industries', i)}
                    className="text-white/30 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Company Scale & Revenue */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                Company Scale & Funding
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.companySize.length} items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {icp.criteria.companySize.map((sz, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-ui text-white flex items-center gap-1.5"
                >
                  <span>{sz}</span>
                  <button
                    onClick={() => handleRemoveItem('companySize', i)}
                    className="text-white/30 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buyer Roles */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                Target Buyer Roles
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.buyerRoles.length} items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {icp.criteria.buyerRoles.map((role, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-ui text-white flex items-center gap-1.5"
                >
                  <span>{role}</span>
                  <button
                    onClick={() => handleRemoveItem('buyerRoles', i)}
                    className="text-white/30 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Buying Signals / Triggers */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                High-Intent Buying Signals
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.buyingSignals.length} items
              </span>
            </div>
            <div className="space-y-1.5">
              {icp.criteria.buyingSignals.map((sig, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-ui text-white/90 flex items-center justify-between gap-2"
                >
                  <span className="line-clamp-1">{sig}</span>
                  <button
                    onClick={() => handleRemoveItem('buyingSignals', i)}
                    className="text-white/30 hover:text-white shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Target Geography */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                Target Geography
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.geography.length} items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {icp.criteria.geography.map((geo, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-ui text-white flex items-center gap-1.5"
                >
                  <span>{geo}</span>
                  <button
                    onClick={() => handleRemoveItem('geography', i)}
                    className="text-white/30 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-white/70">
                Disqualifying Exclusions
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                {icp.criteria.exclusions.length} items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {icp.criteria.exclusions.map((ex, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-ui text-red-200 flex items-center gap-1.5"
                >
                  <span>{ex}</span>
                  <button
                    onClick={() => handleRemoveItem('exclusions', i)}
                    className="text-red-300/40 hover:text-red-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Save and Review Pursuits */}
        <div className="pt-4 text-center">
          <button
            onClick={() => setActiveTab('overview')}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold inline-flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Review Prioritized Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
