import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  PlusCircle,
  Utensils,
  CheckCircle2,
  Trash2,
  AlertCircle,
  User,
} from 'lucide-react';

export default function FoodFeedPage() {
  const { user, isAuthenticated } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [claimingId, setClaimingId] = useState(null);

  const categories = [
    'All',
    'Cooked Food',
    'Raw Groceries',
    'Fruits & Vegetables',
    'Bakery',
    'Packaged Food',
    'Other',
  ];

  const fetchFood = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const res = await api.get(`/donations?${params.toString()}`);
      if (res.data.success) {
        setDonations(res.data.donations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFood();
  };

  // Claim Food Handler
  const handleClaimFood = async (id) => {
    if (!isAuthenticated) {
      alert('Please log in to claim food.');
      return;
    }

    if (!window.confirm('Do you want to claim this food? This informs others that pickup is being coordinated.')) {
      return;
    }

    setClaimingId(id);
    try {
      const res = await api.put(`/donations/${id}/claim`);
      if (res.data.success) {
        alert(res.data.message);
        fetchFood();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim food');
    } finally {
      setClaimingId(null);
    }
  };

  // Delete Food Handler (Author or Admin)
  const handleDeleteFood = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food listing?')) return;

    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data.success) {
        fetchFood();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Available Food Feed
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse surplus food shared by community members, restaurants, and caterers.
          </p>
        </div>

        <Link
          to="/add-food"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Available Food</span>
        </Link>
      </div>

      {/* Search Bar & Categories */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by food name, locality, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading available food...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center max-w-md mx-auto">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Food Listings Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Be the first to share available surplus food with the community!
          </p>
          <Link
            to="/add-food"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Available Food</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item) => {
            const isAuthor = user && item.user?._id === user._id;
            const isAdmin = user && user.role === 'admin';
            const isAvailable = item.status === 'Available';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Quantity:</span>
                      <span className="text-emerald-700 font-extrabold">{item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Best Before:
                      </span>
                      <span>{item.availableUntil}</span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      "{item.description}"
                    </p>
                  )}

                  {/* Location & Contact Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{item.pickupAddress}, {item.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Call for Pickup: {item.contactPhone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Shared by: {item.user?.name || 'Community Member'}
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isAvailable ? (
                    <button
                      onClick={() => handleClaimFood(item._id)}
                      disabled={claimingId === item._id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {claimingId === item._id ? 'Claiming...' : 'Claim This Food'}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      Claimed by {item.claimedBy?.name || 'Someone'}
                    </span>
                  )}

                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => handleDeleteFood(item._id)}
                      title="Delete food listing"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
