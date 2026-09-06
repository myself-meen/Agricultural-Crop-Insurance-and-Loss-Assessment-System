import React, { useState } from 'react';
import { Wheat, Eye, EyeOff, ShieldCheck, AlertCircle } from './Icons';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export const DEMO_CREDENTIALS = [
  { role: 'farmer', label: 'Farmer', id: '2', email: 'ramesh@farmer.in', pass: 'Farmer@123', color: '#2E7D52', name: 'Farmer Ramesh', designation: 'Registered Farmer', district: 'Sehore, MP' },
  { role: 'bank_officer', label: 'Bank Officer', id: '5', email: 'bank@officer.in', pass: 'Bank@123', color: '#1B5E8A', name: 'Bank Officer', designation: 'Senior Bank Officer', district: 'Pune' },
  { role: 'surveyor', label: 'Field Surveyor', id: '4', email: 'surveyor@assess.gov.in', pass: 'Surveyor@123', color: '#7B3F00', name: 'Surveyor Officer', designation: 'Field Surveyor', district: 'Nagpur' },
  { role: 'insurance_officer', label: 'Insurance Officer', id: '3', email: 'officer@insurer.com', pass: 'Insurer@123', color: '#6A0DAD', name: 'Insurer Officer', designation: 'Insurance Officer', district: 'Mumbai' },
  { role: 'state_officer', label: 'State Officer', id: '6', email: 'state@officer.gov.in', pass: 'State@123', color: '#C0392B', name: 'State Officer', designation: 'State Agriculture Officer', district: 'Maharashtra' },
  { role: 'admin', label: 'Administrator', id: '1', email: 'admin@cropinsure.gov.in', pass: 'Admin@123', color: '#374151', name: 'System Admin', designation: 'System Administrator', district: 'HQ' },
];

export default function Login({ onLogin }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [userId, setUserId] = useState('ramesh@farmer.in');
  const [password, setPassword] = useState('Farmer@123');
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Registration state
  const [regData, setRegData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER',
  });

  const handleRoleSelect = (cred) => {
    setSelectedRole(cred.role);
    setUserId(cred.email);
    setPassword(cred.pass);
    setErrorMessage(null);
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const authData = await login({ identifier: userId, email: userId, password });
      const jwtToken = authData?.token;

      const roleStr = (authData?.role || selectedRole).toLowerCase().replace('insurer', 'insurance_officer');
      const cred = DEMO_CREDENTIALS.find(d => d.role === roleStr) || DEMO_CREDENTIALS[0];

      const userObj = {
        id: String(authData?.userId || authData?.id || cred.id),
        name: authData?.name || cred.name,
        role: roleStr,
        designation: cred.designation,
        district: cred.district,
        avatar: (authData?.name || cred.name).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: authData?.email || userId,
        token: jwtToken,
      };

      onLogin(userObj);
    } catch (err) {
      console.error('Backend login error:', err);
      setErrorMessage(err.message || 'Invalid credentials or server unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);

    if (!regData.name.trim() || !/^[a-zA-Z\s]+$/.test(regData.name.trim())) {
      setErrorMessage('Please enter a valid full name (alphabets only).');
      return;
    }
    const cleanPhone = regData.phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits.');
      return;
    }
    if (!regData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const regRes = await authApi.register({
        name: regData.name.trim(),
        phoneNumber: cleanPhone,
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
        role: regData.role,
      });

      // Auto login with new credentials
      const authData = await login({
        identifier: regData.email.trim().toLowerCase(),
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
      });

      const roleStr = (authData?.role || regData.role).toLowerCase().replace('insurer', 'insurance_officer');
      const cred = DEMO_CREDENTIALS.find(d => d.role === roleStr) || {
        designation: roleStr === 'farmer' ? 'Registered Farmer' : 'Portal User',
        district: 'Nashik',
      };

      const userObj = {
        id: String(authData?.userId || authData?.id),
        name: authData?.name || regData.name.trim(),
        role: roleStr,
        designation: cred.designation,
        district: cred.district,
        avatar: (regData.name.trim()).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        email: authData?.email || regData.email,
        token: authData?.token,
      };

      onLogin(userObj);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage(err.message || 'Failed to create account. Email or phone may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0F2744 0%, #1B5E8A 50%, #0F3D2E 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', color: 'white',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}>
            <Wheat size={26} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>AgroShield</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Government of India
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Agricultural Crop Insurance &<br />Loss Assessment System
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 420, margin: '0 0 48px' }}>
          Pradhan Mantri Fasal Bima Yojana — Empowering farmers with transparent, technology-driven crop insurance.
        </p>

        {/* Feature pills */}
        {[
          { icon: '🌾', text: 'Geo-tagged loss reporting with GPS evidence' },
          { icon: '📋', text: 'Two-tier actuarial claim verification pipeline' },
          { icon: '💳', text: 'Direct Benefit Transfer (DBT) to bank accounts' },
          { icon: '📊', text: 'Real-time national analytics and audit dashboard' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>{f.text}</span>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: '16px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <ShieldCheck size={15} color="#4CAF91" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4CAF91', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Secure & Compliant</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
            This system is secured with 256-bit encryption and complies with MeitY guidelines for government digital services.
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'white', padding: '48px 48px',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 4, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === 'login' ? 700 : 500,
                background: activeTab === 'login' ? 'white' : 'transparent',
                color: activeTab === 'login' ? '#1B5E8A' : '#64748B',
                boxShadow: activeTab === 'login' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 14, fontWeight: activeTab === 'register' ? 700 : 500,
                background: activeTab === 'register' ? 'white' : 'transparent',
                color: activeTab === 'register' ? '#2E7D52' : '#64748B',
                boxShadow: activeTab === 'register' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Create Account
            </button>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>
            {activeTab === 'login' ? 'Sign In to AgroShield' : 'Register New Account'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 18 }}>
            {activeTab === 'login' ? 'Access your role-based PMFBY dashboard' : 'Join PMFBY to enroll policies and track crop insurance'}
          </p>

          {/* Error message */}
          {errorMessage && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 8,
              background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div>
              {/* Role selector chips */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Quick Role Select (Auto-Fills Demo Credentials)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {DEMO_CREDENTIALS.map(cred => (
                    <button
                      key={cred.role}
                      type="button"
                      onClick={() => handleRoleSelect(cred)}
                      style={{
                        padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                        border: selectedRole === cred.role ? `2px solid ${cred.color}` : '1.5px solid #E2E8F0',
                        background: selectedRole === cred.role ? `${cred.color}12` : 'white',
                        color: selectedRole === cred.role ? cred.color : '#6B7A8D',
                        fontSize: 12, fontWeight: selectedRole === cred.role ? 700 : 500,
                        fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left',
                      }}
                    >
                      {cred.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* User ID */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Email ID / Phone Number
                </label>
                <input
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1A2332',
                    fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s',
                    background: '#FAFBFD',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#1B5E8A')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8,
                      border: '1.5px solid #E2E8F0', fontSize: 14, color: '#1A2332',
                      fontFamily: 'inherit', outline: 'none', transition: 'border 0.15s',
                      background: '#FAFBFD',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#1B5E8A')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7A8D' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8, cursor: loading ? 'wait' : 'pointer',
                  background: loading ? '#6B7A8D' : 'linear-gradient(135deg, #1B5E8A, #2E7D52)',
                  border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
                  fontFamily: 'inherit', transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Authenticating with System...' : 'Sign In to AgroShield'}
              </button>
            </div>
          ) : (
            <div>
              {/* Registration Form */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <input
                  placeholder="e.g. Ramesh Kumar"
                  value={regData.name}
                  onChange={e => setRegData({ ...regData, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    10-Digit Mobile *
                  </label>
                  <input
                    placeholder="9876543210"
                    maxLength={10}
                    value={regData.phoneNumber}
                    onChange={e => setRegData({ ...regData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'DM Mono, monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Account Role
                  </label>
                  <select
                    value={regData.role}
                    onChange={e => setRegData({ ...regData, role: e.target.value })}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, background: 'white' }}
                  >
                    <option value="FARMER">Farmer / Beneficiary</option>
                    <option value="BANK_OFFICER">Bank Officer</option>
                    <option value="SURVEYOR">Field Surveyor</option>
                    <option value="INSURER">Insurance Officer</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="ramesh@farmer.in"
                  value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={regData.password}
                    onChange={e => setRegData({ ...regData, password: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={regData.confirmPassword}
                    onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13 }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8, cursor: loading ? 'wait' : 'pointer',
                  background: loading ? '#6B7A8D' : '#2E7D52',
                  border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
                  fontFamily: 'inherit', transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Registering Account...' : 'Register & Launch Dashboard →'}
              </button>
            </div>
          )}

          <div style={{ marginTop: 20, padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, color: '#1B5E8A', marginBottom: 2, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Direct Benefit Transfer (DBT) Ready
            </div>
            <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>
              New farmer registrations proceed directly to guided Aadhaar & DBT bank KYC verification on first sign-in.
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.4 }}>
            Ministry of Agriculture & Farmers Welfare<br />
            Government of India · PMFBY National Portal · © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
