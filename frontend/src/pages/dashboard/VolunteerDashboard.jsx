import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Bike,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  QrCode,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.volunteerProfile?.isAvailable ?? true);

  // Verification dialog states
  const [activeVerification, setActiveVerification] = useState(null); // { type: 'pickup' | 'delivery', deliveryId: string }
  const [verificationCode, setVerificationCode] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deliveries/my-deliveries');
      if (res.data.success) {
        setDeliveries(res.data.deliveries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Toggle Availability
  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      setIsAvailable(newStatus);
      await api.put('/auth/profile', {
        volunteerProfile: { isAvailable: newStatus },
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Respond to Assignment (Accept / Decline)
  const handleAssignmentResponse = async (deliveryId, action) => {
    try {
      const res = await api.put(`/deliveries/${deliveryId}/respond-assignment`, { action });
      if (res.data.success) {
        fetchDeliveries();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update assignment');
    }
  };

  // Submit Code Verification (Handshake)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setVerifying(true);

    try {
      const endpoint =
        activeVerification.type === 'pickup'
          ? `/deliveries/${activeVerification.deliveryId}/verify-pickup`
          : `/deliveries/${activeVerification.deliveryId}/verify-delivery`;

      const res = await api.put(endpoint, {
        code: verificationCode,
        notes: proofNotes,
      });

      if (res.data.success) {
        alert(res.data.message);
        setActiveVerification(null);
        setVerificationCode('');
        setProofNotes('');
        fetchDeliveries();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Verification failed. Incorrect code.');
    } finally {
      setVerifying(false);
    }
  };

  const activeMissions = deliveries.filter((d) => d.status !== 'delivered');
  const completedMissions = deliveries.filter((d) => d.status === 'delivered');

  return (
    <div className="space-y-8">
      {/* Top Banner with Availability Toggle */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Volunteer Mission Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pick up surplus meals from donors and deliver them to community food banks.
          </p>
        </div>

        <button
          onClick={toggleAvailability}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            isAvailable
              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-400'}`}
          />
          <span>{isAvailable ? 'Status: Active & Available' : 'Status: Off-Duty'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Missions
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{activeMissions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Deliveries
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {user?.volunteerProfile?.completedDeliveries || completedMissions.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Courier Vehicle
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1 capitalize">
              {user?.volunteerProfile?.vehicleType || 'Motorcycle'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Deliveries List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Assigned Tasks & Deliveries ({activeMissions.length})
        </h2>

        {activeMissions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            <Bike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">No pending missions right now.</p>
            <p className="mt-1 text-slate-400">
              When an NGO assigns you to a food rescue mission, it will appear here instantly.
            </p>
          </div>
        ) : (
          activeMissions.map((mission) => {
            const isPickupDone = mission.isPickupVerified;
            const donorCoords = mission.pickupLocation?.coordinates || [77.5946, 12.9716];
            const ngoCoords = mission.dropoffLocation?.coordinates || [77.5946, 12.9716];

            const donorMapsUrl = `https://www.google.com/maps/search/?api=1&query=${donorCoords[1]},${donorCoords[0]}`;
            const ngoMapsUrl = `https://www.google.com/maps/search/?api=1&query=${ngoCoords[1]},${ngoCoords[0]}`;

            return (
              <div
                key={mission._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                      Status: {mission.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">
                      {mission.donation?.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Quantity: <strong>{mission.donation?.quantity} {mission.donation?.unit}</strong> ({mission.donation?.storageType})
                    </p>
                  </div>

                  {mission.assignment?.status === 'assigned' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAssignmentResponse(mission._id, 'accept')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                      >
                        Accept Mission
                      </button>
                      <button
                        onClick={() => handleAssignmentResponse(mission._id, 'decline')}
                        className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs rounded-xl"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>

                {/* Pickup and Dropoff Address Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Step 1: Donor Pickup */}
                  <div
                    className={`p-4 rounded-xl border ${
                      isPickupDone
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        1. Pickup: {mission.donor?.name || 'Food Donor'}
                      </span>
                      {isPickupDone ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Collected ✓
                        </span>
                      ) : (
                        <a
                          href={donorMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Directions <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-600">{mission.pickupLocation?.address}, {mission.pickupLocation?.city}</p>
                    <p className="text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {mission.pickupLocation?.contactPhone || 'Available upon arrival'}
                    </p>

                    {!isPickupDone && (
                      <button
                        onClick={() =>
                          setActiveVerification({ type: 'pickup', deliveryId: mission._id })
                        }
                        className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Verify Pickup with Donor</span>
                      </button>
                    )}
                  </div>

                  {/* Step 2: NGO Dropoff */}
                  <div
                    className={`p-4 rounded-xl border ${
                      mission.status === 'delivered'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        2. Dropoff: {mission.ngo?.name || 'NGO Center'}
                      </span>
                      {mission.status === 'delivered' ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                          Delivered ✓
                        </span>
                      ) : (
                        <a
                          href={ngoMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Directions <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-slate-600">{mission.dropoffLocation?.address}, {mission.dropoffLocation?.city}</p>
                    <p className="text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {mission.dropoffLocation?.contactPhone || 'Available upon arrival'}
                    </p>

                    {isPickupDone && mission.status !== 'delivered' && (
                      <button
                        onClick={() =>
                          setActiveVerification({ type: 'delivery', deliveryId: mission._id })
                        }
                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Verify Handover at Dropoff</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Code Verification Modal */}
      {activeVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {activeVerification.type === 'pickup'
                ? 'Donor Pickup Verification'
                : 'Shelter Delivery Verification'}
            </h3>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ask the {activeVerification.type === 'pickup' ? 'donor' : 'shelter coordinator'} for
              their 6-digit confirmation code.
            </p>

            {errorMsg && (
              <div className="mt-3 p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="e.g. 482910"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Handover Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Temperature checked & packed securely"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveVerification(null)}
                  className="flex-1 py-2 text-xs border border-slate-200 rounded-xl text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {verifying ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
