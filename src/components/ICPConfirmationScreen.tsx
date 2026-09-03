import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkConstellation } from './NetworkConstellation';
import { useLeadForge } from '../context/LeadForgeContext';
import { StructuredICP } from '../types';
import {
  Check,
  Edit2,
  RotateCcw,
  Sparkles,
  Loader2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';

const AVAILABLE_COMPANY_SIZES = [
  '1–10',
  '10–50',
  '51–100',
  '101–250',
  '250–500',
  '500+',
];

const ALL_INDUSTRY_PRESETS = [
  'SaaS',
  'Technology',
  'B2B Services',
  'Professional Services',
  'Fintech',
  'Healthcare & HealthTech',
  'E-Commerce Tech',
  'Industrial & Hardware',
];

const AVAILABLE_DECISION_MAKERS = [
  'Founder',
  'CEO',
  'Head of Marketing',
  'VP Growth',
  'Revenue Leader',
  'Chief Technology Officer',
  'VP Engineering',
  'COO',
];

export const ICPConfirmationScreen: React.FC = () => {
  const {
    structuredICP,
    approveICP,
    reopenOnboarding,
    regenerateICP,
    updateStructuredICP,
  } = useLeadForge();

  // Local copy of ICP for inline editing or review
  const [localICP, setLocalICP] = useState<StructuredICP>(structuredICP);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Expanded industry view (+3 more toggle)
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  // New tag input state in edit mode
  const [newIndustryInput, setNewIndustryInput] = useState('');
  const [newGeoInput, setNewGeoInput] = useState('');
  const [newRoleInput, setNewRoleInput] = useState('');

  // Editable assumption state
  const [editingAssumptionId, setEditingAssumptionId] = useState<string | null>(null);
  const [editingAssumptionText, setEditingAssumptionText] = useState('');

  // Confirmation modal for Regenerate when user has modified values
  const [showRegenWarningModal, setShowRegenWarningModal] = useState(false);

  // Loading & staged regeneration state
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenStage, setRegenStage] = useState(0);
  const [regenError, setRegenError] = useState<string | null>(null);

  const regenStages = [
    'Reading your offer',
    'Identifying customer patterns',
    'Selecting useful buying signals',
    'Building your ICP',
  ];

  // Approval animation & progression state
  const [isApproving, setIsApproving] = useState(false);
  const [approvalStage, setApprovalStage] = useState<'IDLE' | 'APPROVED' | 'DISCOVERING'>('IDLE');

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

  // Industries to show (max 4 before "+X more" if collapsed)
  const displayedIndustries = useMemo(() => {
    if (showAllIndustries || isEditing) {
      return localICP.industries;
    }
    return localICP.industries.slice(0, 4);
  }, [localICP.industries, showAllIndustries, isEditing]);

  const hiddenIndustriesCount = Math.max(0, localICP.industries.length - 4);

  // Toggle company size chip in edit mode
  const toggleCompanySize = (size: string) => {
    if (!isEditing) return;
    setHasUserEdited(true);
    setLocalICP((prev) => {
      const exists = prev.companySize.includes(size);
      const nextSizes = exists
        ? prev.companySize.filter((s) => s !== size)
        : [...prev.companySize, size];
      return {
        ...prev,
        companySize: nextSizes.length > 0 ? nextSizes : [size],
      };
    });
  };

  // Toggle industry chip in edit mode
  const toggleIndustry = (ind: string) => {
    if (!isEditing) return;
    setHasUserEdited(true);
    setLocalICP((prev) => {
      const exists = prev.industries.includes(ind);
      const next = exists
        ? prev.industries.filter((i) => i !== ind)
        : [...prev.industries, ind];
      return {
        ...prev,
        industries: next.length > 0 ? next : [ind],
      };
    });
  };

  // Add custom industry
  const handleAddCustomIndustry = () => {
    const trimmed = newIndustryInput.trim();
    if (!trimmed || localICP.industries.includes(trimmed)) return;
    setHasUserEdited(true);
    setLocalICP((prev) => ({
      ...prev,
      industries: [...prev.industries, trimmed],
    }));
    setNewIndustryInput('');
  };

  // Toggle decision maker in edit mode
  const toggleDecisionMaker = (role: string) => {
    if (!isEditing) return;
    setHasUserEdited(true);
    setLocalICP((prev) => {
      const exists = prev.decisionMakers.includes(role);
      const next = exists
        ? prev.decisionMakers.filter((r) => r !== role)
        : [...prev.decisionMakers, role];
      return {
        ...prev,
        decisionMakers: next.length > 0 ? next : [role],
      };
    });
  };

  // Add custom decision maker
  const handleAddCustomRole = () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed || localICP.decisionMakers.includes(trimmed)) return;
    setHasUserEdited(true);
    setLocalICP((prev) => ({
      ...prev,
      decisionMakers: [...prev.decisionMakers, trimmed],
    }));
    setNewRoleInput('');
  };

  // Remove / Add geography in edit mode
  const handleRemoveGeo = (geo: string) => {
    if (!isEditing) return;
    setHasUserEdited(true);
    setLocalICP((prev) => ({
      ...prev,
      geography: prev.geography.filter((g) => g !== geo),
    }));
  };

  const handleAddCustomGeo = () => {
    const trimmed = newGeoInput.trim();
    if (!trimmed || localICP.geography.includes(trimmed)) return;
    setHasUserEdited(true);
    setLocalICP((prev) => ({
      ...prev,
      geography: [...prev.geography, trimmed],
    }));
    setNewGeoInput('');
  };

  // Assumption status handlers
  const handleAcceptAssumption = (id: string) => {
    setLocalICP((prev) => {
      const updated = prev.assumptions.map((a) =>
        a.id === id ? { ...a, status: 'accepted' as const } : a
      );
      updateStructuredICP({ assumptions: updated });
      return { ...prev, assumptions: updated };
    });
  };

  const handleStartEditAssumption = (id: string, currentText: string) => {
    setEditingAssumptionId(id);
    setEditingAssumptionText(currentText);
  };

  const handleSaveAssumptionEdit = (id: string) => {
    if (!editingAssumptionText.trim()) return;
    setLocalICP((prev) => {
      const updated = prev.assumptions.map((a) =>
        a.id === id ? { ...a, text: editingAssumptionText.trim(), status: 'accepted' as const } : a
      );
      updateStructuredICP({ assumptions: updated });
      return { ...prev, assumptions: updated };
    });
    setEditingAssumptionId(null);
    setEditingAssumptionText('');
  };

  // Save inline edit
  const handleSaveEdits = () => {
    setIsEditing(false);
    updateStructuredICP(localICP);
  };

  // Cancel inline edit
  const handleCancelEdits = () => {
    setIsEditing(false);
    setLocalICP(structuredICP);
  };

  // Trigger Regenerate with AI
  const handleTriggerRegenerate = () => {
    if (hasUserEdited) {
      setShowRegenWarningModal(true);
    } else {
      executeRegeneration();
    }
  };

  const executeRegeneration = async () => {
    setShowRegenWarningModal(false);
    setIsRegenerating(true);
    setRegenError(null);
    setRegenStage(0);

    const stepTimer1 = setTimeout(() => setRegenStage(1), 350);
    const stepTimer2 = setTimeout(() => setRegenStage(2), 750);
    const stepTimer3 = setTimeout(() => setRegenStage(3), 1150);

    try {
      const regenerated = await regenerateICP();
      setLocalICP(regenerated);
      setHasUserEdited(false);
      setIsEditing(false);
    } catch (err) {
      setRegenError('Check your business description and try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsRegenerating(false);
    }
  };

  // Approve ICP handler with staged animation
  const handleApprove = async () => {
    setIsApproving(true);
    setApprovalStage('APPROVED');

    // Stage 1: ICP approved
    setTimeout(() => {
      // Stage 2: Preparing opportunity discovery
      setApprovalStage('DISCOVERING');
    }, 900);

    setTimeout(async () => {
      // Complete approval and navigate to Screen 04
      await approveICP(localICP);
    }, 1800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between overflow-x-hidden font-ui select-none">
      {/* Cinematic continuous constellation background */}
      <NetworkConstellation />

      {/* Main Container */}
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

          {/* Top-right: Understated progress indicator: Step 2 of 3 */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-ui font-normal text-white/[0.45] tracking-widest uppercase">
            <span>Step 2 of 3</span>
          </div>
        </motion.header>

        {/* STAGED REGENERATION / LOADING OVERLAY */}
        <AnimatePresence>
          {isRegenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-md w-full rounded-3xl glass-panel p-8 border border-white/15 text-center space-y-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial italic text-2xl sm:text-3xl text-white font-normal">
                    Re-evaluating your market fit
                  </h3>
                  <p className="text-xs text-white/50 font-ui">
                    LeadForge is analyzing recent signals and offer alignment
                  </p>
                </div>

                <div className="space-y-2.5 text-left pt-2">
                  {regenStages.map((stageName, idx) => {
                    const isDone = regenStage > idx;
                    const isCurrent = regenStage === idx;
                    return (
                      <div
                        key={stageName}
                        className={`flex items-center gap-3 text-xs font-ui transition-all duration-300 ${
                          isCurrent
                            ? 'text-white font-medium pl-1'
                            : isDone
                            ? 'text-white/60'
                            : 'text-white/25'
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : isCurrent ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          )}
                        </div>
                        <span>{stageName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR STATE MODAL / BANNER */}
        <AnimatePresence>
          {regenError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="my-4 p-4 rounded-2xl glass-panel border border-white/20 flex items-center justify-between gap-4 max-w-2xl mx-auto w-full"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-white/70 shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-white">
                    We couldn&apos;t build your ICP yet.
                  </h4>
                  <p className="text-[11px] text-white/50 font-light">
                    {regenError}
                  </p>
                </div>
              </div>
              <button
                onClick={executeRegeneration}
                className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all shrink-0"
              >
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REGENERATE CONFIRMATION WARNING MODAL */}
        <AnimatePresence>
          {showRegenWarningModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <div className="max-w-md w-full rounded-3xl glass-panel p-6 sm:p-7 border border-white/20 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-4 h-4 text-white/80" />
                  <h3 className="font-ui font-medium text-sm">
                    Regenerate with AI?
                  </h3>
                </div>
                <p className="text-xs text-white/65 font-ui font-light leading-relaxed">
                  This will replace your current AI interpretation and any custom edits you have made to customer type, sizes, and decision makers.
                </p>
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => setShowRegenWarningModal(false)}
                    className="px-4 py-1.5 rounded-full glass-pill text-xs text-white/70 hover:text-white transition-all font-ui"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeRegeneration}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all"
                  >
                    Regenerate anyway
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN COMPOSITION */}
        <div className="w-full my-auto py-6 sm:py-8">
          {/* PAGE HEADER */}
          <div className="w-full max-w-[650px] mb-8 sm:mb-10 text-left">
            {/* Kicker */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <span className="font-ui font-medium text-[11px] uppercase tracking-[0.24em] text-white/[0.48]">
                Your ideal customer
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.16 }}
              className="font-editorial italic text-white text-[46px] sm:text-[56px] lg:text-[64px] leading-[0.92] tracking-[-0.02em] font-normal mb-3.5"
            >
              We found your starting ICP.
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.22 }}
              className="text-[15px] sm:text-[16px] text-white/[0.68] font-light leading-[1.54] font-ui"
            >
              LeadForge translated your description into the signals most useful for finding high-value opportunities. Review the profile before we start researching companies.
            </motion.p>
          </div>

          {/* TWO-COLUMN LAYOUT: Desktop 60-65% Left, 35-40% Right. Mobile stacked. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: STRUCTURED ICP PROFILE (~62% width: 7-8 cols on 12-col grid) */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="lg:col-span-7 xl:col-span-7 rounded-[24px] glass-panel border border-white/[0.10] p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-ui font-medium text-xs uppercase tracking-[0.2em] text-white/50">
                    Ideal Customer Profile
                  </span>
                  {hasUserEdited && !isEditing && (
                    <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.08]">
                      Edited
                    </span>
                  )}
                </div>

                {/* Right-side Edit / Save pill */}
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill hover:bg-white/[0.08] text-xs font-ui text-white/70 hover:text-white transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdits}
                      className="px-2.5 py-0.5 rounded-full text-xs font-ui text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdits}
                      className="px-3 py-1 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Update ICP</span>
                    </button>
                  </div>
                )}
              </div>

              {/* FIELD 01: CUSTOMER TYPE */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Customer type
                </label>
                {!isEditing ? (
                  <p className="font-ui font-medium text-base sm:text-lg text-white tracking-tight">
                    {localICP.customerType}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={localICP.customerType}
                    onChange={(e) => {
                      setHasUserEdited(true);
                      setLocalICP((prev) => ({ ...prev, customerType: e.target.value }));
                    }}
                    className="w-full h-[46px] rounded-full px-4 bg-white/[0.05] border border-white/20 text-white text-sm font-ui focus:outline-none focus:border-white/40"
                    placeholder="e.g. Founder-led B2B SaaS companies"
                  />
                )}
              </div>

              {/* FIELD 02: COMPANY SIZE */}
              <div className="space-y-2">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Company size
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing
                    ? AVAILABLE_COMPANY_SIZES.map((size) => {
                        const isSelected = localICP.companySize.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleCompanySize(size)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-ui transition-all ${
                              isSelected
                                ? 'bg-white text-black font-medium border border-white shadow-sm'
                                : 'glass-pill text-white/50 hover:text-white'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })
                    : localICP.companySize.map((size) => (
                        <span
                          key={size}
                          className="px-3.5 py-1 rounded-full text-xs font-ui font-medium bg-white/[0.10] border border-white/[0.22] text-white tracking-wide"
                        >
                          {size}
                        </span>
                      ))}
                </div>
              </div>

              {/* FIELD 03: INDUSTRIES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                    Industries
                  </label>
                  {!isEditing && hiddenIndustriesCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllIndustries(!showAllIndustries)}
                      className="text-[11px] font-ui text-white/50 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      <span>
                        {showAllIndustries
                          ? 'Show fewer'
                          : `+${hiddenIndustriesCount} more`}
                      </span>
                      {showAllIndustries ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {displayedIndustries.map((ind) => (
                    <span
                      key={ind}
                      className={`px-3 py-1 rounded-full text-xs font-ui transition-all ${
                        isEditing
                          ? 'bg-white text-black font-medium border border-white cursor-pointer hover:bg-white/90'
                          : 'glass-pill text-white/90 border border-white/[0.12]'
                      }`}
                      onClick={() => isEditing && toggleIndustry(ind)}
                    >
                      {ind}
                      {isEditing && (
                        <X className="w-3 h-3 inline-block ml-1 text-black/60" />
                      )}
                    </span>
                  ))}
                </div>

                {/* In edit mode, show preset suggestions + custom addition */}
                {isEditing && (
                  <div className="pt-2 space-y-2 border-t border-white/[0.06]">
                    <span className="text-[10.5px] font-ui text-white/40 uppercase tracking-wider block">
                      Quick add preset:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_INDUSTRY_PRESETS.filter(
                        (preset) => !localICP.industries.includes(preset)
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => toggleIndustry(preset)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-ui glass-pill text-white/50 hover:text-white hover:bg-white/[0.08]"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>

                    {/* Custom input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newIndustryInput}
                        onChange={(e) => setNewIndustryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomIndustry();
                          }
                        }}
                        placeholder="Add industry tag..."
                        className="h-8 rounded-full px-3 text-xs bg-white/[0.04] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomIndustry}
                        className="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-black text-xs font-ui transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FIELD 04: TARGET GEOGRAPHY */}
              <div className="space-y-2">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Target geography
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {localICP.geography.map((geo) => (
                    <span
                      key={geo}
                      className={`px-3.5 py-1 rounded-full text-xs font-ui tracking-wide transition-all ${
                        isEditing
                          ? 'bg-white text-black font-medium border border-white cursor-pointer hover:bg-white/90'
                          : 'glass-pill text-white/90'
                      }`}
                      onClick={() => isEditing && handleRemoveGeo(geo)}
                    >
                      {geo}
                      {isEditing && (
                        <X className="w-3 h-3 inline-block ml-1 text-black/60" />
                      )}
                    </span>
                  ))}
                </div>

                {/* In edit mode, add custom geo */}
                {isEditing && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newGeoInput}
                      onChange={(e) => setNewGeoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomGeo();
                        }
                      }}
                      placeholder="Add region or country..."
                      className="h-8 rounded-full px-3 text-xs bg-white/[0.04] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomGeo}
                      className="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-black text-xs font-ui transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* FIELD 05: DECISION MAKERS */}
              <div className="space-y-2">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Decision makers
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing
                    ? AVAILABLE_DECISION_MAKERS.map((role) => {
                        const isSelected = localICP.decisionMakers.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleDecisionMaker(role)}
                            className={`px-3 py-1 rounded-full text-xs font-ui transition-all ${
                              isSelected
                                ? 'bg-white text-black font-medium border border-white'
                                : 'glass-pill text-white/50 hover:text-white'
                            }`}
                          >
                            {role}
                          </button>
                        );
                      })
                    : localICP.decisionMakers.map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1 rounded-full text-xs font-ui glass-pill text-white/90 border border-white/[0.12]"
                        >
                          {role}
                        </span>
                      ))}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomRole();
                        }
                      }}
                      placeholder="Add role title..."
                      className="h-8 rounded-full px-3 text-xs bg-white/[0.04] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/35 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomRole}
                      className="px-3 h-8 rounded-full bg-white/[0.08] hover:bg-white text-white hover:text-black text-xs font-ui transition-all"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* FIELD 06: CORE PAIN (VISUALLY STANDS OUT SLIGHTLY) */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Likely business pain
                </label>
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.16] shadow-sm relative luminous-edge">
                  {!isEditing ? (
                    <p className="font-ui text-sm sm:text-[15px] text-white font-normal leading-relaxed">
                      &ldquo;{localICP.businessPain}&rdquo;
                    </p>
                  ) : (
                    <textarea
                      rows={2}
                      value={localICP.businessPain}
                      onChange={(e) => {
                        setHasUserEdited(true);
                        setLocalICP((prev) => ({ ...prev, businessPain: e.target.value }));
                      }}
                      className="w-full bg-transparent border-0 text-white text-sm font-ui focus:outline-none resize-none"
                    />
                  )}
                  <span className="text-[10px] text-white/35 font-ui mt-2 block tracking-wide">
                    Identified from market demand &amp; operational friction patterns
                  </span>
                </div>
              </div>

              {/* FIELD 07: OFFER FIT */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Why your offer fits
                </label>
                {!isEditing ? (
                  <p className="font-ui font-light text-xs sm:text-sm text-white/[0.68] leading-relaxed">
                    {localICP.offerFit}
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    value={localICP.offerFit}
                    onChange={(e) => {
                      setHasUserEdited(true);
                      setLocalICP((prev) => ({ ...prev, offerFit: e.target.value }));
                    }}
                    className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/20 text-white text-xs font-ui focus:outline-none focus:border-white/40 resize-none"
                  />
                )}
              </div>

              {/* Inline Edit Action Footer if active */}
              {isEditing && (
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdits}
                    className="px-4 py-2 rounded-full glass-pill text-xs font-ui text-white/70 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="px-5 py-2 rounded-full bg-white text-black text-xs font-ui font-medium hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Update ICP</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* RIGHT COLUMN: AI REASONING / PREVIEW PANEL (~38% width: 5 cols on 12-col grid) */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.38 }}
              className="lg:col-span-5 xl:col-span-5 rounded-[24px] liquid-glass-strong border border-white/[0.12] p-6 sm:p-7 space-y-6 shadow-2xl relative"
            >
              {/* Header: WHY LEADFORGE CHOSE THIS (Instrument Serif italic 30-36px) */}
              <div className="space-y-1">
                <span className="font-ui font-medium text-[10px] uppercase tracking-[0.22em] text-white/40 block">
                  AI Intelligence Rationale
                </span>
                <h2 className="font-editorial italic text-white text-[30px] sm:text-[34px] leading-[1.02] font-normal">
                  Why LeadForge chose this
                </h2>
              </div>

              {/* Reasoning Blocks with subtle numbered markers (not bullet lists) */}
              <div className="space-y-4 pt-1">
                {localICP.reasoning.map((block) => (
                  <div key={block.number} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-ui text-xs font-semibold text-white/40 tracking-wider">
                        {block.number} —
                      </span>
                      <h4 className="font-ui text-xs sm:text-[13px] font-medium text-white tracking-tight">
                        {block.title}
                      </h4>
                    </div>
                    <p className="font-ui text-xs text-white/65 font-light leading-relaxed pl-7">
                      {block.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* AI CONFIDENCE */}
              <div className="pt-3 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-ui font-medium text-[10.5px] uppercase tracking-[0.2em] text-white/40">
                    ICP Confidence
                  </span>
                  <span className="font-ui font-semibold text-sm sm:text-base text-white tracking-tight">
                    {localICP.confidence}%
                  </span>
                </div>

                {/* Compact horizontal confidence indicator bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    style={{ width: `${localICP.confidence}%` }}
                  />
                </div>

                <div className="space-y-0.5 pt-0.5">
                  <span className="font-ui font-medium text-xs text-white block">
                    High confidence
                  </span>
                  <p className="font-ui text-[11.5px] text-white/45 font-light leading-snug">
                    Based on your business description and target market.
                  </p>
                </div>
              </div>

              {/* AI ASSUMPTIONS TO REVIEW */}
              <div className="pt-3 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-ui font-medium text-[10.5px] uppercase tracking-[0.2em] text-white/40">
                    Assumptions to review
                  </span>
                  <span className="text-[10px] text-white/40 font-ui">
                    {localICP.assumptions.filter((a) => a.status === 'accepted').length} of {localICP.assumptions.length} confirmed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {localICP.assumptions.map((assumption) => {
                    const isAccepted = assumption.status === 'accepted';
                    const isEditingThis = editingAssumptionId === assumption.id;

                    return (
                      <div
                        key={assumption.id}
                        className={`p-3 rounded-xl border transition-all text-xs font-ui ${
                          isAccepted
                            ? 'bg-white/[0.035] border-white/20'
                            : 'bg-white/[0.02] border-white/[0.08]'
                        }`}
                      >
                        {!isEditingThis ? (
                          <div className="space-y-2">
                            <p className="text-white/80 font-light leading-relaxed">
                              {assumption.text}
                            </p>
                            <div className="flex items-center justify-end gap-2 pt-0.5">
                              {isAccepted ? (
                                <span className="text-[10.5px] text-white/70 font-medium inline-flex items-center gap-1">
                                  <Check className="w-3 h-3 text-white" />
                                  <span>Accepted</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptAssumption(assumption.id)}
                                  className="px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-medium hover:bg-white/90 transition-all flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Accept</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEditAssumption(assumption.id, assumption.text)
                                }
                                className="px-2 py-0.5 rounded-full text-[11px] text-white/45 hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingAssumptionText}
                              onChange={(e) => setEditingAssumptionText(e.target.value)}
                              className="w-full bg-white/[0.06] border border-white/20 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-white/40"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingAssumptionId(null)}
                                className="text-[11px] text-white/50 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveAssumptionEdit(assumption.id)}
                                className="px-2.5 py-0.5 rounded-full bg-white text-black text-[11px] font-medium hover:bg-white/90"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* PRIMARY ACTION & FOOTER AREA */}
          <motion.div
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.46 }}
            className="pt-10 flex flex-col items-center gap-4"
          >
            {/* Sequential Approval Indicator Transition */}
            <AnimatePresence>
              {isApproving && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center gap-1.5 text-xs font-ui"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span className="font-medium">
                      {approvalStage === 'APPROVED'
                        ? 'ICP approved'
                        : 'Preparing opportunity discovery…'}
                    </span>
                  </div>
                  {approvalStage === 'DISCOVERING' && (
                    <span className="text-white/45 text-[11px] font-light">
                      Synthesizing intelligence feed for your dashboard
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Key CTA: Large White Pill Button: Approve ICP → */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full sm:w-auto h-[52px] sm:h-[54px] px-10 rounded-full bg-white text-black font-ui font-medium text-sm sm:text-base hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 disabled:opacity-60"
              >
                {isApproving ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>ICP approved</span>
                  </>
                ) : (
                  <>
                    <span>Approve ICP</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>

            {/* Secondary Controls: Start over & Regenerate with AI */}
            <div className="flex items-center gap-6 pt-1 text-xs font-ui">
              {/* Secondary text link: Start over */}
              <button
                type="button"
                onClick={reopenOnboarding}
                disabled={isApproving}
                className="text-white/40 hover:text-white/75 transition-colors"
              >
                Start over
              </button>

              <span className="text-white/20">•</span>

              {/* Subtle text control: Regenerate with AI */}
              <button
                type="button"
                onClick={handleTriggerRegenerate}
                disabled={isApproving}
                className="text-white/40 hover:text-white/75 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate with AI</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM FOOTER */}
        <motion.footer
          variants={entranceVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.54 }}
          className="w-full flex items-center justify-between text-[11px] text-white/30 font-ui pt-6 border-t border-white/[0.04]"
        >
          <span>LeadForge Intelligence Engine</span>
          <span>Adaptive Signal Calibration</span>
        </motion.footer>
      </div>
    </div>
  );
};
