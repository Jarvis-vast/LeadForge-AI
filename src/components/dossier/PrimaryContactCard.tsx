import React, { useState } from 'react';
import { Contact, Opportunity, Account } from '../../types';
import {
  Mail,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  Send,
  ShieldCheck,
  Star,
  Sparkles,
  Phone,
  UserCheck,
} from 'lucide-react';

interface PrimaryContactCardProps {
  contact?: Contact | null;
  opportunity: Opportunity;
  account: Account;
  onSelectContactForOutreach?: (contact: Contact) => void;
}

export const PrimaryContactCard: React.FC<PrimaryContactCardProps> = ({
  contact,
  opportunity,
  account,
  onSelectContactForOutreach,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!contact?.email) return;
    navigator.clipboard.writeText(contact.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOutreachClick = () => {
    if (contact && onSelectContactForOutreach) {
      onSelectContactForOutreach(contact);
    } else {
      const el = document.getElementById('outreach-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Derive buyer role tag
  const getRoleAuthority = (title: string = '') => {
    const t = title.toLowerCase();
    if (t.includes('founder') || t.includes('ceo') || t.includes('co-founder')) {
      return 'Economic Buyer · Executive Sponsor';
    }
    if (t.includes('vp') || t.includes('head') || t.includes('director')) {
      return 'Decision Maker · Budget Authority';
    }
    return 'Key Stakeholder · Champion';
  };

  // Extract opportunity context for this contact
  const getOpportunityRelevance = () => {
    if (!contact) return '';
    const t = contact.title.toLowerCase();
    if (t.includes('founder') || t.includes('ceo')) {
      return `Direct sponsor for strategic growth. Best suited for founder-to-founder outreach regarding ${account.name}'s latest expansion.`;
    }
    if (t.includes('market') || t.includes('growth')) {
      return `Functional lead for demand generation and customer acquisition tied to the recent team expansion.`;
    }
    if (t.includes('tech') || t.includes('cto') || t.includes('engineer')) {
      return `Technical authority evaluating infrastructure and tooling efficiency for the enterprise push.`;
    }
    return `Identified target stakeholder for ${account.name}'s current priority initiatives.`;
  };

  if (!contact) {
    return (
      <div className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-3 font-ui text-white">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            PRIMARY CONTACT
          </span>
          <span className="text-[11px] font-mono text-white/40">Unassigned</span>
        </div>
        <div className="py-2 text-center space-y-2">
          <p className="text-xs text-white/60 font-light">
            No primary decision maker assigned for {account.name} yet.
          </p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-white/50 bg-white/[0.04] border border-white/10">
            Scanning company roster…
          </span>
        </div>
      </div>
    );
  }

  const firstName = contact.name.split(' ')[0] || contact.name;
  const isCorporateEmail =
    contact.email &&
    account.domain &&
    contact.email.toLowerCase().includes(account.domain.toLowerCase().replace(/^www\./, ''));

  return (
    <div
      id="primary-contact-card"
      className="liquid-glass rounded-2xl p-5 sm:p-6 border border-white/[0.08] hover:border-white/[0.18] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/50 transition-all duration-200 ease-out space-y-4 font-ui text-white"
    >
      {/* Header with Kicker & Status Badge */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            PRIMARY CONTACT
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/90 border border-white/15 inline-flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-current text-amber-300" />
          <span>Recommended Target</span>
        </span>
      </div>

      {/* Contact Profile Row */}
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-full bg-white text-black font-editorial italic text-lg font-semibold flex items-center justify-center shrink-0 shadow-md">
          {contact.name.charAt(0)}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-ui font-semibold text-sm sm:text-base text-white truncate">
              {contact.name}
            </h4>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Verified Decision Maker" />
          </div>
          <p className="text-xs text-white/70 font-light truncate">
            {contact.title}
          </p>
          <span className="inline-block text-[10px] font-mono text-white/40 tracking-tight">
            {getRoleAuthority(contact.title)}
          </span>
        </div>
      </div>

      {/* Contact Channels Grid */}
      <div className="space-y-2 pt-1 text-xs">
        {/* Email Row */}
        <div className="p-2.5 rounded-xl liquid-glass border border-white/[0.06] flex items-center justify-between gap-2 group hover:border-white/15 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/[0.06] text-white/70">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase text-white/40 block leading-tight">
                Direct Email
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="text-xs text-white font-medium hover:underline truncate block"
                title={`Send email to ${contact.email}`}
              >
                {contact.email}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isCorporateEmail && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                Verified
              </span>
            )}
            <button
              onClick={handleCopyEmail}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Copy email address"
            >
              {copiedEmail ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* LinkedIn & Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {contact.linkedinUrl ? (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl liquid-glass border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03] transition-all flex items-center justify-between gap-2 text-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#0077B5]/20 text-[#0077B5] group-hover:text-white transition-colors">
                  <Linkedin className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase text-white/40 block leading-tight">
                    Social
                  </span>
                  <span className="text-white/80 font-medium truncate block text-[11px]">
                    LinkedIn Profile
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white transition-colors shrink-0" />
            </a>
          ) : (
            <div className="p-2.5 rounded-xl liquid-glass border border-white/[0.04] text-white/40 flex items-center gap-2 text-xs">
              <Linkedin className="w-3 h-3 text-white/30" />
              <span className="text-[11px] font-mono">LinkedIn: Not found</span>
            </div>
          )}

          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="p-2.5 rounded-xl liquid-glass border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.03] transition-all flex items-center justify-between gap-2 text-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-white/[0.06] text-white/70">
                  <Phone className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono uppercase text-white/40 block leading-tight">
                    Phone
                  </span>
                  <span className="text-white/80 font-medium truncate block text-[11px]">
                    {contact.phone}
                  </span>
                </div>
              </div>
            </a>
          ) : (
            <div className="p-2.5 rounded-xl liquid-glass border border-white/[0.04] text-white/40 flex items-center gap-2 text-xs">
              <Phone className="w-3 h-3 text-white/30" />
              <span className="text-[11px] font-mono">Direct phone: n/a</span>
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Alignment / Why this contact for this opportunity */}
      <div className="p-3 rounded-xl liquid-glass border border-white/[0.06] bg-white/[0.02] space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-mono uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Why contact for this deal</span>
        </div>
        <p className="text-white/75 font-light text-[11px] leading-relaxed">
          {getOpportunityRelevance()}
        </p>
        <div className="pt-0.5 flex items-center gap-1.5 text-[10px] font-mono text-white/40">
          <ShieldCheck className="w-3 h-3 text-emerald-400/80" />
          <span>Authority confirmed from {account.domain} & public filings</span>
        </div>
      </div>

      {/* Quick Outreach Action */}
      <button
        onClick={handleOutreachClick}
        className="w-full py-2 px-3.5 rounded-full bg-white text-black text-xs font-ui font-semibold hover:bg-white/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Prepare outreach to {firstName}</span>
      </button>
    </div>
  );
};
