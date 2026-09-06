import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, AlertTriangle, ClipboardCheck,
  BarChart3, Settings, LogOut, Menu, X, Bell, ChevronRight,
  Wheat, Shield, MapPin, User
} from './Icons';

const ROLE_NAV_MAP = {
  farmer: [
    { id: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'farmer_profile', label: 'My Profile & KYC', icon: <User size={18} /> },
    { id: 'policy_enrollment', label: 'My Policies & Enrollment', icon: <FileText size={18} /> },
    { id: 'loss_notification', label: 'Report Crop Damage', icon: <AlertTriangle size={18} /> },
    { id: 'claim_management', label: 'My Claims & DBT Status', icon: <Shield size={18} /> },
  ],
  bank_officer: [
    { id: 'dashboard', label: 'Bank Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'farmer_directory', label: 'Farmer Directory & KYC', icon: <Users size={18} /> },
    { id: 'policy_enrollment', label: 'Enroll Farmer Policy', icon: <FileText size={18} /> },
    { id: 'claim_management', label: 'DBT Disbursements', icon: <Shield size={18} /> },
  ],
  surveyor: [
    { id: 'dashboard', label: 'Surveyor Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'survey_management', label: 'Field Survey Inspections', icon: <ClipboardCheck size={18} /> },
  ],
  insurance_officer: [
    { id: 'dashboard', label: 'Actuarial Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'survey_management', label: 'Survey Management', icon: <ClipboardCheck size={18} /> },
    { id: 'claim_management', label: 'Claim Approvals & Settlement', icon: <Shield size={18} /> },
    { id: 'analytics', label: 'Loss Analytics & Reports', icon: <BarChart3 size={18} /> },
  ],
  state_officer: [
    { id: 'dashboard', label: 'State Agri Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'farmer_directory', label: 'Farmer Directory', icon: <Users size={18} /> },
    { id: 'survey_management', label: 'Survey Oversight', icon: <ClipboardCheck size={18} /> },
    { id: 'claim_management', label: 'Claims Overview', icon: <Shield size={18} /> },
    { id: 'analytics', label: 'PMFBY State Analytics', icon: <BarChart3 size={18} /> },
  ],
  admin: [
    { id: 'dashboard', label: 'System Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'farmer_directory', label: 'Farmer Directory', icon: <Users size={18} /> },
    { id: 'policy_enrollment', label: 'Policy Management', icon: <FileText size={18} /> },
    { id: 'loss_notification', label: 'Loss Notifications', icon: <AlertTriangle size={18} /> },
    { id: 'survey_management', label: 'Survey Management', icon: <ClipboardCheck size={18} /> },
    { id: 'claim_management', label: 'Claim Management', icon: <Shield size={18} /> },
    { id: 'analytics', label: 'Analytics & Reports', icon: <BarChart3 size={18} /> },
    { id: 'admin_management', label: 'User Lifecycle & Admin', icon: <Settings size={18} /> },
  ],
};

export const ROLE_DESIGNATIONS = {
  farmer: 'Registered Farmer',
  bank_officer: 'Senior Bank Officer',
  surveyor: 'Field Surveyor',
  insurance_officer: 'Insurance Officer',
  state_officer: 'State Agriculture Officer',
  admin: 'System Administrator',
};

const ROLE_LABELS = {
  farmer: 'Farmer',
  bank_officer: 'Bank Officer',
  surveyor: 'Field Surveyor',
  insurance_officer: 'Insurance Officer',
  state_officer: 'State Officer',
  admin: 'Administrator',
};

const ROLE_COLORS = {
  farmer: '#2E7D52',
  bank_officer: '#1B5E8A',
  surveyor: '#7B3F00',
  insurance_officer: '#6A0DAD',
  state_officer: '#C0392B',
  admin: '#374151',
};

export default function Layout({ user, currentPage, onNavigate, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const userRole = (user?.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer');
  const visibleNav = ROLE_NAV_MAP[userRole] || ROLE_NAV_MAP.farmer;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '256px' : '64px',
        minWidth: sidebarOpen ? '256px' : '64px',
        background: '#0F2744',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '72px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px',
            background: 'linear-gradient(135deg, #2E7D52, #1B5E8A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Wheat size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '0.01em' }}>AgroShield</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Crop Insurance System</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {visibleNav.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: sidebarOpen ? '10px 12px' : '10px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  position: 'relative',
                  borderLeft: active ? '3px solid #4CAF91' : '3px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {item.badge && (
                      <span style={{
                        background: '#F59E0B', color: '#000', fontSize: 10, fontWeight: 700,
                        borderRadius: '10px', padding: '1px 6px', minWidth: 20, textAlign: 'center',
                      }}>{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* District info */}
        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              <MapPin size={12} />
              <span>{user?.district || 'Madhya Pradesh'}</span>
            </div>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '10px 12px' : '10px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              borderRadius: '8px', background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 13,
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: '64px',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 6, borderRadius: 6, display: 'flex' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted-foreground)' }}>
            <span>AgroShield</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>
              {visibleNav.find(n => n.id === currentPage)?.label || 'Dashboard'}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              style={{
                background: 'none', border: '1px solid var(--border)', cursor: 'pointer',
                padding: '7px 10px', borderRadius: 8, display: 'flex', alignItems: 'center',
                color: 'var(--muted-foreground)', position: 'relative',
              }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                background: '#EF4444', borderRadius: '50%', border: '2px solid white',
              }} />
            </button>
            {notifOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '44px', width: 320,
                background: 'white', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)', zIndex: 100,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                  Notifications
                </div>
                {[
                  { text: 'Loss report #LN-2847 submitted for review', time: '2 min ago' },
                  { text: 'Survey assigned: Kharif Season, District HQ', time: '1 hr ago' },
                  { text: 'Claim #CLM-1023 approved — ₹45,200', time: '3 hr ago' },
                ].map((n, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                    <div style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 4 }}>{n.time}</div>
                  </div>
                ))}
                <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: 13, color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}>
                  View all notifications
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', textAlign: 'right' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'right' }}>{ROLE_DESIGNATIONS[userRole] || user?.designation || 'Citizen User'}</div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: ROLE_COLORS[userRole] || '#2E7D52',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.avatar || (user?.name || 'U').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
