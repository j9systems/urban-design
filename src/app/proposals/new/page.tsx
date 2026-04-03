'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ProposalResult {
  systemSizeKw: number;
  totalCost: number;
  estimatedAnnualSavings: number;
  federalTaxCredit: number;
  paybackPeriod: number;
  twentyFiveYearSavings: number;
  monthlySavings: number;
}

function calculateProposal(
  monthlyBill: number,
  roofOrientation: string,
  sqFootage: number,
  addOns: string[]
): ProposalResult {
  // Orientation efficiency factor
  const orientationFactor: Record<string, number> = {
    South: 1.0,
    SW: 0.92,
    West: 0.82,
    Other: 0.75,
  };
  const factor = orientationFactor[roofOrientation] || 0.85;

  // System size based on monthly bill: ~1kW per $35/mo of bill
  const baseSizeKw = Math.round((monthlyBill / 35) * 10) / 10;

  // Cap by roof size (~15 sq ft per panel, ~0.4kW per panel)
  const maxKwByRoof = Math.floor(sqFootage / 150) * 0.4 * 10 / 10;
  const systemSizeKw = Math.min(baseSizeKw, maxKwByRoof > 0 ? maxKwByRoof : baseSizeKw);

  // Cost: ~$2.85/watt
  let totalCost = Math.round(systemSizeKw * 2850);

  // Add-ons
  if (addOns.includes('battery')) totalCost += 8500;
  if (addOns.includes('ev-charger')) totalCost += 2200;
  if (addOns.includes('generator')) totalCost += 4500;

  // Annual production: ~1,600 kWh per kW in NorCal, adjusted by orientation
  const annualProduction = systemSizeKw * 1600 * factor;
  const estimatedAnnualSavings = Math.round(annualProduction * 0.32); // $0.32/kWh PG&E avg

  // Tax credit
  const federalTaxCredit = Math.round(totalCost * 0.3);

  // Net cost after credit
  const netCost = totalCost - federalTaxCredit;

  // Payback period
  const paybackPeriod = Math.round((netCost / estimatedAnnualSavings) * 10) / 10;

  // 25-year savings (assuming 2% annual utility increase)
  let twentyFiveYearSavings = 0;
  for (let i = 0; i < 25; i++) {
    twentyFiveYearSavings += estimatedAnnualSavings * Math.pow(1.02, i);
  }
  twentyFiveYearSavings = Math.round(twentyFiveYearSavings);

  const monthlySavings = Math.round(estimatedAnnualSavings / 12);

  return {
    systemSizeKw,
    totalCost,
    estimatedAnnualSavings,
    federalTaxCredit,
    paybackPeriod,
    twentyFiveYearSavings,
    monthlySavings,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function ProposalBuilderPage() {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('Residential Solar');
  const [monthlyBill, setMonthlyBill] = useState('');
  const [roofOrientation, setRoofOrientation] = useState('South');
  const [sqFootage, setSqFootage] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [result, setResult] = useState<ProposalResult | null>(null);

  const toggleAddOn = (addon: string) => {
    setAddOns((prev) => (prev.includes(addon) ? prev.filter((a) => a !== addon) : [...prev, addon]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = parseFloat(monthlyBill) || 250;
    const sqft = parseFloat(sqFootage) || 2000;
    const r = calculateProposal(bill, roofOrientation, sqft, addOns);
    setResult(r);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/proposals" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Proposals
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Proposal</h1>
        <p className="text-sm text-gray-500 mt-1">Generate a quote for a new customer</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Customer Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John & Jane Smith"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 123 Main St, Chico, CA"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">System Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option>Residential Solar</option>
                <option>Commercial Solar</option>
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>Multi-Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Utility Bill ($) *</label>
              <input
                type="number"
                required
                min="50"
                max="5000"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g. 285"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roof Orientation</label>
              <select
                value={roofOrientation}
                onChange={(e) => setRoofOrientation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option>South</option>
                <option>SW</option>
                <option>West</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Sq. Footage</label>
              <input
                type="number"
                min="500"
                max="50000"
                value={sqFootage}
                onChange={(e) => setSqFootage(e.target.value)}
                placeholder="e.g. 2400"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Add-On Options</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { key: 'battery', label: 'Battery Storage', desc: 'Backup power + energy independence', price: '$8,500' },
              { key: 'ev-charger', label: 'EV Charger', desc: 'Level 2 home charging station', price: '$2,200' },
              { key: 'generator', label: 'Generator', desc: 'Whole-home backup generator', price: '$4,500' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleAddOn(opt.key)}
                className={`text-left border-2 rounded-xl p-4 transition-colors ${
                  addOns.includes(opt.key)
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    addOns.includes(opt.key) ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                  }`}>
                    {addOns.includes(opt.key) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{opt.desc}</p>
                <span className="text-xs font-semibold text-teal-700">{opt.price}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto bg-teal-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
        >
          Generate Proposal
        </button>
      </form>

      {/* Generated Proposal Summary */}
      {result && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-sm">UD</div>
              <span className="font-semibold text-sm">Urban Design Solar — Proposal Summary</span>
            </div>
            <h2 className="text-xl font-bold">{customerName || 'Customer'}</h2>
            <p className="text-slate-400 text-sm">{address || 'Address'}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <ResultCard label="System Size" value={`${result.systemSizeKw} kW`} />
              <ResultCard label="Total Investment" value={formatCurrency(result.totalCost)} large />
              <ResultCard label="Est. Annual Savings" value={formatCurrency(result.estimatedAnnualSavings)} />
              <ResultCard label="30% Federal Tax Credit" value={formatCurrency(result.federalTaxCredit)} highlight />
              <ResultCard label="Payback Period" value={`${result.paybackPeriod} years`} />
              <ResultCard label="25-Year Projected Savings" value={formatCurrency(result.twentyFiveYearSavings)} highlight />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-gray-700">
                  Estimated monthly savings: <strong className="text-gray-900">{formatCurrency(result.monthlySavings)}/mo</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Proposal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, large, highlight }: { label: string; value: string; large?: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className={`font-bold ${large ? 'text-xl text-gray-900' : 'text-lg text-gray-900'}`}>{value}</div>
    </div>
  );
}
