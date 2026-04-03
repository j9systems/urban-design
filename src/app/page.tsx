'use client';

import { useState } from 'react';
import Link from 'next/link';
import { leads, PIPELINE_STAGES, type ServiceType, type PipelineStage } from '@/data/leads';

const SERVICE_COLORS: Record<ServiceType, string> = {
  Solar: 'bg-amber-100 text-amber-800',
  Plumbing: 'bg-blue-100 text-blue-800',
  Electrical: 'bg-purple-100 text-purple-800',
  Multi: 'bg-emerald-100 text-emerald-800',
};

const STAGE_COLORS: Record<string, string> = {
  'New Lead': 'border-t-sky-400',
  'Consultation Scheduled': 'border-t-indigo-400',
  'Site Visit Complete': 'border-t-violet-400',
  'Proposal Sent': 'border-t-amber-400',
  'Financing': 'border-t-teal-400',
  'Closed Won': 'border-t-emerald-500',
  'Closed Lost': 'border-t-red-400',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function PipelineDashboard() {
  const [serviceFilter, setServiceFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  const filteredLeads = leads.filter((l) => {
    if (serviceFilter !== 'All' && l.serviceType !== serviceFilter) return false;
    if (sourceFilter !== 'All' && l.leadSource !== sourceFilter) return false;
    return true;
  });

  const activeLeads = filteredLeads.filter((l) => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost');
  const proposalsSentThisMonth = filteredLeads.filter((l) => l.stage === 'Proposal Sent' || l.stage === 'Financing' || l.stage === 'Closed Won').length;
  const pipelineValue = activeLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const avgDaysToClose = 34;

  const visibleStages: PipelineStage[] = PIPELINE_STAGES;

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage your active leads</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Active Leads" value={activeLeads.length.toString()} icon="leads" />
        <SummaryCard label="Proposals This Month" value={proposalsSentThisMonth.toString()} icon="proposals" />
        <SummaryCard label="Pipeline Value" value={formatCurrency(pipelineValue)} icon="value" />
        <SummaryCard label="Avg. Days to Close" value={`${avgDaysToClose}`} icon="clock" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Service:</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>All</option>
            <option>Solar</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Multi</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Source:</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option>All</option>
            <option>Website Form</option>
            <option>Phone Call</option>
            <option>Yelp</option>
            <option>Referral</option>
            <option>Facebook Ad</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-500 self-center">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 pb-4">
        <div className="flex gap-4 min-w-max lg:min-w-0 lg:grid lg:grid-cols-7">
          {visibleStages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="w-64 lg:w-auto flex-shrink-0 lg:flex-shrink">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stage}</h3>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <div className={`bg-white rounded-xl border border-gray-200 ${STAGE_COLORS[stage]} border-t-[3px] p-4 hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">{lead.customerName}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SERVICE_COLORS[lead.serviceType]}`}>
                            {lead.serviceType}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {lead.leadSource}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{lead.city}</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(lead.estimatedValue)}</span>
                        </div>
                        {lead.daysInStage > 0 && (
                          <div className="mt-2 text-[10px] text-gray-400">
                            {lead.daysInStage} day{lead.daysInStage !== 1 ? 's' : ''} in stage
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                      No leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    leads: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    proposals: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    value: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-gray-400">{icons[icon]}</span>
      </div>
      <div className="text-xl lg:text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
