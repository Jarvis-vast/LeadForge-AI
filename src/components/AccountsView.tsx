import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Building2,
  ExternalLink,
  Search,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    opportunities,
    openOpportunityDetail,
    runResearchOnAccount,
    setImportModalOpen,
    isAIWorking,
  } = useLeadForge();

  const [search, setSearch] = useState('');

  const filteredAccounts = accounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.domain.toLowerCase().includes(q) ||
      acc.industry.toLowerCase().includes(q) ||
      acc.techStack.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Account Registry</span>
          </div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Companies & Organizations
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1">
            Accounts under surveillance for hiring velocity, technical stack modernizations, and executive triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Import Accounts CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter accounts by name, domain, stack..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
          />
        </div>

        <div className="text-xs font-ui text-white/40">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const opp = opportunities.find((o) => o.accountId === acc.id);

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/20 transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-ui font-semibold text-base text-white group-hover:text-white">
                      {acc.name}
                    </h3>
                    <a
                      href={`https://${acc.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-ui text-white/40 hover:text-white inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>{acc.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {opp && (
                    <div
                      onClick={() => openOpportunityDetail(opp.id)}
                      className="text-right cursor-pointer shrink-0"
                    >
                      <span className="font-editorial italic text-2xl text-white">
                        {opp.score}
                      </span>
                      <span className="text-[8px] text-white/40 font-ui block -mt-1">SCORE</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-xs font-ui text-white/60">
                  <div className="flex justify-between">
                    <span className="text-white/40">Industry:</span>
                    <span className="text-white/80">{acc.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Headcount:</span>
                    <span className="text-white/80">{acc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Location:</span>
                    <span className="text-white/80">{acc.location}</span>
                  </div>
                </div>

                {/* Tech Stack tags */}
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5 font-ui">
                    Detected Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {acc.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] font-ui text-white/70"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-ui">
                <button
                  onClick={() => opp && runResearchOnAccount(opp.id)}
                  disabled={isAIWorking}
                  className="text-white/50 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Research</span>
                </button>

                {opp ? (
                  <button
                    onClick={() => openOpportunityDetail(opp.id)}
                    className="px-3 py-1 rounded-full glass-pill hover:bg-white/10 text-white flex items-center gap-1 transition-all"
                  >
                    <span>View Pursuit</span>
                    <Target className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-white/30 text-[11px]">Unlinked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
