import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  PlusCircle,
  Utensils,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const [recentFood, setRecentFood] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/donations?status=Available');
        if (res.data.success) {
          setRecentFood((res.data.donations || []).slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Simple Community Food Redistribution</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Share Surplus Food.{' '}
          <span className="text-emerald-600">Feed Those in Need.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          FoodBridge connects households, restaurants, and caterers directly with people in need.
          Got surplus food? Post it in 60 seconds so someone can pick it up.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/add-food"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Available Food</span>
          </Link>

          <Link
            to="/food"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-3.5 rounded-2xl border border-slate-200 shadow-sm transition-all text-sm"
          >
            <span>Browse Available Food</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10 tracking-tight">
            How It Works — Fast & Simple
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Post Food Details</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add food name, quantity, pickup address, and your phone number in under a minute.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Listed on Live Feed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nearby shelters, families, or individuals immediately see your available food.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Direct Pickup</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                They call your contact number to coordinate immediate pickup before the food expires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Available Food Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Recently Added Food
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available right now for community collection.
            </p>
          </div>

          <Link
            to="/food"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading food listings...</div>
        ) : recentFood.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No food listed currently. Be the first to add available food!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentFood.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs font-extrabold text-emerald-700 mt-2">
                    Quantity: {item.quantity}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {item.pickupAddress}, {item.city}
                    </p>
                    <p className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Call: {item.contactPhone}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to="/food"
                    className="w-full py-2 block text-center bg-slate-100 hover:bg-emerald-600 hover:text-white font-bold text-xs rounded-xl transition-all"
                  >
                    View & Claim
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
