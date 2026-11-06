import React, { useState } from 'react';
import { Utensils, HeartHandshake, Menu, X, ArrowRight } from 'lucide-react';
import ApiStatusBadge from './ApiStatusBadge';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
                Food<span className="text-brand-600">Bridge</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                Smart Redistribution
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#roles" className="hover:text-brand-600 transition-colors">
              For Donors & NGOs
            </a>
            <a href="#impact" className="hover:text-brand-600 transition-colors">
              Our Impact
            </a>
          </nav>

          {/* Right Header Section: Health Badge & Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ApiStatusBadge />
            <button className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-2 transition-colors">
              Sign In
            </button>
            <button className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all">
              <HeartHandshake className="w-4 h-4" />
              <span>Donate Food</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="py-2">
            <ApiStatusBadge />
          </div>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            How It Works
          </a>
          <a
            href="#roles"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            For Donors & NGOs
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Our Impact
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <button className="w-full text-center py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-200">
              Sign In
            </button>
            <button className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg">
              <HeartHandshake className="w-4 h-4" />
              <span>Donate Food</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

