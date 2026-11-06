import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Utensils,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ngos' | 'users' | 'audit'

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, logsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Verify / Reject NGO
  const handleVerifyNgo = async (userId, action) => {
    try {
      const res = await api.put(`/admin/verify-ngo/${userId}`, {
        action,
        notes: action === 'approve' ? 'Approved by admin' : 'Incomplete documentation',
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update NGO verification');
    }
  };

  // Suspend / Activate User
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`Are you sure you want to change user status to '${nextStatus}'?`)) return;

    try {
      const res = await api.put(`/admin/users/${userId}/status`, {
        status: nextStatus,
        reason: 'Administrative policy action',
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading administrative telemetry...
      </div>
    );
  }

  const pendingNgos = users.filter((u) => u.role === 'ngo' && !u.isVerified);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global monitoring, NGO verification, user governance, and audit trails.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics & KPIs
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'ngos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NGO Verification
            {pendingNgos.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px]">
                {pendingNgos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Registered Users
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics?.users?.total || 0}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {analytics?.users?.donors} Donors • {analytics?.users?.ngos} NGOs • {analytics?.users?.volunteers} Volunteers
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Food Listings
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{analytics?.donations?.total || 0}</p>
              <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
                {analytics?.donations?.available} Active on Marketplace
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Food Diverted From Waste
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {analytics?.impact?.totalWeightKgRedistributed || 0} kg
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ~{analytics?.impact?.co2EmissionsPreventedKg || 0} kg CO₂ mitigated
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Estimated Meals Served
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {analytics?.impact?.totalEstimatedMealsServed || 0} Meals
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Delivered across partner shelters
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Donation Flow Activity (Past 7 Days)
              </h3>
              <div className="h-64">
                {analytics?.dailyTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="donations" fill="#10b981" radius={[6, 6, 0, 0]} name="Donations" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No donations in the past 7 days.
                  </div>
                )}
              </div>
            </div>

            {/* Food Categories Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                Food Categories Breakdown
              </h3>
              <div className="space-y-3">
                {analytics?.categoryBreakdown?.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat._id}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (cat.count / (analytics.donations.total || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 w-8 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGO VERIFICATION PORTAL */}
      {activeTab === 'ngos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">NGO Partner Verification Portal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify NGO authenticity, registration numbers, and cold storage capacity.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              {pendingNgos.length} Pending Approvals
            </span>
          </div>

          {pendingNgos.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">All NGOs are verified!</p>
              <p className="text-slate-400 mt-1">There are no pending registrations requiring review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingNgos.map((ngo) => (
                <div key={ngo._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{ngo.name}</h4>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                        Pending Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Organization: {ngo.organization?.name || 'N/A'} • Reg #: {ngo.organization?.registrationNumber || 'Not submitted'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Email: {ngo.email} • Phone: {ngo.phone || 'N/A'} • Address: {ngo.address?.street}, {ngo.address?.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyNgo(ngo._id, 'approve')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm"
                    >
                      Approve & Verify NGO
                    </button>
                    <button
                      onClick={() => handleVerifyNgo(ngo._id, 'reject')}
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs rounded-xl"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Platform Users ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verified</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <span className="text-[10px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold capitalize">{u.role}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isVerified ? (
                        <span className="text-emerald-600 font-bold">Yes ✓</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">System Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live immutable record of platform operations, logins, and status updates.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                  <span className="ml-2 font-medium text-slate-800">
                    By: {log.user?.name || 'System / Guest'} ({log.user?.role || 'Guest'})
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Resource: {log.resourceType} • IP: {log.ipAddress || '127.0.0.1'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
