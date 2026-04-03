'use client';

import { use } from 'react';
import Link from 'next/link';
import { getProposalById, type ProposalStatus } from '@/data/proposals';

const STATUS_COLORS: Record<ProposalStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Expired: 'bg-red-100 text-red-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const proposal = getProposalById(id);

  if (!proposal) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Proposal Not Found</h1>
        <Link href="/proposals" className="text-teal-600 hover:underline text-sm">Back to Proposals</Link>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Link href="/proposals" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Proposals
        </Link>
      </div>

      {/* Proposal Document */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Proposal Header */}
        <div className="bg-slate-900 text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center font-bold text-lg">UD</div>
                <div>
                  <div className="font-bold">Urban Design Solar</div>
                  <div className="text-xs text-slate-400">Solar &bull; Plumbing &bull; Electrical</div>
                </div>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[proposal.status]}`}>
              {proposal.status}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Proposal for</p>
            <h1 className="text-2xl font-bold">{proposal.customerName}</h1>
            <p className="text-slate-300 mt-1">{proposal.address}</p>
          </div>
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div>
              <span className="text-slate-400">Proposal ID</span>
              <div className="font-semibold">{proposal.id}</div>
            </div>
            <div>
              <span className="text-slate-400">Date</span>
              <div className="font-semibold">{proposal.dateSent || 'Draft'}</div>
            </div>
            <div>
              <span className="text-slate-400">Prepared By</span>
              <div className="font-semibold">{proposal.rep}</div>
            </div>
            <div>
              <span className="text-slate-400">Service</span>
              <div className="font-semibold">{proposal.serviceType}</div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">System Overview</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{proposal.systemDescription}</p>
          {proposal.addOns && proposal.addOns.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {proposal.addOns.map((addon) => (
                <span key={addon} className="text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full">
                  {addon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Savings */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Investment & Savings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Investment" value={formatCurrency(proposal.proposalValue)} large />
            {proposal.systemSize !== 'N/A' && (
              <StatCard label="System Size" value={proposal.systemSize} />
            )}
            {proposal.estimatedAnnualSavings && (
              <StatCard label="Est. Annual Savings" value={formatCurrency(proposal.estimatedAnnualSavings)} />
            )}
            {proposal.federalTaxCredit && (
              <StatCard label="30% Federal Tax Credit" value={formatCurrency(proposal.federalTaxCredit)} highlight />
            )}
            {proposal.paybackPeriod && (
              <StatCard label="Payback Period" value={`${proposal.paybackPeriod} years`} />
            )}
            {proposal.twentyFiveYearSavings && (
              <StatCard label="25-Year Projected Savings" value={formatCurrency(proposal.twentyFiveYearSavings)} highlight />
            )}
          </div>
        </div>

        {/* Next Steps */}
        {proposal.nextSteps && proposal.nextSteps.length > 0 && (
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h2>
            <ol className="space-y-3">
              {proposal.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="p-8 bg-gray-50 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Proposal
          </button>
          <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
            Send to Customer
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, large, highlight }: { label: string; value: string; large?: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className={`font-bold ${large ? 'text-2xl text-gray-900' : 'text-lg text-gray-900'}`}>{value}</div>
    </div>
  );
}
