'use client';

import Link from 'next/link';
import { proposals, type ProposalStatus } from '@/data/proposals';

const STATUS_COLORS: Record<ProposalStatus, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Accepted: 'bg-emerald-100 text-emerald-700',
  Expired: 'bg-red-100 text-red-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function ProposalsListPage() {
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
          <p className="text-sm text-gray-500 mt-1">All quotes and proposals</p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Proposal
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Customer</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Service</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">System Size</th>
              <th className="text-right px-6 py-3 font-semibold text-gray-600">Value</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Date Sent</th>
              <th className="text-left px-6 py-3 font-semibold text-gray-600">Rep</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <Link key={p.id} href={`/proposals/${p.id}`} className="contents">
                <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.customerName}</td>
                  <td className="px-6 py-4 text-gray-600">{p.serviceType}</td>
                  <td className="px-6 py-4 text-gray-600">{p.systemSize}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(p.proposalValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.dateSent || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.rep}</td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {proposals.map((p) => (
          <Link key={p.id} href={`/proposals/${p.id}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{p.customerName}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{p.serviceType}</span>
                <span>&bull;</span>
                <span>{p.systemSize}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{p.rep}</span>
                <span className="font-semibold text-gray-900">{formatCurrency(p.proposalValue)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
