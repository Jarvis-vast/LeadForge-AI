import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkConstellation } from './NetworkConstellation';
import { useLeadForge } from '../context/LeadForgeContext';
import { OnboardingData } from '../types';
import { api } from '../lib/api';
import { Sparkles, Loader2, Check, ArrowRight, AlertCircle } from 'lucide-react';

const GEOGRAPHY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Europe',
  'Global',
  'Custom',
];

function isValidWebsiteUrl(urlStr: string): boolean {
  const trimmed = urlStr.trim();
  if (!trimmed) return true;
  try {
    const toCheck = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(toCheck);
    return Boolean(parsed.hostname && parsed.hostname.includes('.') && parsed.hostname.length >= 4);
  } catch {
    return false;
  }
}

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, skipOnboarding, workspace, onboardingData } = useLeadForge();

  // Form State with pre-population
  const [workspaceName, setWorkspaceName] = useState(onboardingData?.workspaceName || workspace?.name || '');
  const [whatYouSell, setWhatYouSell] = useState(onboardingData?.whatYouSell || '');
  const [whoYouSellTo, setWhoYouSellTo] = useState(onboardingData?.whoYouSellTo || '');
  const [selectedGeos, setSelectedGeos] = useState<string[]>(
    onboardingData?.geographies && onboardingData.geographies.length > 0
      ? onboardingData.geographies
      : ['India', 'United States']
  );
  const [customGeo, setCustomGeo] = useState(onboardingData?.customGeography || '');
  const [website, setWebsite] = useState(onboardingData?.website || workspace?.website || '');

  // Keep form in sync if workspace/onboardingData loads asynchronously
  useEffect(() => {
    if (onboardingData) {
      if (!workspaceName && onboardingData.workspaceName) setWorkspaceName(onboardingData.workspaceName);
      if (!whatYouSell && onboardingData.whatYouSell) setWhatYouSell(onboardingData.whatYouSell);
      if (!whoYouSellTo && onboardingData.whoYouSellTo) setWhoYouSellTo(onboardingData.whoYouSellTo);
      if (onboardingData.geographies && onboardingData.geographies.length > 0) {
        setSelectedGeos(onboardingData.geographies);
      }
      if (onboardingData.customGeography) setCustomGeo(onboardingData.customGeography);
      if (!website && onboardingData.website) setWebsite(onboardingData.website);
    } else if (workspace) {
      if (!workspaceName && workspace.name) setWorkspaceName(workspace.name);
      if (!website && workspace.website) setWebsite(workspace.website);
    }
  }, [onboardingData, workspace]);

  // AI Assistance states
  const [isImprovingSell, setIsImprovingSell] = useState(false);
  const [sellSuggestion, setSellSuggestion] = useState<string | null>(null);
  const [sellAiNotice, setSellAiNotice] = useState<string | null>(null);

  const [isImprovingAudience, setIsImprovingAudience] = useState(false);
  const [audienceSuggestion, setAudienceSuggestion] = useState<string | null>(null);
  const [audienceAiNotice, setAudienceAiNotice] = useState<string | null>(null);

  // Validation & Submission States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Real AI Improvement for "What do you sell?"
  const handleImproveSell = async () => {
    const raw = whatYouSell.trim();
    if (!raw) {
      setValidationError('Please enter what you sell first so AI has context to refine.');
      return;
    }
    setValidationError(null);
    setSellAiNotice(null);
    setIsImprovingSell(true);
    try {
      const res = await api.icp.parse(`Refine B2B sales offer and service proposition: ${raw}`);
      if (!res || (res as any).aiAvailable === false || (res as any).isFallback) {
        setSellAiNotice('AI provider is currently unavailable. Your text was preserved.');
      } else {
        const suggested = res.criteria?.summary || (res.criteria?.name ? `${res.criteria.name}: ${raw}` : raw);
        if (suggested && suggested.trim() !== raw) {
          setSellSuggestion(suggested.trim());
        } else {
          setSellAiNotice('Your current description is already clear and concise.');
        }
      }
    } catch (err: any) {
      setSellAiNotice(err.message || 'AI service unavailable. Your original text was preserved.');
    } finally {
      setIsImprovingSell(false);
    }
  };

  // Real AI Improvement for "Who do you sell to?"
  const handleImproveAudience = async () => {
    const raw = whoYouSellTo.trim();
    if (!raw) {
      setValidationError('Please enter who you sell to first so AI has context to refine.');
      return;
    }
    setValidationError(null);
    setAudienceAiNotice(null);
    setIsImprovingAudience(true);
    try {
      const res = await api.icp.parse(`Refine target buyer roles, company stages, and ideal customer profile: ${raw}`);
      if (!res || (res as any).aiAvailable === false || (res as any).isFallback) {
        setAudienceAiNotice('AI provider is currently unavailable. Your text was preserved.');
      } else {
        const buyerRoles = res.criteria?.buyerRoles?.length ? res.criteria.buyerRoles.slice(0, 3).join(', ') : '';
        const industries = res.criteria?.industries?.length ? res.criteria.industries.slice(0, 2).join(' and ') : '';
        let suggested = '';
        if (buyerRoles && industries) {
          suggested = `${buyerRoles} at high-growth ${industries} organizations`;
        } else if (res.criteria?.summary) {
          suggested = res.criteria.summary;
        } else {
          suggested = raw;
        }

        if (suggested && suggested.trim() !== raw) {
          setAudienceSuggestion(suggested.trim());
        } else {
          setAudienceAiNotice('Your target audience description is already well-defined.');
        }
      }
    } catch (err: any) {
      setAudienceAiNotice(err.message || 'AI service unavailable. Your original text was preserved.');
    } finally {
      setIsImprovingAudience(false);
    }
  };

  // Submit Handler: Real operation with real backend persistence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSkipping) return;
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
    if (selectedGeos.length === 0) {
      setValidationError('Please select at least one geography.');
      return;
    }
    if (selectedGeos.includes('Custom') && !customGeo.trim()) {
      setValidationError('Please specify your custom target geography.');
      return;
    }
    if (website.trim() && !isValidWebsiteUrl(website)) {
      setValidationError('Please enter a valid website URL (e.g. acme.com or https://acme.com).');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Configuring workspace & target ICP…');

    try {
      const data: OnboardingData = {
        workspaceName: workspaceName.trim(),
        whatYouSell: whatYouSell.trim(),
        whoYouSellTo: whoYouSellTo.trim(),
        geographies: selectedGeos,
        customGeography: selectedGeos.includes('Custom') ? customGeo.trim() : undefined,
        website: website.trim() || undefined,
      };

      // Persists through backend to SQLite; throws if persistence fails
      await completeOnboarding(data);
      setIsSuccess(true);
      setStatusMessage('Your sales context is ready.');
    } catch (err: any) {
      // In case of error: preserve all inputs, display actionable message, and allow retry
      setValidationError(err.message || 'Failed to save onboarding configuration. Your entered values have been preserved. Please try again.');
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip Handler: Explicitly persists skipped status
  const handleSkip = async () => {
    if (isSubmitting || isSkipping) return;
    setValidationError(null);
    setIsSkipping(true);
    try {
      await skipOnboarding();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to update workspace settings. Please try again.');
      setIsSkipping(false);
    }
  };

  // Format Geography display for preview
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
      {/* Cinematic background language */}
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
          {/* Top-left: LF mark */}
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

          {/* Top-right: Understated progress indicator */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-ui font-normal text-white/[0.45] tracking-widest uppercase">
            <span>1 of 3</span>
          </div>
        </motion.header>

        {/* MAIN COMPOSITION */}
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

          {/* MAIN HEADLINE */}
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

          {/* FORM CONTAINER */}
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
                Workspace name <span className="text-white/40">*</span>
              </label>
              <input
                id="workspaceName"
                type="text"
                value={workspaceName}
                disabled={isSubmitting || isSkipping}
                onChange={(e) => {
                  setWorkspaceName(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Acme Digital"
                className="w-full h-[52px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/35 focus:outline-none focus:bg-white/[0.05] transition-all disabled:opacity-50"
              />
              <p className="text-[12px] text-white/45 font-ui font-light">
                Use your agency or business name.
              </p>
            </div>

            {/* FIELD 02: WHAT DO YOU SELL? */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="whatYouSell"
                  className="block text-xs sm:text-sm font-ui font-medium text-white"
                >
                  What do you sell? <span className="text-white/40">*</span>
                </label>
                {/* Contextual control: Improve with AI */}
                <button
                  type="button"
                  onClick={handleImproveSell}
                  disabled={isImprovingSell || isSubmitting || isSkipping}
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
                disabled={isSubmitting || isSkipping}
                onChange={(e) => {
                  setWhatYouSell(e.target.value);
                  if (validationError) setValidationError(null);
                  if (sellAiNotice) setSellAiNotice(null);
                }}
                placeholder="Example: AI automation systems for growing B2B companies"
                className="w-full min-h-[100px] max-h-[140px] rounded-2xl p-4 bg-white/[0.045] border border-white/[0.14] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/45 focus:outline-none focus:bg-white/[0.06] transition-all resize-none shadow-sm disabled:opacity-50"
              />

              {/* Inline AI notice if unavailable or note */}
              {sellAiNotice && (
                <div className="text-[12px] text-amber-300/80 font-ui flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{sellAiNotice}</span>
                </div>
              )}

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
                  Who do you sell to? <span className="text-white/40">*</span>
                </label>
                {/* Contextual control: Improve with AI */}
                <button
                  type="button"
                  onClick={handleImproveAudience}
                  disabled={isImprovingAudience || isSubmitting || isSkipping}
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
                disabled={isSubmitting || isSkipping}
                onChange={(e) => {
                  setWhoYouSellTo(e.target.value);
                  if (validationError) setValidationError(null);
                  if (audienceAiNotice) setAudienceAiNotice(null);
                }}
                placeholder="Example: Founder-led SaaS companies with 10–100 employees"
                className="w-full h-[52px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/35 focus:outline-none focus:bg-white/[0.05] transition-all disabled:opacity-50"
              />

              {/* Inline AI notice if unavailable or note */}
              {audienceAiNotice && (
                <div className="text-[12px] text-amber-300/80 font-ui flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{audienceAiNotice}</span>
                </div>
              )}

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
                Where do you want to sell? <span className="text-white/40">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {GEOGRAPHY_OPTIONS.map((geo) => {
                  const isSelected = selectedGeos.includes(geo);
                  return (
                    <button
                      key={geo}
                      type="button"
                      disabled={isSubmitting || isSkipping}
                      onClick={() => toggleGeography(geo)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-ui transition-all ${
                        isSelected
                          ? 'bg-white text-black font-medium border border-white shadow-sm'
                          : 'glass-pill text-white/60 hover:text-white hover:bg-white/[0.08]'
                      } disabled:opacity-50`}
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
                    className="overflow-hidden pt-2"
                  >
                    <input
                      type="text"
                      value={customGeo}
                      disabled={isSubmitting || isSkipping}
                      onChange={(e) => {
                        setCustomGeo(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="e.g. Australia & Southeast Asia"
                      className="w-full h-[46px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-xs sm:text-sm font-ui focus:border-white/35 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-[12px] text-white/45 font-ui font-light">
                Select one or more target regions for outbound prospect identification.
              </p>
            </div>

            {/* FIELD 05: OPTIONAL WEBSITE */}
            <div className="space-y-2 pt-1">
              <label
                htmlFor="website"
                className="block text-xs sm:text-sm font-ui font-medium text-white/90"
              >
                Website <span className="text-white/40 text-[11px] font-normal">(Optional)</span>
              </label>
              <input
                id="website"
                type="text"
                value={website}
                disabled={isSubmitting || isSkipping}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="https://youragency.com"
                className="w-full h-[52px] rounded-full px-5 bg-white/[0.035] border border-white/[0.10] text-white placeholder:text-white/[0.32] text-sm sm:text-base font-ui focus:border-white/35 focus:outline-none focus:bg-white/[0.05] transition-all disabled:opacity-50"
              />
              <p className="text-[12px] text-white/45 font-ui font-light">
                LeadForge can crawl your case studies and testimonials to find deeper proof points.
              </p>
            </div>

            {/* VALIDATION ERROR BANNER */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs sm:text-sm font-ui flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION FOOTER */}
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
                    <span>{statusMessage || 'Saving configuration…'}</span>
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
                disabled={isSubmitting || isSkipping}
                className="w-full sm:w-auto h-[50px] sm:h-[52px] px-8 rounded-full bg-white text-black font-ui font-medium text-sm sm:text-[15px] hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Configuring ICP…</span>
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
                onClick={handleSkip}
                disabled={isSubmitting || isSkipping}
                className="text-xs sm:text-sm text-white/40 hover:text-white/75 font-ui transition-colors text-center disabled:opacity-40"
              >
                {isSkipping ? 'Skipping setup…' : "I'll set this up later"}
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
