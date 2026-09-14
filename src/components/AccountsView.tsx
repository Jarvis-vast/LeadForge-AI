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
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    opportunities,
    openOpportunityDetail,
    runResearchOnAccount,
    setImportModalOpen,
    isAIWorking,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useLeadForge();

  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size: '10-50',
    location: '',
    description: '',
    techStack: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredAccounts = accounts.filter((acc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      acc.name.toLowerCase().includes(q) ||
      acc.domain.toLowerCase().includes(q) ||
      acc.industry.toLowerCase().includes(q) ||
      (acc.techStack || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      domain: '',
      industry: 'B2B SaaS',
      size: '50-200',
      location: 'San Francisco, CA',
      description: '',
      techStack: 'TypeScript, React, PostgreSQL',
    });
    setEditingId(null);
    setModalMode('create');
  };

  const handleOpenEdit = (acc: any) => {
    setFormData({
      name: acc.name,
      domain: acc.domain,
      industry: acc.industry || '',
      size: acc.size || '10-50',
      location: acc.location || '',
      description: acc.description || '',
      techStack: Array.isArray(acc.techStack) ? acc.techStack.join(', ') : '',
    });
    setEditingId(acc.id);
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.domain.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        domain: formData.domain.trim(),
        industry: formData.industry.trim(),
        size: formData.size.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        techStack: formData.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (modalMode === 'create') {
        await createAccount(payload);
      } else if (modalMode === 'edit' && editingId) {
        await updateAccount(editingId, payload);
      }
      setModalMode(null);
    } catch (err) {
      console.error('Failed to save account:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete account "${name}"?`)) {
      try {
        await deleteAccount(id);
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    }
  };

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
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2 rounded-full glass-pill hover:bg-white/10 text-white text-xs font-ui font-medium flex items-center gap-1.5 transition-all"
          >
            <span>Import CSV</span>
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

                  <div className="flex items-center gap-2">
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
                    {(acc.techStack || []).map((tech) => (
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => opp && runResearchOnAccount(opp.id)}
                    disabled={isAIWorking}
                    className="text-white/50 hover:text-white flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Research</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="text-white/40 hover:text-white transition-colors"
                    title="Edit account"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id, acc.name)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

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

      {/* Account Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-ui font-semibold text-lg text-white">
                {modalMode === 'create' ? 'Create Target Account' : 'Edit Account'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-ui text-xs">
              <div>
                <label className="block text-white/60 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme SaaS"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Domain *</label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="e.g. acmesaas.io"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g. B2B SaaS"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Headcount</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. 50-200"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="e.g. TypeScript, React, Next.js"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-full glass-pill text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
