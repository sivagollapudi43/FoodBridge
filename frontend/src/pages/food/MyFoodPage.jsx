import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Utensils, Trash2, MapPin, Phone, Clock } from 'lucide-react';

export default function MyFoodPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyFood = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations/my-food');
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
    fetchMyFood();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food listing?')) return;
    try {
      const res = await api.delete(`/donations/${id}`);
      if (res.data.success) {
        fetchMyFood();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete food');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Added Food Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage surplus food you have posted to the platform.
          </p>
        </div>

        <Link
          to="/add-food"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add More Food</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading your listings...</div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">You haven't added any food yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Whenever you have surplus food, post it here so people in need can pick it up.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donations.map((item) => (
            <div
              key={item._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  Quantity: {item.quantity}
                </p>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.pickupAddress}, {item.city}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Pickup Phone: {item.contactPhone}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Available: {item.availableUntil}
                  </p>
                </div>

                {item.claimedBy && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                    Claimed by: <strong>{item.claimedBy.name}</strong> ({item.claimedBy.phone || 'Contact provided'})
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleDelete(item._id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
