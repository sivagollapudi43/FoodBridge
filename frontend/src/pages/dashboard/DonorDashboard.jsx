import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Utensils,
  Leaf,
  ShieldCheck,
  Eye,
  Key,
} from 'lucide-react';

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    completedDonations: 0,
    totalMealsRedistributed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matchesModalData, setMatchesModalData] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Prepared Meals',
    quantity: '',
    unit: 'portions',
    storageType: 'Room Temperature',
    allergens: '',
    dietaryInfo: '',
    collectionDeadline: '',
    address: '',
    city: 'Bangalore',
    instructions: '',
    safetyConfirmed: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donationsRes, statsRes] = await Promise.all([
        api.get('/donations/my-donations'),
        api.get('/donations/donor-stats'),
      ]);

      if (donationsRes.data.success) {
        setDonations(donationsRes.data.donations || []);
        setRequests(donationsRes.data.requests || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create Donation Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        storageType: formData.storageType,
        allergens: formData.allergens ? formData.allergens.split(',').map((s) => s.trim()) : [],
        dietaryInfo: formData.dietaryInfo
          ? formData.dietaryInfo.split(',').map((s) => s.trim())
          : [],
        collectionDeadline: new Date(formData.collectionDeadline).toISOString(),
        pickupLocation: {
          address: formData.address || 'Indiranagar 100ft Rd',
          city: formData.city || 'Bangalore',
          instructions: formData.instructions,
        },
        safetyDeclaration: {
          isFresh: true,
          preparedHygienically: true,
          properlyPackaged: true,
          confirmedByDonor: formData.safetyConfirmed,
        },
      };

      const res = await api.post('/donations', payload);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({
          title: '',
          description: '',
          category: 'Prepared Meals',
          quantity: '',
          unit: 'portions',
          storageType: 'Room Temperature',
          allergens: '',
          dietaryInfo: '',
          collectionDeadline: '',
          address: '',
          city: 'Bangalore',
          instructions: '',
          safetyConfirmed: true,
        });
        fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to list donation.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Accept Request
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await api.put(`/requests/${requestId}/accept`, { note: 'Approved by donor' });
      if (res.data.success) {
        alert('Request accepted! Verification code generated for collection.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      const res = await api.put(`/requests/${requestId}/reject`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  // View Smart Matches
  const handleViewMatches = async (donationId) => {
    try {
      const res = await api.get(`/donations/${donationId}/recommendations`);
      if (res.data.success) {
        setMatchesModalData(res.data.matches);
      }
    } catch (err) {
      alert('Could not compute matches.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Donor Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your surplus food listings and review incoming NGO claims.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Food Donation</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Listed</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDonations}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Missions</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.activeDonations}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals Saved</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.totalMealsRedistributed}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Handshakes
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.completedDonations}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending NGO Requests Section */}
      {requests.filter((r) => r.status === 'pending').length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-amber-900">
              Action Required: Pending NGO Claims ({requests.filter((r) => r.status === 'pending').length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests
              .filter((r) => r.status === 'pending')
              .map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {req.ngo?.name || 'NGO Partner'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Requested: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mt-2">
                      Purpose: "{req.message}"
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Estimated Beneficiaries: <strong>{req.estimatedBeneficiaries} people</strong> | Transport: {req.transportMethod}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      Accept & Assign Pickup
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req._id)}
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded-lg"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Food Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Food Listings</h2>
          <span className="text-xs text-slate-500 font-medium">{donations.length} records</span>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No food donations listed yet.</p>
            <p className="text-xs mt-1">Click "List Food Donation" above to share your first surplus food.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Title & Category</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Storage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Collection Window</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((item) => {
                  const statusColors = {
                    Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Requested: 'bg-amber-50 text-amber-700 border-amber-200',
                    Accepted: 'bg-blue-50 text-blue-700 border-blue-200',
                    Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    Collected: 'bg-purple-50 text-purple-700 border-purple-200',
                    Delivered: 'bg-slate-100 text-slate-700 border-slate-200',
                    Expired: 'bg-rose-50 text-rose-700 border-rose-200',
                  };

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.quantity} {item.unit}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          (~{item.estimatedMeals} meals)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.storageType}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                            statusColors[item.status] || 'bg-slate-100'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(item.collectionDeadline).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(item.collectionDeadline).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewMatches(item._id)}
                          title="Smart NGO Matching"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Smart Matches</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Smart NGO Matches Modal */}
      {matchesModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Smart NGO Recommendations
                </h3>
              </div>
              <button
                onClick={() => setMatchesModalData(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Rule-based matching score evaluated on Proximity, Capacity, Verification, and Urgency.
            </p>

            <div className="overflow-y-auto mt-4 divide-y divide-slate-100 flex-1">
              {matchesModalData.map((m, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">{m.ngoName}</p>
                      {m.isVerified && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {m.distanceKm} km away | Cold Storage: {m.hasColdStorage ? 'Yes' : 'No'} | Transport: {m.hasOwnTransport ? 'Yes' : 'No'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-600">
                      {m.matchScore}%
                    </span>
                    <span className="block text-[10px] text-slate-400">Match Score</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMatchesModalData(null)}
              className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Food Donation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">List Surplus Food Donation</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Vegetable Pulav & Cucumber Salad"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe food contents, packaging condition, and temperature..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Prepared Meals">Prepared Meals</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="portions">Portions / Meals</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="boxes">Boxes</option>
                    <option value="crates">Crates</option>
                    <option value="packets">Packets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Condition *</label>
                  <select
                    value={formData.storageType}
                    onChange={(e) => setFormData({ ...formData, storageType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Room Temperature">Room Temperature</option>
                    <option value="Refrigerated">Refrigerated (Cold)</option>
                    <option value="Hot Holding">Hot Holding (Warm)</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Collection Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.collectionDeadline}
                    onChange={(e) => setFormData({ ...formData, collectionDeadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pickup Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Special Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring rear service bell for chef"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="safetyCheck"
                  checked={formData.safetyConfirmed}
                  onChange={(e) => setFormData({ ...formData, safetyConfirmed: e.target.checked })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <label htmlFor="safetyCheck" className="text-xs text-emerald-900 leading-relaxed font-medium">
                  <strong>Food Safety Declaration:</strong> I confirm this surplus food was prepared under standard hygiene protocols, stored correctly, and is suitable for human consumption within the collection window.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  {submitting ? 'Listing...' : 'Post Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

