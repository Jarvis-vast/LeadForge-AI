import React from 'react';

interface ResearchPageHeaderProps {
  kicker?: string;
  headline?: string;
  supportingCopy?: string;
}

export const ResearchPageHeader: React.FC<ResearchPageHeaderProps> = ({
  kicker = 'ACCOUNT RESEARCH',
  headline = 'What did we find?',
  supportingCopy = 'LeadForge reviewed the available company, market, hiring, product, and activity signals to understand whether this account deserves attention.',
}) => {
  return (
    <div className="space-y-2 pt-2">
      <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 block">
        {kicker}
      </span>
      <h1 className="font-editorial italic text-4xl sm:text-5xl lg:text-[56px] text-white tracking-tight leading-[1.08]">
        {headline}
      </h1>
      <p className="font-ui text-sm sm:text-base text-white/70 font-light max-w-3xl leading-relaxed">
        {supportingCopy}
      </p>
    </div>
  );
};
