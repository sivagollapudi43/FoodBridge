import React from 'react';
import { Store, Building, Bike, CheckCircle2 } from 'lucide-react';

export default function UserRolesSection() {
  const roles = [
    {
      icon: Store,
      title: 'Food Donors',
      subtitle: 'Restaurants, Grocers, Caterers & Bakeries',
      description:
        'Post surplus food in seconds with expiry timestamps and quantity. Eliminate disposal costs and gain verifiable tax-deductible social impact reports.',
      benefits: [
        'Quick 60-second donation listing',
        'Automatic matching with closest verified NGO',
        'Detailed ESG and tax impact reports',
      ],
      cta: 'Register as Donor',
      badge: 'Donors',
      borderColor: 'hover:border-brand-300',
      tagColor: 'bg-brand-50 text-brand-700 border-brand-200',
    },
    {
      icon: Building,
      title: 'NGOs & Shelters',
      subtitle: 'Community Kitchens & Orphanages',
      description:
        'Receive instant geo-notifications when food is posted in your vicinity. Claim meals, coordinate volunteer pickups, and feed your communities efficiently.',
      benefits: [
        'Real-time automated surplus alerts',
        'Food safety and inspection guidelines',
        'Integrated volunteer dispatch',
      ],
      cta: 'Apply for NGO Access',
      badge: 'Receivers',
      borderColor: 'hover:border-blue-300',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Bike,
      title: 'Volunteer Couriers',
      subtitle: 'Local Champions & Deliveries',
      description:
        'Help transport food from donors to distribution points. Follow optimized routes, track pickups with QR verification, and make direct human impact.',
      benefits: [
        'Turn-by-turn pickup and delivery routing',
        'Flexible hours in your immediate neighborhood',
        'Volunteer hours certificate & badges',
      ],
      cta: 'Join Volunteer Squad',
      badge: 'Logistics',
      borderColor: 'hover:border-amber-300',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <section id="roles" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-semibold text-brand-600 mb-2">
            Built for Everyone in the Ecosystem
          </h2>
          <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            How FoodBridge Unites the Community
          </p>
          <p className="mt-4 text-slate-600 text-base">
            Whether you have surplus meals to donate, a community to feed, or a bike to help transport,
            FoodBridge provides a coordinated, transparent solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-8 border border-slate-200 ${role.borderColor} shadow-sm hover:shadow-lg transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${role.tagColor}`}>
                      {role.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{role.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">{role.subtitle}</p>

                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100">
                    {role.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-8 w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 text-sm font-semibold transition-all">
                  {role.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

