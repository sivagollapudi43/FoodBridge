import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Clock,
  Bike,
  CheckCircle2,
  AlertCircle,
  Users,
  Utensils,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Volunteer Modal
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [assignInstructions, setAssignInstructions] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [delRes, reqRes, volRes] = await Promise.all([
        api.get('/deliveries/ngo-deliveries'),
        api.get('/requests/my-requests'),
        api.get('/deliveries/available-volunteers'),
      ]);

      if (delRes.data.success) setDeliveries(delRes.data.deliveries || []);
      if (reqRes.data.success) setRequests(reqRes.data.requests || []);
      if (volRes.data.success) setVolunteers(volRes.data.volunteers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignVolunteer = async (e) => {
    e.preventDefault();
    if (!selectedVolunteerId || !selectedDelivery) return;

    setAssigning(true);
    try {
      const res = await api.post(`/deliveries/${selectedDelivery._id}/assign-volunteer`, {
        volunteerId: selectedVolunteerId,
        instructions: assignInstructions,
      });

      if (res.data.success) {
        alert(res.data.message);
        setSelectedDelivery(null);
        setSelectedVolunteerId('');
        setAssignInstructions('');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign volunteer');
    } finally {
      setAssigning(false);
    }
  };

  const isVerified = user?.isVerified;

  return (
    <div className="space-y-8">
      {/* Verification Status Warning if Pending */}
      {!isVerified ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900">
              NGO Verification in Progress
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Your organization registration is currently under review by FoodBridge administrators.
              You can explore the live marketplace, but claiming donations requires verified status to
              ensure food hygiene standards.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">Verified Food Partner NGO</h3>
              <p className="text-xs text-emerald-700">
                You are authorized to claim surplus food and coordinate volunteer pickups.
              </p>
            </div>
          </div>
          <Link
            to="/marketplace"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Marketplace</span>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Missions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {deliveries.filter((d) => d.status !== 'delivered').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Claims</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {requests.filter((r) => r.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Volunteers</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{volunteers.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Deliveries</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {deliveries.filter((d) => d.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Active Pickups & Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Food Pickups & Deliveries</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordinate volunteer dispatch and verify delivery codes.
            </p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-emerald-600 hover:underline">
            + Claim New Food
          </Link>
        </div>

        {deliveries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No active deliveries yet.</p>
            <p className="text-slate-400 mt-1">Browse available surplus food on the marketplace to request meals.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Donation</th>
                  <th className="py-3.5 px-4">Pickup Address</th>
                  <th className="py-3.5 px-4">Assigned Courier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Handover Verification Code</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deliveries.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.donation?.title}</p>
                      <span className="text-[10px] text-slate-500">
                        {item.donation?.quantity} {item.donation?.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.pickupLocation?.address}, {item.pickupLocation?.city}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.volunteer ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <Bike className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.volunteer.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      Delivery: <span className="text-emerald-700">{item.deliveryVerificationCode}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status !== 'delivered' && (
                        <button
                          onClick={() => {
                            setSelectedDelivery(item);
                            setSelectedVolunteerId(item.volunteer?._id || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium"
                        >
                          {item.volunteer ? 'Reassign Volunteer' : 'Assign Volunteer'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Volunteer Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Assign Volunteer for Delivery
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an available volunteer courier to pick up "{selectedDelivery.donation?.title}".
            </p>

            <form onSubmit={handleAssignVolunteer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Available Volunteers ({volunteers.length})
                </label>
                <select
                  required
                  value={selectedVolunteerId}
                  onChange={(e) => setSelectedVolunteerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Choose Volunteer --</option>
                  {volunteers.map((vol) => (
                    <option key={vol._id} value={vol._id}>
                      {vol.name} ({vol.volunteerProfile?.vehicleType || 'vehicle'} - {vol.volunteerProfile?.completedDeliveries} completed)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pickup Instructions for Volunteer
                </label>
                <textarea
                  rows="3"
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="e.g. Please carry insulated bag, pick up before 7:00 PM."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDelivery(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
