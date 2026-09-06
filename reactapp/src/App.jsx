import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Figma Design System Components
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import FarmerRegistration from './components/FarmerRegistration';
import PolicyEnrollment from './components/PolicyEnrollment';
import LossNotification from './components/LossNotification';
import SurveyManagement from './components/SurveyManagement';
import ClaimManagement from './components/ClaimManagement';
import Analytics from './components/Analytics';
import AdminManagement from './components/AdminManagement';
import FarmerProfile from './components/FarmerProfile';
import { ROLE_DESIGNATIONS } from './components/Layout';

// Map pathnames to page IDs
const PATH_TO_PAGE = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/profile': 'farmer_profile',
  '/farmer_profile': 'farmer_profile',
  '/my-profile': 'farmer_profile',
  '/kyc': 'farmer_profile',
  '/farmer_directory': 'farmer_directory',
  '/farmer_registration': 'farmer_directory',
  '/farmers': 'farmer_directory',
  '/policy_enrollment': 'policy_enrollment',
  '/enroll': 'policy_enrollment',
  '/policies': 'policy_enrollment',
  '/loss_notification': 'loss_notification',
  '/report-loss': 'loss_notification',
  '/survey_management': 'survey_management',
  '/surveys': 'survey_management',
  '/claim_management': 'claim_management',
  '/claims': 'claim_management',
  '/analytics': 'analytics',
  '/admin_management': 'admin_management',
  '/users': 'admin_management',
  '/audit-logs': 'admin_management',
};

const PAGE_TO_PATH = {
  dashboard: '/dashboard',
  farmer_profile: '/farmer_profile',
  farmer_directory: '/farmer_directory',
  policy_enrollment: '/policy_enrollment',
  loss_notification: '/loss_notification',
  survey_management: '/survey_management',
  claim_management: '/claim_management',
  analytics: '/analytics',
  admin_management: '/admin_management',
};

function MainApp() {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [localUser, setLocalUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pmfby_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const currentUser = user || localUser;

  // Sync current page with URL path
  const currentPage = PATH_TO_PAGE[location.pathname] || 'dashboard';

  const handleNavigate = (page) => {
    const targetPath = PAGE_TO_PATH[page] || '/dashboard';
    navigate(targetPath);
  };

  const handleLoginSuccess = (authenticatedUser) => {
    setLocalUser(authenticatedUser);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setLocalUser(null);
    navigate('/');
  };

  if (!currentUser) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  const userRole = (currentUser.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer');

  // Normalize user object for Layout component
  const normalizedUser = {
    id: String(currentUser.userId || currentUser.id || '2'),
    name: currentUser.name || 'Portal User',
    role: userRole,
    designation: currentUser.designation || ROLE_DESIGNATIONS[userRole] || 'Registered Farmer',
    district: currentUser.district || 'Nashik',
    avatar: (currentUser.name || 'US').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    email: currentUser.email || '',
    token: currentUser.token,
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={normalizedUser} onNavigate={handleNavigate} />;
      case 'farmer_profile':
        return <FarmerProfile user={normalizedUser} onNavigate={handleNavigate} />;
      case 'farmer_directory':
        return <FarmerRegistration user={normalizedUser} />;
      case 'policy_enrollment':
        return <PolicyEnrollment user={normalizedUser} />;
      case 'loss_notification':
        return <LossNotification user={normalizedUser} />;
      case 'survey_management':
        return <SurveyManagement user={normalizedUser} />;
      case 'claim_management':
        return <ClaimManagement user={normalizedUser} />;
      case 'analytics':
        return <Analytics user={normalizedUser} />;
      case 'admin_management':
        return <AdminManagement user={normalizedUser} />;
      default:
        return <Dashboard user={normalizedUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      user={normalizedUser}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
}
