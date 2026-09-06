import React, { useState, useEffect } from 'react';
import { Users, Shield, Settings, Activity, Plus, Search, ToggleLeft, ToggleRight, AlertTriangle, RefreshCw, CheckCircle, AlertCircle } from './Icons';
import { userApi, auditApi, authApi } from '../services/api';

const DEFAULT_USERS = [
  { id: 'ADM-001', name: 'System Administrator', email: 'admin@cropinsure.gov.in', role: 'admin', district: 'HQ', lastLogin: 'Today, 09:14', status: 'Active' },
  { id: 'SO-003', name: 'State Agriculture Officer', email: 'state@officer.gov.in', role: 'state_officer', district: 'Maharashtra', lastLogin: 'Today, 08:52', status: 'Active' },
  { id: 'I-009', name: 'Insurance Review Officer', email: 'officer@insurer.com', role: 'insurance_officer', district: 'Mumbai', lastLogin: 'Today, 10:04', status: 'Active' },
  { id: 'B-042', name: 'Bank Branch Officer', email: 'bank@officer.in', role: 'bank_officer', district: 'Pune', lastLogin: 'Yesterday, 16:30', status: 'Active' },
  { id: 'S-017', name: 'Field Surveyor Officer', email: 'surveyor@assess.gov.in', role: 'surveyor', district: 'Nagpur', lastLogin: 'Today, 07:45', status: 'Active' },
  { id: 'F-001', name: 'Farmer Ramesh', email: 'ramesh@farmer.in', role: 'farmer', district: 'Sehore', lastLogin: '10 Jul 2024', status: 'Active' },
];

const ROLE_LABEL = {
  admin: 'Administrator',
  state_officer: 'State Officer',
  insurance_officer: 'Insurance Officer',
  bank_officer: 'Bank Officer',
  surveyor: 'Field Surveyor',
  farmer: 'Farmer',
};

const ROLE_COLORS = {
  admin: '#374151',
  state_officer: '#C0392B',
  insurance_officer: '#6A0DAD',
  bank_officer: '#1B5E8A',
  surveyor: '#7B3F00',
  farmer: '#2E7D52',
};

const DEFAULT_AUDIT_LOGS = [
  { timestamp: 'Just now', user: 'Insurance Officer (I-009)', action: 'Claim CLM-2847 approved', module: 'Claims', severity: 'info' },
  { timestamp: '12 mins ago', user: 'Field Surveyor (S-017)', action: 'Survey SRV-1040 submitted — 72% loss', module: 'Survey', severity: 'info' },
  { timestamp: '45 mins ago', user: 'System Admin (ADM-001)', action: 'Surveyor S-018 assigned to Nashik District', module: 'Admin', severity: 'warning' },
  { timestamp: '2 hours ago', user: 'Insurance Officer (I-009)', action: 'Claim CLM-2843 reviewed', module: 'Claims', severity: 'info' },
  { timestamp: '3 hours ago', user: 'Bank Officer (B-042)', action: 'Farmer registration KYC verified', module: 'Registration', severity: 'info' },
  { timestamp: '5 hours ago', user: 'PFMS Gateway', action: 'Scheduled disbursement batch #DB-487 run — ₹14.2 Cr', module: 'System', severity: 'success' },
];

const SEV_COLORS = {
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  success: { bg: '#DCFCE7', text: '#166534' },
  error: { bg: '#FEE2E2', text: '#991B1B' },
};

const SYSTEM_CONFIG = [
  { key: 'Max Survey Assignment Lag', value: '72 hours', type: 'text' },
  { key: 'Claim Auto-Approval Threshold', value: '₹10,000', type: 'text' },
  { key: 'SMS & WhatsApp Notifications', value: true, type: 'toggle' },
  { key: 'Email Acknowledgement', value: true, type: 'toggle' },
  { key: 'Two-Factor Auth (OTP) for Claims', value: true, type: 'toggle' },
  { key: 'Geo-tag Mandatory for Loss Reports', value: true, type: 'toggle' },
  { key: 'Active PMFBY Season', value: 'Kharif 2024', type: 'text' },
  { key: 'System Maintenance Mode', value: false, type: 'toggle' },
];

export default function AdminManagement({ user }) {
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [config, setConfig] = useState(SYSTEM_CONFIG);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // User provisioning modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: 'Official@123',
    role: 'SURVEYOR',
    district: 'Nashik',
  });

  const handleCreateUser = async (e) => {
    e?.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.phoneNumber) {
      setErrorMessage('Please fill in user name, email, and 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await authApi.register({
        name: userForm.name,
        email: userForm.email,
        phoneNumber: userForm.phoneNumber,
        password: userForm.password || 'Official@123',
        role: userForm.role,
      });
      setActionSuccess(`Account for "${userForm.name}" with role ${userForm.role} provisioned successfully!`);
      setShowAddUserModal(false);
      setUserForm({
        name: '',
        email: '',
        phoneNumber: '',
        password: 'Official@123',
        role: 'SURVEYOR',
        district: 'Nashik',
      });
      await fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      setErrorMessage(err.message || 'Failed to provision user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map(u => ({
          id: `USR-${u.id}`,
          rawId: u.id,
          name: u.name,
          email: u.email,
          role: (u.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer'),
          district: u.district || 'State HQ',
          lastLogin: 'Active Today',
          status: u.status === 'ACTIVE' || u.active !== false ? 'Active' : 'Suspended',
        }));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('User directory backend fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!u.rawId) {
      setUsers(prev => prev.filter(x => x.id !== u.id));
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})?`)) {
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await userApi.deleteUser(u.rawId);
      setActionSuccess(`User account "${u.name}" deleted successfully.`);
      await fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setErrorMessage(err.message || 'Failed to delete user account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await auditApi.getAll();
      const list = res.data?.data || res.data;
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map(log => ({
          timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent',
          user: log.userName || `User #${log.userId || 'System'}`,
          action: log.action || log.description || 'System operation executed',
          module: log.entityType || 'General',
          severity: log.action?.includes('DELETE') || log.action?.includes('REJECT') ? 'warning' : 'info',
        }));
        setAuditLogs(mapped);
      }
    } catch (err) {
      console.warn('Audit logs fetch fallback:', err);
    }
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const toggleConfig = (key) => {
    setConfig(prev => prev.map(c => c.key === key ? { ...c, value: !c.value } : c));
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', margin: 0 }}>Admin Management</h1>
        <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>System administration, user access control, and audit logs</p>
      </div>

      {actionSuccess && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 8, background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {errorMessage && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 8, background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', val: users.length.toLocaleString(), icon: <Users size={20} />, color: '#1B5E8A' },
          { label: 'Active Sessions', val: '28', icon: <Activity size={20} />, color: '#2E7D52' },
          { label: 'Pending Approvals', val: '5', icon: <Shield size={20} />, color: '#D97706' },
          { label: 'System Uptime', val: '99.98%', icon: <Settings size={20} />, color: '#6A0DAD' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color, flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2332', letterSpacing: '-0.02em' }}>{k.val}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
        {[
          { id: 'users', label: 'User Directory', count: users.length },
          { id: 'audit', label: 'Audit Trail & Logs', count: auditLogs.length },
          { id: 'config', label: 'System Configuration' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
              background: activeTab === t.id ? '#0F2744' : 'transparent', color: activeTab === t.id ? 'white' : '#6B7A8D',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: activeTab === t.id ? 'rgba(255,255,255,0.2)' : '#E2E8F0', color: activeTab === t.id ? 'white' : '#4B5563' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', borderRadius: 8, padding: '6px 14px', border: '1px solid #E2E8F0', flex: 1, maxWidth: 360 }}>
              <Search size={15} color="#9CA3AF" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search user by name, ID, or role..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowAddUserModal(true)}
                style={{
                  padding: '8px 16px', borderRadius: 8, background: '#1B5E8A', color: 'white',
                  border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Plus size={14} /> Provision New User / Official
              </button>
              <button
                onClick={fetchUsers}
                style={{ padding: '8px 14px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#6B7A8D', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Provision User Modal */}
          {showAddUserModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
              <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '18px 24px', background: '#0F2744', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Provision System Account</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Create accredited surveyor, insurer, bank officer, or admin account</div>
                  </div>
                  <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
                </div>

                <form onSubmit={handleCreateUser} style={{ padding: 24 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Deshmukh"
                      value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                        System Role *
                      </label>
                      <select
                        value={userForm.role}
                        onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}
                      >
                        <option value="SURVEYOR">Field Surveyor</option>
                        <option value="INSURER">Insurance Officer</option>
                        <option value="BANK_OFFICER">Bank Officer</option>
                        <option value="STATE_OFFICER">State Agriculture Officer</option>
                        <option value="ADMIN">System Administrator</option>
                        <option value="FARMER">Farmer</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                        District Base *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pune"
                        value={userForm.district}
                        onChange={e => setUserForm({ ...userForm, district: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. anand@cropinsure.gov.in"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                        10-Digit Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={userForm.phoneNumber}
                        onChange={e => setUserForm({ ...userForm, phoneNumber: e.target.value.replace(/\D/g, '') })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                        Initial Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Official@123"
                        value={userForm.password}
                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      style={{ padding: '10px 18px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ padding: '10px 20px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                    >
                      {loading ? 'Creating...' : 'Provision User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['User ID', 'Name & Email', 'Role', 'District', 'Last Activity', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#1B5E8A', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{u.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${ROLE_COLORS[u.role] || '#374151'}15`, color: ROLE_COLORS[u.role] || '#374151' }}>
                      {ROLE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{u.district}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7A8D' }}>{u.lastLogin}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: u.status === 'Active' ? '#DCFCE7' : '#FEE2E2', color: u.status === 'Active' ? '#166534' : '#991B1B' }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: u.status === 'Active' ? '#C0392B' : '#2E7D52', fontSize: 12, fontWeight: 600 }}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Delete user account"
                        style={{
                          background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 6,
                          cursor: 'pointer', color: '#991B1B', fontSize: 11, fontWeight: 600, padding: '3px 8px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Platform Security & Compliance Logs</div>
            <button
              onClick={fetchAuditLogs}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#6B7A8D', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} /> Refresh Logs
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Timestamp', 'User', 'Action', 'Module', 'Severity'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#6B7A8D', fontFamily: 'DM Mono, monospace' }}>{log.timestamp}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#1A2332' }}>{log.user}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{log.action}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: '#F1F5F9', color: '#4B5563' }}>{log.module}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: SEV_COLORS[log.severity]?.bg || '#DBEAFE', color: SEV_COLORS[log.severity]?.text || '#1E40AF' }}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: System Config */}
      {activeTab === 'config' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>System Operational Parameters</div>
          <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 20 }}>Configure global SLAs, notification dispatchers, and automated processing rules.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {config.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{c.key}</span>
                {c.type === 'toggle' ? (
                  <button
                    onClick={() => toggleConfig(c.key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.value ? '#2E7D52' : '#9CA3AF', display: 'flex', alignItems: 'center' }}
                  >
                    {c.value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1B5E8A', fontFamily: 'DM Mono, monospace' }}>{c.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
