import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, PlusCircle, LogOut, ShieldCheck, User, Menu, X, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ApiStatusBadge from './ApiStatusBadge';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Food<span className="text-emerald-600">Bridge</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-slate-600">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link to="/food" className="hover:text-emerald-600 transition-colors">
              Available Food
            </Link>
            <Link
              to="/add-food"
              className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Food</span>
            </Link>

            {isAuthenticated && user?.role === 'user' && (
              <Link to="/my-food" className="hover:text-emerald-600 transition-colors">
                My Food Listings
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            <ApiStatusBadge />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {user?.name}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                    {user?.role === 'admin' ? '🛡️ Administrator' : '👤 User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 text-sm font-medium">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/food"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Available Food
          </Link>
          <Link
            to="/add-food"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-emerald-700 font-bold bg-emerald-50 rounded-lg"
          >
            + Add Food
          </Link>

          {isAuthenticated && user?.role === 'user' && (
            <Link
              to="/my-food"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              My Food Listings
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-purple-700 font-bold bg-purple-50 rounded-lg"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-center py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
