import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkConstellation } from './NetworkConstellation';
import { useLeadForge } from '../context/LeadForgeContext';
import { StructuredICP } from '../types';
import { api } from '../lib/api';
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
  Search,
  Building2,
  MapPin,
  Users,
  Briefcase,
  ExternalLink,
  ShieldAlert,
  Database,
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

interface DiscoveredLead {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  techStack: string[];
  source: string;
  contact: {
    name: string;
    title: string;
    email: string;
  } | null;
}

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

  // Sync with context if structuredICP changes externally
  useEffect(() => {
    if (!hasUserEdited) {
      setLocalICP(structuredICP);
    }
  }, [structuredICP, hasUserEdited]);

  // Expanded industry view (+3 more toggle)
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  // Tag inputs in edit mode
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
  const [regenError, setRegenError] = useState<string | null>(null);

  // Approval state
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Lead Discovery State
  const [providerStatus, setProviderStatus] = useState<{
    providerConfigured: boolean;
    providerName: string | null;
    workspaceLeadCount: number;
    message: string;
  } | null>(null);
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  const [discoveredLeads, setDiscoveredLeads] = useState<DiscoveredLead[] | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>([]);
  const [filterValidationError, setFilterValidationError] = useState<string | null>(null);

  // Fetch real lead provider integration status on mount
  useEffect(() => {
    let isMounted = true;
    api.leads.getProviderStatus()
      .then((status) => {
        if (isMounted) setProviderStatus(status);
      })
      .catch((err) => {
        console.warn('Could not fetch lead provider status:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Industries to show
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

  // Real AI Regeneration
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

    try {
      const regenerated = await regenerateICP();
      setLocalICP(regenerated);
      setHasUserEdited(false);
      setIsEditing(false);
    } catch (err: any) {
      setRegenError(err.message || 'Check your business description and try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Real Lead Discovery Search
  const handleDiscoverLeads = async () => {
    if (isSearchingLeads || isApproving) return;
    setFilterValidationError(null);
    setDiscoveryError(null);

    // Validate inputs
    if (localICP.industries.length === 0 && localICP.geography.length === 0 && localICP.companySize.length === 0) {
      setFilterValidationError('Please select at least one industry, geography, or company size filter to search.');
      return;
    }

    setIsSearchingLeads(true);
    setHasSearched(true);

    try {
      const res = await api.leads.discover({
        industries: localICP.industries,
        geographies: localICP.geography,
        companySizes: localICP.companySize,
        jobTitles: localICP.decisionMakers,
        query: localICP.customerType,
      });

      setDiscoveredLeads(res.results || []);
    } catch (err: any) {
      setDiscoveryError(err.message || 'Failed to search leads. Your filters have been preserved.');
    } finally {
      setIsSearchingLeads(false);
    }
  };

  // Save discovered lead to workspace pipeline
  const handleSaveLead = async (lead: DiscoveredLead) => {
    if (savingLeadId || savedLeadIds.includes(lead.id)) return;
    setSavingLeadId(lead.id);

    try {
      await api.leads.save({
        name: lead.name,
        domain: lead.domain,
        industry: lead.industry,
        size: lead.size,
        location: lead.location,
        description: lead.description,
        contactName: lead.contact?.name,
        contactRole: lead.contact?.title,
        email: lead.contact?.email,
      });

      setSavedLeadIds((prev) => [...prev, lead.id]);
    } catch (err: any) {
      setDiscoveryError(err.message || `Failed to save ${lead.name} to workspace.`);
    } finally {
      setSavingLeadId(null);
    }
  };

  // Approve ICP handler with real backend persistence
  const handleApprove = async () => {
    if (isApproving || isSearchingLeads) return;
    setIsApproving(true);
    setApprovalError(null);

    try {
      // Truly persists to SQLite backend; throws on error
      await approveICP(localICP);
    } catch (err: any) {
      setApprovalError(err.message || 'Failed to save confirmed ICP profile to server. Please try again.');
      setIsApproving(false);
    }
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

          {/* Top-right: Step progress indicator */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-ui font-normal text-white/[0.45] tracking-widest uppercase">
            <span>Screen 03</span>
            <span className="text-white/20">•</span>
            <span>Step 2 of 3</span>
          </div>
        </motion.header>

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

        {/* ERROR STATE BANNER */}
        <AnimatePresence>
          {(regenError || approvalError || filterValidationError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="my-4 p-4 rounded-2xl glass-panel border border-red-500/30 bg-red-950/30 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-red-200">
                    {filterValidationError ? 'Filter validation error' : 'Action failed'}
                  </h4>
                  <p className="text-[11px] text-red-300/80 font-light">
                    {filterValidationError || regenError || approvalError}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRegenError(null);
                  setApprovalError(null);
                  setFilterValidationError(null);
                }}
                className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-ui hover:bg-white/20 transition-all shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN COMPOSITION */}
        <div className="w-full my-auto py-6 sm:py-8">
          {/* PAGE HEADER */}
          <div className="w-full max-w-[760px] mb-8 text-left">
            {/* Kicker */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="mb-2"
            >
              <span className="font-ui font-medium text-[11px] uppercase tracking-[0.24em] text-white/[0.48]">
                Screen 03 — Lead Discovery &amp; ICP Calibration
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.16 }}
              className="font-editorial italic text-white text-[44px] sm:text-[54px] lg:text-[62px] leading-[0.92] tracking-[-0.02em] font-normal mb-3.5"
            >
              Define target leads &amp; discover opportunities.
            </motion.h1>

            {/* Supporting copy */}
            <motion.p
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.22 }}
              className="text-[15px] sm:text-[16px] text-white/[0.68] font-light leading-[1.54] font-ui"
            >
              Refine your target criteria below. LeadForge will query available lead data and calibrate high-intent prospect accounts before you begin active outreach.
            </motion.p>
          </div>

          {/* TWO-COLUMN LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: TARGET FILTERS & STRUCTURED ICP (~62% width) */}
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
                    Lead Targeting Criteria
                  </span>
                  {hasUserEdited && !isEditing && (
                    <span className="text-[10px] font-ui px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.08]">
                      Customized
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
                    <span>Edit filters</span>
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
                      <span>Apply</span>
                    </button>
                  </div>
                )}
              </div>

              {/* FIELD 01: CUSTOMER TYPE */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-ui uppercase tracking-wider text-white/45">
                  Target customer type
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
                  Target company size
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
                    Target industries
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

                {/* Edit mode: preset suggestions + custom add */}
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
                  Target decision makers &amp; roles
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

              {/* FIELD 06: CORE PAIN */}
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
            </motion.div>

            {/* RIGHT COLUMN: AI REASONING & ASSUMPTIONS (~38% width) */}
            <motion.div
              variants={entranceVariant}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.38 }}
              className="lg:col-span-5 xl:col-span-5 rounded-[24px] liquid-glass-strong border border-white/[0.12] p-6 sm:p-7 space-y-6 shadow-2xl relative"
            >
              {/* Header */}
              <div className="space-y-1">
                <span className="font-ui font-medium text-[10px] uppercase tracking-[0.22em] text-white/40 block">
                  AI Intelligence Rationale
                </span>
                <h2 className="font-editorial italic text-white text-[30px] sm:text-[34px] leading-[1.02] font-normal">
                  Why LeadForge chose this
                </h2>
              </div>

              {/* Reasoning Blocks */}
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

                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    style={{ width: `${localICP.confidence}%` }}
                  />
                </div>
              </div>

              {/* ASSUMPTIONS TO REVIEW */}
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

          {/* DEDICATED LEAD DISCOVERY SEARCH ENGINE (Screen 03 Core Requirement) */}
          <motion.div
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.44 }}
            className="mt-8 rounded-[24px] glass-panel border border-white/[0.12] p-6 sm:p-8 space-y-6 shadow-2xl relative"
          >
            {/* Header with real provider status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-white/80" />
                  <h3 className="font-ui font-medium text-base sm:text-lg text-white">
                    Live Lead Discovery &amp; Verification
                  </h3>
                </div>
                <p className="text-xs text-white/60 font-light">
                  Query verified prospect accounts matching your configured criteria.
                </p>
              </div>

              {/* Provider Integration Status Indicator */}
              <div className="flex items-center gap-2">
                {providerStatus?.providerConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-ui bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                    <span>{providerStatus.providerName || 'Live Provider'} Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-ui bg-white/[0.05] text-white/70 border border-white/[0.12]">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Workspace Data Source (No external provider API set)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Provider notice banner if external provider is not configured */}
            {providerStatus && !providerStatus.providerConfigured && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-ui text-white/70 flex items-start gap-2.5">
                <Database className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-white/90">Source Status: Workspace Accounts Repository</span>
                  <p className="text-white/50 font-light leading-relaxed">
                    {providerStatus.message}
                  </p>
                </div>
              </div>
            )}

            {/* Search Trigger Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-ui">
                <span className="text-white/40 uppercase tracking-wider text-[10.5px]">Active Filters:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.08]">
                  {localICP.industries.length} Industries
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.08]">
                  {localICP.geography.length} Regions
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.08]">
                  {localICP.companySize.length} Sizes
                </span>
              </div>

              <button
                type="button"
                onClick={handleDiscoverLeads}
                disabled={isSearchingLeads || isApproving}
                className="h-[44px] px-6 rounded-full bg-white text-black text-xs sm:text-sm font-ui font-medium hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSearchingLeads ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                    <span>Searching data source…</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-black" />
                    <span>Discover Target Leads</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Area */}
            {hasSearched && (
              <div className="space-y-4 pt-2">
                {discoveryError && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-ui flex items-center justify-between gap-3">
                    <span>{discoveryError}</span>
                    <button
                      type="button"
                      onClick={handleDiscoverLeads}
                      className="px-3 py-1 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {discoveredLeads && discoveredLeads.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-ui text-white/50 px-1">
                      <span>Found {discoveredLeads.length} matching prospect accounts</span>
                      <span>Verified from real workspace database</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discoveredLeads.map((lead) => {
                        const isSaved = savedLeadIds.includes(lead.id);
                        const isSaving = savingLeadId === lead.id;

                        return (
                          <div
                            key={lead.id}
                            className="p-5 rounded-2xl bg-white/[0.035] border border-white/[0.10] hover:border-white/[0.20] transition-all space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="font-ui font-medium text-sm sm:text-base text-white">
                                  {lead.name}
                                </h4>
                                {lead.domain && (
                                  <a
                                    href={`https://${lead.domain}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-ui text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                                  >
                                    <span>{lead.domain}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>

                              <span className="px-2 py-0.5 rounded-full text-[10px] font-ui bg-white/[0.06] text-white/70 border border-white/[0.08] shrink-0">
                                {lead.source}
                              </span>
                            </div>

                            <p className="text-xs text-white/70 font-light line-clamp-2 leading-relaxed">
                              {lead.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-ui text-white/60">
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-white/40" />
                                <span>{lead.industry}</span>
                              </span>
                              <span className="text-white/20">•</span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-white/40" />
                                <span>{lead.location}</span>
                              </span>
                              <span className="text-white/20">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-3 h-3 text-white/40" />
                                <span>{lead.size}</span>
                              </span>
                            </div>

                            {lead.contact && (
                              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs font-ui">
                                <div className="space-y-0.5">
                                  <span className="text-white/90 font-medium block">
                                    {lead.contact.name}
                                  </span>
                                  <span className="text-white/50 text-[11px] block">
                                    {lead.contact.title}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSaveLead(lead)}
                                  disabled={isSaved || isSaving}
                                  className={`px-3 py-1 rounded-full text-xs font-ui transition-all flex items-center gap-1 ${
                                    isSaved
                                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-white text-black font-medium hover:bg-white/90'
                                  }`}
                                >
                                  {isSaving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : isSaved ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Saved to Pipeline</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Save to Pipeline</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : !isSearchingLeads ? (
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-3">
                    <Building2 className="w-8 h-8 text-white/30 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="font-ui font-medium text-sm text-white">
                        No leads found in workspace database for these filters
                      </h4>
                      <p className="text-xs text-white/50 font-light max-w-md mx-auto leading-relaxed">
                        No accounts in your current workspace match all selected criteria. Broaden your industry/geography filters or connect an external data provider.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>

          {/* PRIMARY ACTION & FOOTER AREA */}
          <motion.div
            variants={entranceVariant}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.52 }}
            className="pt-10 flex flex-col items-center gap-4"
          >
            {/* Sequential Approval Indicator Transition */}
            <AnimatePresence>
              {isApproving && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 text-xs font-ui text-white"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Persisting confirmed ICP to database &amp; finalizing setup…</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Key CTA: Large White Pill Button: Approve ICP → */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving || isSearchingLeads}
                className="w-full sm:w-auto h-[52px] sm:h-[54px] px-10 rounded-full bg-white text-black font-ui font-medium text-sm sm:text-base hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 disabled:opacity-60"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Finalizing Setup…</span>
                  </>
                ) : (
                  <>
                    <span>Approve ICP &amp; Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>

            {/* Secondary Controls: Start over & Regenerate with AI */}
            <div className="flex items-center gap-6 pt-1 text-xs font-ui">
              <button
                type="button"
                onClick={reopenOnboarding}
                disabled={isApproving}
                className="text-white/40 hover:text-white/75 transition-colors"
              >
                Start over
              </button>

              <span className="text-white/20">•</span>

              <button
                type="button"
                onClick={handleTriggerRegenerate}
                disabled={isApproving || isRegenerating}
                className="text-white/40 hover:text-white/75 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRegenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
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
          transition={{ delay: 0.58 }}
          className="w-full flex items-center justify-between text-[11px] text-white/30 font-ui pt-6 border-t border-white/[0.04]"
        >
          <span>LeadForge Intelligence Engine</span>
          <span>Adaptive Signal Calibration</span>
        </motion.footer>
      </div>
    </div>
  );
};
