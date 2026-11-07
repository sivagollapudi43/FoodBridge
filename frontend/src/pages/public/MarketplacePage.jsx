import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Utensils,
  AlertTriangle,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Claim Request Modal
  const [claimDonation, setClaimDonation] = useState(null);
  const [message, setMessage] = useState('');
  const [estimatedBeneficiaries, setEstimatedBeneficiaries] = useState('');
  const [transportMethod, setTransportMethod] = useState('Volunteer Courier');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');

  const fetchMarketplace = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);

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
    fetchMarketplace();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMarketplace();
  };

  // Submit Claim Request
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setClaimError('');
    setSubmittingClaim(true);

    try {
      const res = await api.post('/requests', {
        donationId: claimDonation._id,
        message,
        estimatedBeneficiaries: Number(estimatedBeneficiaries),
        transportMethod,
      });

      if (res.data.success) {
        alert('Claim request submitted successfully! Donor notified.');
        setClaimDonation(null);
        setMessage('');
        setEstimatedBeneficiaries('');
        fetchMarketplace();
      }
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const categories = [
    'All',
    'Prepared Meals',
    'Bakery',
    'Fruits & Vegetables',
    'Vegetarian',
    'Non-Vegetarian',
    'Groceries',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Food Rescue Feed</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Surplus Food Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Claim edible surplus food from certified restaurants and bakeries before it reaches its collection deadline.
          </p>
        </div>

        {isAuthenticated && user?.role === 'donor' && (
          <Link
            to="/dashboard/donor"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
          >
            + List Food Donation
          </Link>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by food name, dish, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="urgent_deadline">Sort: Urgent Deadline First ⏰</option>
            <option value="quantity_desc">Sort: Highest Quantity</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Marketplace Listings Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Scanning for available food rescue listings...
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Food Listings Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or checking back soon as donors upload surplus throughout the day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((item) => {
            const deadline = new Date(item.collectionDeadline);
            const now = new Date();
            const hoursLeft = Math.max(0, Math.round((deadline - now) / (1000 * 60 * 60)));
            const isUrgent = hoursLeft <= 4;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isUrgent
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{hoursLeft > 0 ? `${hoursLeft} hrs left` : 'Expiring soon'}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Quantity & Storage Highlights */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Available Quantity:</span>
                      <span className="text-emerald-700 font-bold">
                        {item.quantity} {item.unit} (~{item.estimatedMeals} meals)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Storage Required:</span>
                      <span>{item.storageType}</span>
                    </div>
                  </div>

                  {/* Location & Donor */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.pickupLocation?.address}, {item.pickupLocation?.city}</span>
                  </div>
                </div>

                {/* Claim CTA */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  {user?.role === 'ngo' ? (
                    <button
                      onClick={() => setClaimDonation(item)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>Request This Food</span>
                    </button>
                  ) : !isAuthenticated ? (
                    <Link
                      to="/login"
                      className="w-full py-2.5 block text-center bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                    >
                      Sign In as NGO to Claim
                    </Link>
                  ) : (
                    <div className="text-center text-[11px] text-slate-400 py-1">
                      Available for Verified NGO Claim
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Donation Modal */}
      {claimDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Claim Food Donation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Requesting: <strong>{claimDonation.title}</strong> ({claimDonation.quantity} {claimDonation.unit})
            </p>

            {claimError && (
              <div className="mt-3 p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
                {claimError}
              </div>
            )}

            <form onSubmit={handleSubmitClaim} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Number of Beneficiaries *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 80 people"
                  value={estimatedBeneficiaries}
                  onChange={(e) => setEstimatedBeneficiaries(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transport Method *
                </label>
                <select
                  value={transportMethod}
                  onChange={(e) => setTransportMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Volunteer Courier">FoodBridge Volunteer Courier</option>
                  <option value="Own Vehicle">Our NGO's Own Vehicle</option>
                  <option value="Shelter Bus">Shelter Bus / Van</option>
                  <option value="On-foot Pickup">On-foot Walking Pickup</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Message / Distribution Purpose *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. For dinner distribution at Koramangala night shelter."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimDonation(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

