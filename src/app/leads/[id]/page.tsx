'use client';

import { use } from 'react';
import Link from 'next/link';
import { getLeadById, PIPELINE_STAGES, type PipelineStage } from '@/data/leads';

const STAGE_INDEX: Record<PipelineStage, number> = {
  'New Lead': 0,
  'Consultation Scheduled': 1,
  'Site Visit Complete': 2,
  'Proposal Sent': 3,
  'Financing': 4,
  'Closed Won': 5,
  'Closed Lost': 5,
};

const SERVICE_COLORS: Record<string, string> = {
  Solar: 'bg-amber-100 text-amber-800',
  Plumbing: 'bg-blue-100 text-blue-800',
  Electrical: 'bg-purple-100 text-purple-800',
  Multi: 'bg-emerald-100 text-emerald-800',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lead = getLeadById(id);

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Lead Not Found</h1>
        <Link href="/" className="text-teal-600 hover:underline text-sm">Back to Pipeline</Link>
      </div>
    );
  }

  const currentStageIdx = STAGE_INDEX[lead.stage];
  const progressStages = PIPELINE_STAGES.filter((s) => s !== 'Closed Lost');

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Pipeline
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{lead.customerName}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SERVICE_COLORS[lead.serviceType]}`}>
              {lead.serviceType}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{lead.id} &bull; Created {lead.createdAt}</p>
        </div>
        {lead.proposalId && (
          <Link
            href={`/proposals/${lead.proposalId}`}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            View Proposal
          </Link>
        )}
      </div>

      {/* Stage Progress Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Progress</h2>
        <div className="flex items-center gap-1">
          {progressStages.map((stage, i) => {
            const isComplete = i < currentStageIdx;
            const isCurrent = i === currentStageIdx;
            const isLost = lead.stage === 'Closed Lost';
            return (
              <div key={stage} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div
                    className={`w-full h-2 rounded-full ${
                      isComplete
                        ? 'bg-teal-500'
                        : isCurrent
                        ? isLost
                          ? 'bg-red-400'
                          : 'bg-teal-500'
                        : 'bg-gray-200'
                    }`}
                  />
                </div>
                <span className={`text-[10px] mt-2 text-center leading-tight ${
                  isCurrent ? (isLost ? 'text-red-600 font-semibold' : 'text-teal-700 font-semibold') : isComplete ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
        {lead.stage === 'Closed Lost' && (
          <div className="mt-3 text-xs text-red-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            This lead was marked as Closed Lost
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Column — Contact & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h2>
            <dl className="space-y-3 text-sm">
              <DetailRow label="Email" value={lead.email} />
              <DetailRow label="Phone" value={lead.phone} />
              <DetailRow label="Address" value={`${lead.address}, ${lead.city}, CA`} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Lead Details</h2>
            <dl className="space-y-3 text-sm">
              <DetailRow label="Service Type" value={lead.serviceType} />
              <DetailRow label="Lead Source" value={lead.leadSource} />
              <DetailRow label="Assigned Rep" value={lead.assignedRep} />
              <DetailRow label="Est. Value" value={formatCurrency(lead.estimatedValue)} />
              <DetailRow label="Stage" value={lead.stage} />
              {lead.daysInStage > 0 && <DetailRow label="Days in Stage" value={`${lead.daysInStage}`} />}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Notes</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{lead.notes}</p>
          </div>
        </div>

        {/* Right Column — Activity & Next Action */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Next Action</h2>
            <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-lg p-4">
              <svg className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-sm text-teal-800 font-medium">{lead.nextAction}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity Timeline</h2>
            <div className="space-y-0">
              {[...lead.activities].reverse().map((activity, i) => (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-teal-500' : 'bg-gray-300'}`} />
                    {i < lead.activities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-900 font-medium text-right">{value}</dd>
    </div>
  );
}
