import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  { role: 'FARMER', label: 'Farmer (Ramesh)', email: 'ramesh@farmer.in', password: 'Farmer@123' },
  { role: 'INSURER', label: 'Insurer Officer', email: 'officer@insurer.com', password: 'Insurer@123' },
  { role: 'SURVEYOR', label: 'Field Surveyor', email: 'surveyor@assess.gov.in', password: 'Surveyor@123' },
  { role: 'BANK_OFFICER', label: 'Bank Officer', email: 'bank@officer.in', password: 'Bank@123' },
  { role: 'STATE_OFFICER', label: 'State Officer', email: 'state@officer.gov.in', password: 'State@123' },
  { role: 'ADMIN', label: 'System Admin', email: 'admin@cropinsure.gov.in', password: 'Admin@123' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pmfby_token');
      const storedUser = localStorage.getItem('pmfby_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse auth token from storage', e);
      localStorage.removeItem('pmfby_token');
      localStorage.removeItem('pmfby_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { token: jwtToken, ...userData } = response.data;
    localStorage.setItem('pmfby_token', jwtToken);
    localStorage.setItem('pmfby_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('pmfby_token');
    localStorage.removeItem('pmfby_user');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (targetRole) => {
    const demo = DEMO_USERS.find((d) => d.role === targetRole);
    if (demo) {
      return await login(demo.email, demo.password);
    }
    throw new Error(`Demo user for role ${targetRole} not found`);
  };

  const value = {
    user,
    token,
    role: user?.role,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    quickSwitchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
