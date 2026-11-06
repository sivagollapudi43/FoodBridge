import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Clock, MapPin, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  const donateTarget = isAuthenticated
    ? user?.role === 'donor'
      ? '/dashboard/donor'
      : '/marketplace'
    : '/register';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-200/40 via-emerald-100/30 to-amber-100/40 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Smart Food Donation & Redistribution Network</span>
          </div>

          {/* Prompt specified Hero Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Share Food.{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Reduce Waste.
            </span>{' '}
            Feed Hope.
          </h1>

          {/* Prompt specified Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Connecting surplus food with communities in need through a smarter donation and
            redistribution network.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={donateTarget}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all text-base"
            >
              <HeartHandshake className="w-5 h-5" />
              <span>Donate Food</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-base"
            >
              <span>Find Food</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border border-slate-200/80 bg-white/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Real-Time Matching</p>
                <p className="text-xs text-slate-500 mt-0.5">Surplus claimed in under 20 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Safety & Compliance</p>
                <p className="text-xs text-slate-500 mt-0.5">Strict quality & hygiene verification</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Hyper-Local Logistics</p>
                <p className="text-xs text-slate-500 mt-0.5">Route-optimized volunteer pickups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
