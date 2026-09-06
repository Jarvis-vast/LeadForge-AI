import React from 'react';
import {
  Briefcase,
  FileText,
  Share2,
  Globe,
  Code2,
  Database,
  Newspaper,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { ResearchSourceItem } from '../../types';

interface SourcePanelProps {
  sources?: ResearchSourceItem[];
  onOpenCoverageModal: () => void;
}

const defaultSources: ResearchSourceItem[] = [
  {
    id: 'src-01',
    name: 'Acme Careers',
    domain: 'acme.io/careers',
    url: 'https://acme.io/careers',
    freshness: '2 days ago',
    type: 'CAREERS',
    quality: 'PRIMARY',
    lastCrawled: 'Today at 08:30 AM',
  },
  {
    id: 'src-02',
    name: 'Acme Blog',
    domain: 'acme.io/blog',
    url: 'https://acme.io/blog',
    freshness: '6 days ago',
    type: 'BLOG',
    quality: 'PRIMARY',
    lastCrawled: 'Yesterday at 04:12 PM',
  },
  {
    id: 'src-03',
    name: 'LinkedIn',
    domain: 'company profile',
    url: 'https://linkedin.com/company/acme-io',
    freshness: '1 week ago',
    type: 'SOCIAL',
    quality: 'FIRST_PARTY',
    lastCrawled: 'Aug 30, 2026',
  },
  {
    id: 'src-04',
    name: 'Company Website',
    domain: 'acme.io',
    url: 'https://acme.io',
    freshness: 'Today',
    type: 'WEBSITE',
    quality: 'PRIMARY',
    lastCrawled: 'Today at 10:15 AM',
  },
  {
    id: 'src-05',
    name: 'GitHub Releases',
    domain: 'github.com/acme',
    url: 'https://github.com/novasystems',
    freshness: '10 days ago',
    type: 'GITHUB',
    quality: 'FIRST_PARTY',
    lastCrawled: 'Aug 26, 2026',
  },
  {
    id: 'src-06',
    name: 'Public Registry / Crunchbase',
    domain: 'crunchbase.com/org/acme',
    url: 'https://crunchbase.com',
    freshness: '2 weeks ago',
    type: 'REGISTRY',
    quality: 'PUBLIC_REGISTRY',
    lastCrawled: 'Aug 22, 2026',
  },
  {
    id: 'src-07',
    name: 'Google News Syndicate',
    domain: 'news.google.com',
    url: 'https://news.google.com',
    freshness: 'Yesterday',
    type: 'NEWS',
    quality: 'CORROBORATING',
    lastCrawled: 'Yesterday at 11:20 PM',
  },
];

export const SourcePanel: React.FC<SourcePanelProps> = ({
  sources = defaultSources,
  onOpenCoverageModal,
}) => {
  const getSourceIcon = (type: ResearchSourceItem['type']) => {
    switch (type) {
      case 'CAREERS':
        return <Briefcase className="w-3.5 h-3.5 text-white/70" />;
      case 'BLOG':
        return <FileText className="w-3.5 h-3.5 text-white/70" />;
      case 'SOCIAL':
        return <Share2 className="w-3.5 h-3.5 text-white/70" />;
      case 'WEBSITE':
        return <Globe className="w-3.5 h-3.5 text-white/70" />;
      case 'GITHUB':
        return <Code2 className="w-3.5 h-3.5 text-white/70" />;
      case 'REGISTRY':
        return <Database className="w-3.5 h-3.5 text-white/70" />;
      case 'NEWS':
        return <Newspaper className="w-3.5 h-3.5 text-white/70" />;
    }
  };

  return (
    <div className="space-y-4 font-ui">
      {/* 14. Heading & Subtitle */}
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="text-lg font-semibold text-white tracking-tight">
          Sources
        </h3>
        <p className="text-xs text-white/60 font-light">
          {sources.length} sources reviewed
        </p>
      </div>

      {/* Compact Liquid-Glass Rows */}
      <div className="space-y-2">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-3 rounded-xl liquid-glass border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/[0.06] shrink-0">
                {getSourceIcon(src.type)}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold text-white truncate group-hover:text-white transition-colors">
                  {src.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                  <span className="truncate max-w-[120px]">{src.domain}</span>
                  <span>·</span>
                  <span>{src.freshness}</span>
                </div>
              </div>
            </div>

            <a
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Open source"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* 15. Source Quality Box */}
      <div className="p-4 rounded-xl liquid-glass border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 block">
            SOURCE QUALITY
          </span>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>High</span>
          </div>
        </div>

        <p className="text-xs text-white/70 font-light leading-relaxed">
          Most conclusions are supported by recent primary or first-party sources.
        </p>

        <button
          onClick={onOpenCoverageModal}
          className="w-full text-center py-2 px-3 rounded-lg liquid-glass border border-white/10 hover:border-white/20 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
        >
          View source coverage
        </button>
      </div>
    </div>
  );
};
