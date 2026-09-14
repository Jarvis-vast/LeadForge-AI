import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Users,
  Mail,
  Linkedin,
  Search,
  Send,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    accounts,
    opportunities,
    openOpportunityDetail,
    setSelectedOpportunityId,
    setOutreachModalOpen,
    createContact,
    updateContact,
    deleteContact,
  } = useLeadForge();

  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountId: '',
    name: '',
    title: '',
    email: '',
    linkedinUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredContacts = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const acc = accounts.find((a) => a.id === c.accountId);
    return (
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      acc?.name.toLowerCase().includes(q)
    );
  });

  const handleOpenCreate = () => {
    setFormData({
      accountId: accounts[0]?.id || '',
      name: '',
      title: '',
      email: '',
      linkedinUrl: '',
    });
    setEditingId(null);
    setModalMode('create');
  };

  const handleOpenEdit = (cnt: any) => {
    setFormData({
      accountId: cnt.accountId || (accounts[0]?.id || ''),
      name: cnt.name,
      title: cnt.title || '',
      email: cnt.email || '',
      linkedinUrl: cnt.linkedinUrl || '',
    });
    setEditingId(cnt.id);
    setModalMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.accountId) return;

    setSubmitting(true);
    try {
      const payload = {
        accountId: formData.accountId,
        name: formData.name.trim(),
        title: formData.title.trim(),
        email: formData.email.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
      };

      if (modalMode === 'create') {
        await createContact(payload);
      } else if (modalMode === 'edit' && editingId) {
        await updateContact(editingId, payload);
      }
      setModalMode(null);
    } catch (err) {
      console.error('Failed to save contact:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete contact "${name}"?`)) {
      try {
        await deleteContact(id);
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2 text-white/50 text-xs font-ui tracking-widest uppercase">
            <Users className="w-3.5 h-3.5" />
            <span>Executive & Stakeholder Contacts</span>
          </div>
          <h1 className="font-editorial italic text-3xl sm:text-4xl text-white">
            Decision Makers & Champions
          </h1>
          <p className="text-sm font-ui text-white/60 font-light mt-1">
            Target buyers mapped to high-intent opportunities. Peer-to-peer relationships with verified reachability.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-sm">
        <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, role, company..."
          className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs font-ui text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
        />
      </div>

      {/* Contacts Table */}
      <div className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-ui">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-ui uppercase tracking-wider text-white/40">
                <th className="py-3.5 px-5 font-semibold">Contact</th>
                <th className="py-3.5 px-4 font-semibold">Company</th>
                <th className="py-3.5 px-4 font-semibold">Reachability</th>
                <th className="py-3.5 px-4 font-semibold">Pursuit Score</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredContacts.map((cnt) => {
                const acc = accounts.find((a) => a.id === cnt.accountId);
                const opp = opportunities.find((o) => o.primaryContactId === cnt.id || o.accountId === acc?.id);

                return (
                  <tr key={cnt.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-sm text-white">{cnt.name}</div>
                      <div className="text-white/50 text-[11px] mt-0.5">{cnt.title}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-white/90 font-medium">{acc?.name}</div>
                      <div className="text-white/40 text-[11px]">{acc?.domain}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <a
                          href={`mailto:${cnt.email}`}
                          className="flex items-center gap-1 text-white/70 hover:text-white"
                        >
                          <Mail className="w-3 h-3 text-white/40" />
                          <span>{cnt.email}</span>
                        </a>
                        {cnt.linkedinUrl && (
                          <a
                            href={cnt.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-white/40 hover:text-white"
                          >
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {opp ? (
                        <div
                          onClick={() => openOpportunityDetail(opp.id)}
                          className="cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span className="font-editorial italic text-xl text-white">{opp.score}</span>
                          <span className="text-[10px] text-white/40">/ 100</span>
                        </div>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {opp ? (
                          <button
                            onClick={() => {
                              setSelectedOpportunityId(opp.id);
                              setOutreachModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Send className="w-3 h-3" />
                            <span>Outreach</span>
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleOpenEdit(cnt)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Edit contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cnt.id, cnt.name)}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/20 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-ui font-semibold text-lg text-white">
                {modalMode === 'create' ? 'Create Contact' : 'Edit Contact'}
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
                <label className="block text-white/60 mb-1">Company Account *</label>
                <select
                  required
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-white/10 text-white focus:outline-none focus:border-white/30"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Job Title / Role</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chief Technology Officer"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. jane@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
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
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Contact' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
