import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/public/MarketplacePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Role-Based Dashboards
import DonorDashboard from './pages/dashboard/DonorDashboard';
import NgoDashboard from './pages/dashboard/NgoDashboard';
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Donor Portal */}
                <Route
                  path="donor"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* NGO Portal */}
                <Route
                  path="ngo"
                  element={
                    <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Volunteer Portal */}
                <Route
                  path="volunteer"
                  element={
                    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Command Portal */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
