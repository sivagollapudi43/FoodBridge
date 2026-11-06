import React from 'react';
import { Smartphone, Zap, Truck, CheckCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Donor Posts Surplus',
      desc: 'Donor inputs food type, estimated quantity, shelf life / expiry time, and pickup window in under a minute.',
      icon: Smartphone,
    },
    {
      step: '02',
      title: 'Smart Geo-Matching',
      desc: 'Our platform matches the donation with the nearest verified NGO or food shelter based on capacity and distance.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Claim & Route Pickup',
      desc: 'NGO accepts the claim. Nearby volunteers or NGO logistics team receive turn-by-turn navigation for pickup.',
      icon: Truck,
    },
    {
      step: '04',
      title: 'Verified Distribution',
      desc: 'Digital QR-code verification confirms handover at both points, generating transparent transparency and impact reports.',
      icon: CheckCheck,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-brand-600 mb-2">
            The Flow
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How FoodBridge Operates
          </p>
          <p className="mt-4 text-slate-600 text-base">
            Designed to be ultra-fast and reliable because surplus food has a strictly limited window.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-4xl font-black text-brand-200 select-none">
                  {item.step}
                </span>

                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center my-4 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
