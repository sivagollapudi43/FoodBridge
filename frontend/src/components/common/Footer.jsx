import React from 'react';
import { Utensils, Heart, Github, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">FoodBridge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Food Donation and Redistribution Platform. Connecting surplus food sources to hungry communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-brand-400 transition-colors">How It Works</a></li>
              <li><a href="#roles" className="hover:text-brand-400 transition-colors">For Food Donors</a></li>
              <li><a href="#roles" className="hover:text-brand-400 transition-colors">For NGOs & Shelters</a></li>
              <li><a href="#impact" className="hover:text-brand-400 transition-colors">Impact Metrics</a></li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">MERN Tech Stack</h4>
            <ul className="space-y-2 text-xs">
              <li>Frontend: React 18, Vite, Tailwind CSS</li>
              <li>Backend: Node.js, Express.js</li>
              <li>Database: MongoDB (Mongoose)</li>
              <li>Security: JWT & bcrypt</li>
            </ul>
          </div>

          {/* Standards & Guidelines */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Food Safety</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All food listings adhere to local health and hygiene standards, temperature control, and packaging guidelines.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Verified Safety Standards
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FoodBridge Platform. Built with care for community hunger relief.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for social impact
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

