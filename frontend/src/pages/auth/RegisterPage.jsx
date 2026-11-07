import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Store,
  Building2,
  Bike,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [street, setStreet] = useState('');

  // Organization Specific
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [organizationType, setOrganizationType] = useState('restaurant');

  // Volunteer Specific
  const [vehicleType, setVehicleType] = useState('motorcycle');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        address: {
          street,
          city,
          state: 'Karnataka',
          country: 'India',
        },
        organizationName: ['donor', 'ngo'].includes(role) ? organizationName || name : undefined,
        registrationNumber: ['donor', 'ngo'].includes(role) ? registrationNumber : undefined,
        organizationType: role === 'ngo' ? 'ngo' : organizationType,
        vehicleType: role === 'volunteer' ? vehicleType : undefined,
      };

      const data = await register(payload);
      if (data.success) {
        navigate(`/dashboard/${data.user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20 mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Join FoodBridge</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create an account to start sharing or rescuing surplus meals.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Role</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setRole('donor');
                setOrganizationType('restaurant');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'donor'
                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Store className="w-5 h-5 text-emerald-600" />
              <span>Food Donor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('ngo');
                setOrganizationType('ngo');
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'ngo'
                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>NGO / Shelter</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                role === 'volunteer'
                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bike className="w-5 h-5 text-emerald-600" />
              <span>Volunteer Courier</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {role === 'donor'
                  ? 'Business / Donor Name *'
                  : role === 'ngo'
                  ? 'Organization Contact Name *'
                  : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder={role === 'donor' ? 'e.g. Royal Caterers' : 'e.g. Rahul Sharma'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                minLength="6"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conditional Fields for Donor & NGO */}
          {['donor', 'ngo'].includes(role) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Organization Registered Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Official Registered Entity Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tax / Registration ID {role === 'ngo' ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    required={role === 'ngo'}
                    placeholder={role === 'ngo' ? 'e.g. NGO-KAR-2023-441' : 'e.g. GSTIN29XXXXX'}
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Fields for Volunteer */}
          {role === 'volunteer' && (
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
              <label className="block font-semibold text-slate-700 mb-1">
                Your Delivery Transportation
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
              >
                <option value="motorcycle">Motorcycle / Scooter</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
                <option value="van">Van / Small Truck</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                placeholder="e.g. MG Road, Indiranagar"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Registering...' : 'Create FoodBridge Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

