import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  Users,
  Mail,
  Linkedin,
  Search,
  Send,
  ExternalLink,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    contacts,
    accounts,
    opportunities,
    openOpportunityDetail,
    setSelectedOpportunityId,
    setOutreachModalOpen,
  } = useLeadForge();

  const [search, setSearch] = useState('');

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
                      {opp ? (
                        <button
                          onClick={() => {
                            setSelectedOpportunityId(opp.id);
                            setOutreachModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Send className="w-3 h-3" />
                          <span>Outreach</span>
                        </button>
                      ) : (
                        <span className="text-white/30 text-[11px]">No active opp</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
