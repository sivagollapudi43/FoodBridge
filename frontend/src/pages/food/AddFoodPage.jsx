import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, Utensils, MapPin, Phone, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AddFoodPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cooked Food');
  const [quantity, setQuantity] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [availableUntil, setAvailableUntil] = useState('Today before 9:00 PM');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/add-food');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/donations', {
        title,
        category,
        quantity,
        pickupAddress,
        city,
        contactPhone,
        availableUntil,
        description,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/food');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post food listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Food Sharing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Add Available Food
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter details about the surplus food you have available for pickup.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Food posted successfully! Redirecting to available listings...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Food Item Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Vegetable Biryani & Raita"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Food Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Cooked Food">Cooked Food / Meals</option>
                <option value="Raw Groceries">Raw Groceries / Grains</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Bakery">Bakery & Breads</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity *</label>
              <input
                type="text"
                required
                placeholder="e.g. 40 plates, 10 kg, 3 boxes"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone for Pickup *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Available Until / Time Window *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Today before 9:00 PM"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Pickup Address / Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 100 Feet Road, Indiranagar, near Metro"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description / Food Condition (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Fresh lunch banquet surplus, packed hygienically in boxes, please bring carry bags."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Posting Food...' : 'Post Available Food'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
