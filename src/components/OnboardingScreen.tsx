import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkConstellation } from './NetworkConstellation';
import { useLeadForge } from '../context/LeadForgeContext';
import { OnboardingData } from '../types';
import { Sparkles, Loader2, Check, ArrowRight } from 'lucide-react';

const GEOGRAPHY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Europe',
  'Global',
  'Custom',
];

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, skipOnboarding } = useLeadForge();

  // Form State
  const [workspaceName, setWorkspaceName] = useState('');
  const [whatYouSell, setWhatYouSell] = useState('');
  const [whoYouSellTo, setWhoYouSellTo] = useState('');
  const [selectedGeos, setSelectedGeos] = useState<string[]>(['India', 'United States']);
  const [customGeo, setCustomGeo] = useState('');
  const [website, setWebsite] = useState('');

  // AI Assistance states
  const [isImprovingSell, setIsImprovingSell] = useState(false);
  const [sellSuggestion, setSellSuggestion] = useState<string | null>(null);

  const [isImprovingAudience, setIsImprovingAudience] = useState(false);
  const [audienceSuggestion, setAudienceSuggestion] = useState<string | null>(null);

  // Validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Submission & Loading Progression
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLoadingStage, setCurrentLoadingStage] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadingStages = [
    'Understanding your offer',
    'Defining your ideal customer',
    'Preparing your first opportunities',
  ];

  // Motion variants
  const entranceVariant = {
    initial: { opacity: 0, filter: 'blur(10px)', y: 18 },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };

  // Toggle Geography Pill
  const toggleGeography = (geo: string) => {
    setSelectedGeos((prev) => {
      if (prev.includes(geo)) {
        const next = prev.filter((g) => g !== geo);
        return next.length > 0 ? next : [geo];
      } else {
        return [...prev, geo];
      }
    });
  };

  // AI Improvement for "What do you sell?"
  const handleImproveSell = () => {
    setIsImprovingSell(true);
    setTimeout(() => {
      const raw = whatYouSell.trim();
      let suggestion = 'AI automation systems for growing B2B companies';
      if (raw.toLowerCase().includes('design') || raw.toLowerCase().includes('ux')) {
        suggestion = 'High-velocity UI/UX design systems and product design for venture-backed SaaS';
      } else if (raw.toLowerCase().includes('dev') || raw.toLowerCase().includes('code') || raw.toLowerCase().includes('software')) {
        suggestion = 'Full-stack cloud engineering and autonomous workflow automation for modern enterprises';
      } else if (raw.toLowerCase().includes('market') || raw.toLowerCase().includes('seo') || raw.toLowerCase().includes('growth')) {
        suggestion = 'Outcome-driven B2B outbound demand generation and algorithmic pipeline acquisition';
      } else if (raw.length > 10) {
        suggestion = `${raw.charAt(0).toUpperCase() + raw.slice(1)} engineered for high-growth tech companies`;
      }
      setSellSuggestion(suggestion);
      setIsImprovingSell(false);
    }, 550);
  };

  // AI Improvement for "Who do you sell to?"
  const handleImproveAudience = () => {
    setIsImprovingAudience(true);
    setTimeout(() => {
      const raw = whoYouSellTo.trim();
      let suggestion = 'Founder-led SaaS and tech-enabled companies with 10–100 employees';
      if (raw.toLowerCase().includes('enterprise') || raw.toLowerCase().includes('large')) {
        suggestion = 'Mid-market to enterprise engineering leaders and VP of Technologies';
      } else if (raw.toLowerCase().includes('agency') || raw.toLowerCase().includes('firm')) {
        suggestion = 'High-performing boutique agencies seeking scalable technical execution partners';
      } else if (raw.toLowerCase().includes('start') || raw.toLowerCase().includes('seed')) {
        suggestion = 'Funded Seed and Series A startups scaling their core technical infrastructure';
      } else if (raw.length > 8) {
        suggestion = `${raw.charAt(0).toUpperCase() + raw.slice(1)} with demonstrated operational velocity`;
      }
      setAudienceSuggestion(suggestion);
      setIsImprovingAudience(false);
    }, 550);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation checks
    if (!workspaceName.trim()) {
      setValidationError('Please provide your workspace or agency name.');
      return;
    }
    if (!whatYouSell.trim()) {
      setValidationError('Add a little more detail about what you sell.');
      return;
    }
    if (!whoYouSellTo.trim()) {
      setValidationError('Describe who you sell to in plain language.');
      return;
    }

    setIsSubmitting(true);

    // Progression of loading stages
    // Stage 0: Understanding your offer
    setCurrentLoadingStage(0);

    setTimeout(() => {
      // Stage 1: Defining your ideal customer
      setCurrentLoadingStage(1);
    }, 600);

    setTimeout(() => {
      // Stage 2: Preparing your first opportunities
      setCurrentLoadingStage(2);
    }, 1200);

    setTimeout(async () => {
      setIsSuccess(true);
      const data: OnboardingData = {
        workspaceName: workspaceName.trim(),
        whatYouSell: whatYouSell.trim(),
        whoYouSellTo: whoYouSellTo.trim(),
        geographies: selectedGeos,
        customGeography: customGeo.trim() || undefined,
        website: website.trim() || undefined,
      };

      setTimeout(async () => {
        await completeOnboarding(data);
      }, 700);
    }, 1850);
  };

  // Format Geography display for AI preview
  const geographyDisplay = useMemo(() => {
    const list = [...selectedGeos];
    if (list.includes('Custom') && customGeo.trim()) {
      const idx = list.indexOf('Custom');
      list[idx] = customGeo.trim();
    }
    return list.join(' + ');
  }, [selectedGeos, customGeo]);

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between overflow-x-hidden font-ui select-none">
      {/* Subtle cinematic background language established on Screen 01 */}
      <NetworkConstellation />

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-between max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-10">
        {/* TOP BAR */}
        <motion.header
          className="flex items-center justify-between w-full"
          variants={entranceVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.05 }}
        >
          {/* Top-left: LF mark in 44px liquid-glass circle + LeadForge Barlow Medium */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full glass-strong border border-white/[0.18] flex items-center justify-center shadow-lg luminous-edge">
              <span className="font-ui font-semibold text-sm tracking-wider text-white">
                LF
              </span>
            </div>
            <span className="font-ui font-medium text-base sm:text-lg text-white tracking-tight">
              LeadForge
            </span>
          </div>

          {/* Top-right: Understated progress indicator: 1 of 3 (Barlow, rgba(255,255,255,0.45)) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-ui font-normal text-white/[0.45] tracking-widest uppercase">
            <span>1 of 3</span>
          </div>
        </motion.header>

        {/* MAIN COMPOSITION: Centered content column, max-width ~760px, vertically centered with slight upward bias */}
        <div className="w-full max-w-[760px] mx-auto my-auto py-8 sm:py-12 flex flex-col items-center">
          {/* PAGE KICKER */}
          <motion.div
            className="w-full text-center sm:text-left mb-3"
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.12 }}
          >
            <span className="font-ui font-medium text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white/[0.48]">
              Let&apos;s set up your sales intelligence
            </span>
          </motion.div>

          {/* MAIN HEADLINE: Instrument Serif italic */}
          <motion.h1
            className="w-full text-center sm:text-left font-editorial italic text-white text-[44px] sm:text-[56px] lg:text-[66px] leading-[0.92] tracking-[-0.02em] font-normal mb-3"
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            Teach LeadForge what you sell.
          </motion.h1>

          {/* SUPPORTING COPY */}
          <motion.p
            className="w-full text-center sm:text-left text-[15px] sm:text-[16px] text-white/[0.62] font-light leading-[1.52] max-w-[560px] sm:self-start mb-8"
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.28 }}
          >
            A few details are enough to start. LeadForge will use them to identify the companies most worth your attention.
          </motion.p>

          {/* FORM CONTAINER: Spacious vertical form in subtle liquid-glass panel (approx 680-720px, radius 24px) */}
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-[720px] rounded-[24px] glass-panel border border-white/[0.10] p-6 sm:p-8 space-y-6 shadow-2xl relative"
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.36 }}
          >
            {/* FIELD 01: WORKSPACE NAME */}
            <div className="space-y-2">
              <label
                htmlFor="workspaceName"
                className="block text-xs sm:text-sm font-ui font-medium text-white/90"
              >
                Workspace name
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                onChange={(e) => {
                  setWorkspaceName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Acme Digital"
                className="w-full h-[52px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/35 focus:outline-none focus:bg-white/[0.05] transition-all"
              />
              <p className="text-[12px] text-white/45 font-ui font-light">
                Use your agency or business name.
              </p>
            </div>

            {/* FIELD 02: WHAT DO YOU SELL? (Most important field, slightly larger textarea, stronger emphasis) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="whatYouSell"
                  className="block text-xs sm:text-sm font-ui font-medium text-white"
                >
                  What do you sell?
                </label>

                {/* Contextual control: Improve with AI */}
                <button
                  type="button"
                  onClick={handleImproveSell}
                  disabled={isImprovingSell}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-ui text-white/60 hover:text-white transition-colors px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-50"
                  title="LeadForge can refine your description with AI"
                >
                  {isImprovingSell ? (
                    <Loader2 className="w-3 h-3 animate-spin text-white/70" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-white/80" />
                  )}
                  <span>Improve with AI</span>
                </button>
              </div>

              <textarea
                id="whatYouSell"
                rows={3}
                value={whatYouSell}
                onChange={(e) => {
                  setWhatYouSell(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Example: AI automation systems for growing B2B companies"
                className="w-full min-h-[100px] max-h-[140px] rounded-2xl p-4 bg-white/[0.045] border border-white/[0.14] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/45 focus:outline-none focus:bg-white/[0.06] transition-all resize-none shadow-sm"
              />

              {/* Inline AI suggestion banner for Field 02 */}
              <AnimatePresence>
                {sellSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.16] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-ui uppercase tracking-wider text-white/50">
                        <Sparkles className="w-3 h-3 text-white/80" />
                        <span>AI Suggestion</span>
                      </div>
                      <p className="text-xs sm:text-sm font-ui text-white font-medium">
                        {sellSuggestion}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWhatYouSell(sellSuggestion);
                            setSellSuggestion(null);
                          }}
                          className="px-3 py-1 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Use suggestion</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSellSuggestion(null)}
                          className="px-3 py-1 rounded-full glass-pill text-white/60 hover:text-white text-xs font-ui transition-all"
                        >
                          Keep mine
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[12px] text-white/45 font-ui font-light">
                Describe the service or product you want to sell more of.
              </p>
            </div>

            {/* FIELD 03: WHO DO YOU SELL TO? */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="whoYouSellTo"
                  className="block text-xs sm:text-sm font-ui font-medium text-white/90"
                >
                  Who do you sell to?
                </label>

                {/* Contextual control: Improve with AI */}
                <button
                  type="button"
                  onClick={handleImproveAudience}
                  disabled={isImprovingAudience}
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-ui text-white/60 hover:text-white transition-colors px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] disabled:opacity-50"
                  title="LeadForge can refine your target customer definition with AI"
                >
                  {isImprovingAudience ? (
                    <Loader2 className="w-3 h-3 animate-spin text-white/70" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-white/80" />
                  )}
                  <span>Improve with AI</span>
                </button>
              </div>

              <input
                id="whoYouSellTo"
                type="text"
                value={whoYouSellTo}
                onChange={(e) => {
                  setWhoYouSellTo(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Example: Founder-led SaaS companies with 10–100 employees"
                className="w-full h-[52px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/35 focus:outline-none focus:bg-white/[0.05] transition-all"
              />

              {/* Inline AI suggestion banner for Field 03 */}
              <AnimatePresence>
                {audienceSuggestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.16] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-ui uppercase tracking-wider text-white/50">
                        <Sparkles className="w-3 h-3 text-white/80" />
                        <span>AI Suggestion</span>
                      </div>
                      <p className="text-xs sm:text-sm font-ui text-white font-medium">
                        {audienceSuggestion}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setWhoYouSellTo(audienceSuggestion);
                            setAudienceSuggestion(null);
                          }}
                          className="px-3 py-1 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Use suggestion</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAudienceSuggestion(null)}
                          className="px-3 py-1 rounded-full glass-pill text-white/60 hover:text-white text-xs font-ui transition-all"
                        >
                          Keep mine
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[12px] text-white/45 font-ui font-light">
                Describe your ideal customer in plain language.
              </p>
            </div>

            {/* FIELD 04: TARGET GEOGRAPHY */}
            <div className="space-y-2.5 pt-1">
              <label className="block text-xs sm:text-sm font-ui font-medium text-white/90">
                Where do you want to sell?
              </label>

              <div className="flex flex-wrap items-center gap-2">
                {GEOGRAPHY_OPTIONS.map((geo) => {
                  const isSelected = selectedGeos.includes(geo);
                  return (
                    <button
                      key={geo}
                      type="button"
                      onClick={() => toggleGeography(geo)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-ui transition-all ${
                        isSelected
                          ? 'bg-white text-black font-medium border border-white shadow-sm'
                          : 'glass-pill text-white/60 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {geo}
                    </button>
                  );
                })}
              </div>

              {/* Custom Geography input if selected */}
              <AnimatePresence>
                {selectedGeos.includes('Custom') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-1"
                  >
                    <input
                      type="text"
                      value={customGeo}
                      onChange={(e) => setCustomGeo(e.target.value)}
                      placeholder="Example: Mumbai, Pune, Bengaluru"
                      className="w-full h-[48px] rounded-full px-5 bg-white/[0.03] border border-white/[0.10] text-white placeholder:text-white/[0.30] text-sm font-ui focus:border-white/30 focus:outline-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FIELD 05: COMPANY WEBSITE (OPTIONAL) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="website"
                  className="block text-xs sm:text-sm font-ui font-medium text-white/80"
                >
                  Company website
                </label>
                <span className="text-[11px] font-ui text-white/40 uppercase tracking-wider">
                  Optional
                </span>
              </div>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full h-[48px] rounded-full px-5 bg-white/[0.025] border border-white/[0.08] text-white placeholder:text-white/[0.28] text-sm font-ui focus:border-white/30 focus:outline-none transition-all"
              />
              <p className="text-[12px] text-white/45 font-ui font-light">
                LeadForge can use your website to better understand your offer.
              </p>
            </div>

            {/* RESTRAINED INLINE VALIDATION BANNER */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3 rounded-xl bg-white/[0.05] border border-white/20 text-xs font-ui text-white flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI INTERPRETATION PREVIEW BLOCK */}
            <div className="pt-2">
              <div className="rounded-2xl glass-panel p-5 border border-white/[0.08] space-y-3.5 bg-white/[0.015]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white/70" />
                  <span className="font-ui font-medium text-[10.5px] uppercase tracking-[0.2em] text-white/45">
                    LeadForge Understands
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-ui">
                  <div className="space-y-1">
                    <span className="text-[10.5px] uppercase tracking-wider text-white/40 block">
                      You sell
                    </span>
                    <p className="text-white/90 font-medium leading-snug">
                      {whatYouSell.trim() || 'AI automation systems'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10.5px] uppercase tracking-wider text-white/40 block">
                      For
                    </span>
                    <p className="text-white/90 font-medium leading-snug">
                      {whoYouSellTo.trim() || 'Founder-led B2B companies'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10.5px] uppercase tracking-wider text-white/40 block">
                      Targeting
                    </span>
                    <p className="text-white/90 font-medium leading-snug">
                      {geographyDisplay || 'India + United States'}
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-white/[0.06] text-[11.5px] text-white/45 font-ui font-light">
                  LeadForge will use this as the starting point for your ICP.
                </div>
              </div>
            </div>

            {/* ACTION FOOTER: PRIMARY CTA + SECONDARY LINK + STAGE PROGRESSION */}
            <div className="pt-3 flex flex-col items-center sm:items-end gap-3.5">
              {/* Sequential Loading Stage Indicator */}
              <AnimatePresence>
                {isSubmitting && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="w-full flex items-center justify-center sm:justify-end gap-2 text-xs font-ui text-white/70"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span className="transition-all duration-300">
                      {loadingStages[currentLoadingStage]}…
                    </span>
                  </motion.div>
                )}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="w-full flex items-center justify-center sm:justify-end gap-2 text-xs font-ui text-white"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span className="font-medium">Your sales context is ready.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-[50px] sm:h-[52px] px-8 rounded-full bg-white text-black font-ui font-medium text-sm sm:text-[15px] hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Building your ICP…</span>
                  </>
                ) : (
                  <>
                    <span>Build my ICP</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>

              {/* Secondary Action: "I'll set this up later" */}
              <button
                type="button"
                onClick={skipOnboarding}
                disabled={isSubmitting}
                className="text-xs sm:text-sm text-white/40 hover:text-white/75 font-ui transition-colors text-center disabled:opacity-40"
              >
                I&apos;ll set this up later
              </button>
            </div>
          </motion.form>
        </div>

        {/* Bottom copyright / subtle footer hint */}
        <motion.footer
          className="w-full flex items-center justify-between text-[11px] text-white/30 font-ui"
          variants={entranceVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.52 }}
        >
          <span>LeadForge Intelligence OS</span>
          <span>Zero Configuration Setup</span>
        </motion.footer>
      </div>
    </div>
  );
};
