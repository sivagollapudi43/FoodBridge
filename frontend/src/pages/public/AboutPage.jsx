import React from 'react';
import { Utensils, Heart, ShieldCheck, Sparkles, Globe, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-widest">
          Our Purpose
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-4 sm:text-5xl">
          Bridging Surplus to Sustenance
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          FoodBridge was engineered to solve a painful paradox: millions of tons of wholesome food are
          discarded daily by restaurants, caterers, and supermarkets, while vulnerable families and
          shelters struggle with food insecurity.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Leaf className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Waste Environmental Goal</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Decomposing food in municipal landfills generates significant methane emissions. Diverting
            edible food directly fights climate change while nourishing people.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Algorithmic Smart Matching</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Because surplus meals have tight expiry deadlines, our rule-based matching engine scores
            and alerts the closest, highest-capacity verified shelter within seconds.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verifiable Trust & Safety</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Every donation adheres to food safety declarations, temperature checks, and dual-point QR
            code handshakes for complete end-to-end transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
