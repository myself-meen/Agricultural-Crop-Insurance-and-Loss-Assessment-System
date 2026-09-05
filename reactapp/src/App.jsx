import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FarmerProfile from './pages/FarmerProfile';
import PolicyPortal from './pages/PolicyPortal';
import PolicyEnrollment from './pages/PolicyEnrollment';
import LossNotification from './pages/LossNotification';
import SurveyManagement from './pages/SurveyManagement';
import ClaimTracker from './pages/ClaimTracker';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AuditLogViewer from './pages/AuditLogViewer';
import UserDirectory from './pages/UserDirectory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Authenticated Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Farmer Specific Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                    <FarmerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enroll"
                element={
                  <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                    <PolicyEnrollment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report-loss"
                element={
                  <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                    <LossNotification />
                  </ProtectedRoute>
                }
              />

              {/* Shared Policy Directory */}
              <Route
                path="/policies"
                element={
                  <ProtectedRoute>
                    <PolicyPortal />
                  </ProtectedRoute>
                }
              />

              {/* Surveyor & Insurer Field Surveys */}
              <Route
                path="/surveys"
                element={
                  <ProtectedRoute allowedRoles={['SURVEYOR', 'INSURER', 'ADMIN']}>
                    <SurveyManagement />
                  </ProtectedRoute>
                }
              />

              {/* Claims & DBT Payout Pipeline */}
              <Route
                path="/claims"
                element={
                  <ProtectedRoute allowedRoles={['INSURER', 'STATE_OFFICER', 'BANK_OFFICER', 'ADMIN']}>
                    <ClaimTracker />
                  </ProtectedRoute>
                }
              />

              {/* Analytics & Reporting */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['INSURER', 'STATE_OFFICER', 'ADMIN']}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Audit Logs */}
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['STATE_OFFICER', 'ADMIN']}>
                    <AuditLogViewer />
                  </ProtectedRoute>
                }
              />

              {/* User Directory */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserDirectory />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
