import React, { useState } from 'react';
import { useLeadForge } from '../context/LeadForgeContext';
import {
  UploadCloud,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
} from 'lucide-react';

export const CSVImportModal: React.FC = () => {
  const { importModalOpen, setImportModalOpen, importAccountsFromData, setActiveTab } = useLeadForge();

  const [rawInput, setRawInput] = useState('');
  const [report, setReport] = useState<{ imported: number; duplicates: number } | null>(null);

  if (!importModalOpen) return null;

  const sampleCSV = `Company,Domain,Industry,Size,Contact Name,Contact Email
Stripe Scale,stripescale.io,Fintech & Payments,65 employees,Sarah Jenkins,sjenkins@stripescale.io
Vectra Health,vectrahealth.ai,HealthTech & EHR,45 employees,David Wu,dwu@vectrahealth.ai
AeroLogistics,aerologistics.co,Supply Chain & Cloud,120 employees,Elena Rostova,erostova@aerologistics.co
Prism Retail,prismretail.com,Omnichannel Ecom,80 employees,Marcus Vance,marcus@prismretail.com`;

  const handlePasteSample = () => {
    setRawInput(sampleCSV);
  };

  const handleProcessImport = () => {
    if (!rawInput.trim()) return;

    const lines = rawInput.trim().split('\n');
    const newAccounts: any[] = [];
    const newContacts: any[] = [];

    // Parse header and rows
    const startIndex = lines[0].toLowerCase().includes('company') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by comma or tab
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');

      const name = parts[0]?.trim() || 'New Company';
      const domain = parts[1]?.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const industry = parts[2]?.trim() || 'B2B Software';
      const size = parts[3]?.trim() || '20–100 employees';
      const contactName = parts[4]?.trim() || 'Key Decision Maker';
      const email = parts[5]?.trim() || `contact@${domain}`;

      newAccounts.push({
        name,
        domain,
        industry,
        size,
        location: 'United States',
        description: `Imported prospective client in ${industry}.`,
        techStack: ['Next.js', 'PostgreSQL', 'Tailwind'],
      });

      newContacts.push({
        name: contactName,
        title: 'VP of Product / Growth',
        email,
      });
    }

    const result = importAccountsFromData(newAccounts, newContacts);
    setReport(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl glass-panel-elevated border border-white/[0.15] shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-white/10 text-white">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial italic text-2xl sm:text-3xl text-white">
                Import Prospect Accounts & Leads
              </h2>
              <p className="text-xs font-ui text-white/50 mt-0.5">
                Paste CSV or raw spreadsheet rows. Auto-deduplicates by normalized domain.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setImportModalOpen(false);
              setReport(null);
            }}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {report ? (
          /* Report Screen */
          <div className="py-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-editorial italic text-2xl text-white">
              Import Completed Successfully
            </h3>
            <p className="text-xs font-ui text-white/60 max-w-md mx-auto">
              Added <strong className="text-white font-medium">{report.imported}</strong> new accounts into the active Opportunity queue. Skipped <strong className="text-white font-medium">{report.duplicates}</strong> duplicate domains to protect data hygiene.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setReport(null);
                  setActiveTab('opportunities');
                }}
                className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs font-ui hover:bg-white/90 transition-all inline-flex items-center gap-1.5"
              >
                <span>View Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Input Screen */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-ui text-white/60 uppercase tracking-wider font-semibold">
                CSV or Tab-Delimited Data
              </label>
              <button
                onClick={handlePasteSample}
                className="text-xs font-ui text-white/60 hover:text-white underline underline-offset-4 inline-flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Load Sample Agency Data</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Company, Domain, Industry, Size, Contact Name, Contact Email&#10;Acme, acme.com, SaaS, 50, Jane Doe, jane@acme.com"
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono text-white placeholder-white/25 focus:outline-none focus:border-white/30 leading-relaxed transition-all resize-none"
            />

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] font-ui text-white/50 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-white/40" />
              <span>
                Standard format: Company, Domain, Industry, Size, Contact Name, Email. Domains are normalized (http/https removed).
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-full glass-pill text-xs font-ui text-white/60 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessImport}
                disabled={!rawInput.trim()}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-ui font-semibold shadow-md transition-all disabled:opacity-50"
              >
                Run Ingestion & Deduplicate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
