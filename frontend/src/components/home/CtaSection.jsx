import React from 'react';
import { HeartHandshake, Shield, Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-medium mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Hunger & Zero Waste Goal</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Ready to Turn Surplus Food into Sustenance?
        </h2>

        <p className="mt-6 text-base sm:text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of conscious businesses and volunteer organizations across the city.
          Start saving meals in minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-800 hover:bg-brand-50 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <HeartHandshake className="w-5 h-5 text-brand-600" />
            <span>List a Food Donation</span>
          </button>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-600/50 hover:bg-brand-600 border border-brand-400/40 text-white font-semibold px-8 py-3.5 rounded-xl backdrop-blur-sm transition-all">
            <Shield className="w-5 h-5" />
            <span>Register as Partner NGO</span>
          </button>
        </div>
      </div>
    </section>
  );
}

