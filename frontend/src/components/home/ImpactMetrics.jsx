import React from 'react';
import { UtensilsCrossed, Building2, Users2, Leaf } from 'lucide-react';

export default function ImpactMetrics() {
  const metrics = [
    {
      icon: UtensilsCrossed,
      value: '125,000+',
      label: 'Nutritious Meals Saved',
      description: 'Redirected to hungry families',
      accent: 'text-brand-600',
      bg: 'bg-brand-50',
    },
    {
      icon: Building2,
      value: '420+',
      label: 'Food Donor Businesses',
      description: 'Restaurants, grocers & caterers',
      accent: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Users2,
      value: '180+',
      label: 'Verified NGO Partners',
      description: 'Distributing across local shelters',
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Leaf,
      value: '84 Tons',
      label: 'CO₂ Emissions Prevented',
      description: 'Food diverted from landfills',
      accent: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section id="impact" className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-brand-600 mb-2">
            Measurable Collective Impact
          </h2>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            Every Plate Saved Counts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.accent} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  {item.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {item.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

