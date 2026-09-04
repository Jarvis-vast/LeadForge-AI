import React from 'react';
import { Contact } from '../../types';
import { Mail, Linkedin, User, Sparkles, Star } from 'lucide-react';

interface PeopleCardProps {
  contacts: Contact[];
  primaryContactId: string;
  onSelectContactForOutreach: (contact: Contact) => void;
}

export const PeopleCard: React.FC<PeopleCardProps> = ({
  contacts,
  primaryContactId,
  onSelectContactForOutreach,
}) => {
  return (
    <div className="liquid-glass rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block">
            PEOPLE
          </span>
          <h3 className="font-editorial italic text-xl sm:text-2xl text-white mt-0.5">
            Likely Decision Makers
          </h3>
        </div>
        <span className="text-xs font-ui text-white/50">
          {contacts.length} verified contacts
        </span>
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => {
          const isPrimary = contact.id === primaryContactId || contact.isPrimary;

          return (
            <div
              key={contact.id}
              className={`p-4 rounded-xl border transition-all ${
                isPrimary
                  ? 'liquid-glass-strong border-white/20 bg-white/[0.03]'
                  : 'liquid-glass border-white/[0.06] hover:border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-editorial italic text-base shrink-0 ${
                      isPrimary
                        ? 'bg-white text-black font-semibold'
                        : 'bg-white/10 text-white/80'
                    }`}
                  >
                    {contact.name.charAt(0)}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-ui text-sm font-semibold text-white">
                        {contact.name}
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/15 text-white border border-white/20 inline-flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Recommended Contact</span>
                        </span>
                      )}
                    </div>
                    <p className="font-ui text-xs text-white/60">{contact.title}</p>

                    {isPrimary && (
                      <p className="font-ui text-[11px] text-white/75 pt-1">
                        <span className="text-white/40 font-mono">Why:</span> Direct budget ownership + strong role relevance for strategic growth.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {contact.linkedinUrl && (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg liquid-glass border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="View LinkedIn Profile"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <a
                    href={`mailto:${contact.email}`}
                    className="p-2 rounded-lg liquid-glass border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title={`Email ${contact.email}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onSelectContactForOutreach(contact)}
                    className="px-3 py-1.5 rounded-lg text-xs font-ui bg-white/10 hover:bg-white text-white hover:text-black transition-all border border-white/15 cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Outreach</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
