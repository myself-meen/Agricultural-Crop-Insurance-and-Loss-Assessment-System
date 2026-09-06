import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, FileText, AlertTriangle, CheckCircle, Clock, IndianRupee, Users, ClipboardCheck, ArrowRight, ShieldCheck } from './Icons';
import { analyticsApi, claimApi, farmerProfileApi, policyApi } from '../services/api';

const STATUS_COLORS = {
  Approved: { bg: '#DCFCE7', text: '#166534' },
  'Under Review': { bg: '#FEF3C7', text: '#92400E' },
  Pending: { bg: '#DBEAFE', text: '#1E40AF' },
  Disbursed: { bg: '#EDE9FE', text: '#5B21B6' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
  SETTLED: { bg: '#EDE9FE', text: '#5B21B6' },
  APPROVED: { bg: '#DCFCE7', text: '#166534' },
  LEVEL1_APPROVED: { bg: '#FEF3C7', text: '#92400E' },
  CLAIM_INITIATED: { bg: '#DBEAFE', text: '#1E40AF' },
};

export default function Dashboard({ user, onNavigate }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realClaims, setRealClaims] = useState([]);
  const [hasKycProfile, setHasKycProfile] = useState(true);

  // Dynamic Chart States
  const [claimsData, setClaimsData] = useState([
    { month: 'Apr', submitted: 4, approved: 3, disbursed: 2 },
    { month: 'May', submitted: 8, approved: 7, disbursed: 5 },
    { month: 'Jun', submitted: 14, approved: 12, disbursed: 10 },
    { month: 'Jul', submitted: 22, approved: 18, disbursed: 15 },
  ]);

  const [cropLossData, setCropLossData] = useState([
    { crop: 'Paddy', loss: 45 },
    { crop: 'Wheat', loss: 32 },
    { crop: 'Cotton', loss: 28 },
    { crop: 'Soybean', loss: 24 },
    { crop: 'Maize', loss: 18 },
  ]);

  const userRole = (user?.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer');

  useEffect(() => {
    loadLiveMetrics();
  }, [user]);

  const loadLiveMetrics = async () => {
    try {
      const [anRes, clRes, polRes] = await Promise.allSettled([
        analyticsApi.getDashboardAnalytics(),
        claimApi.getAllClaims(),
        policyApi.getAllPolicies(),
      ]);
      if (anRes.status === 'fulfilled') setAnalyticsData(anRes.value.data?.data || anRes.value.data);
      const claimsList = clRes.status === 'fulfilled' ? (clRes.value.data?.data || clRes.value.data || []) : [];
      setRealClaims(claimsList);

      const polList = polRes.status === 'fulfilled' ? (polRes.value.data?.data || polRes.value.data || []) : [];

      // Dynamically compute crop loss percentages if data exists
      if (claimsList.length > 0 || polList.length > 0) {
        const cropTotals = {};
        claimsList.forEach(c => {
          const cp = c.cropName || c.lossNotification?.policy?.cropName || 'Paddy';
          const lp = c.lossPercent || c.assessedLossPercentage || 50;
          if (!cropTotals[cp]) cropTotals[cp] = { count: 0, sumLoss: 0 };
          cropTotals[cp].count += 1;
          cropTotals[cp].sumLoss += Number(lp);
        });

        const computedCrops = Object.entries(cropTotals).map(([crop, data]) => ({
          crop,
          loss: Math.round(data.sumLoss / data.count),
        }));

        if (computedCrops.length > 0) {
          setCropLossData(computedCrops);
        }

        const totalSubmitted = claimsList.length;
        const totalApproved = claimsList.filter(c => c.status === 'APPROVED' || c.status === 'SETTLED' || c.status === 'LEVEL2_APPROVED').length;
        const totalDisbursed = claimsList.filter(c => c.status === 'SETTLED' || c.status === 'PAID').length;

        setClaimsData([
          { month: 'Apr', submitted: Math.max(1, Math.round(totalSubmitted * 0.2)), approved: Math.max(1, Math.round(totalApproved * 0.2)), disbursed: Math.max(0, Math.round(totalDisbursed * 0.2)) },
          { month: 'May', submitted: Math.max(2, Math.round(totalSubmitted * 0.4)), approved: Math.max(2, Math.round(totalApproved * 0.4)), disbursed: Math.max(1, Math.round(totalDisbursed * 0.4)) },
          { month: 'Jun', submitted: Math.max(3, Math.round(totalSubmitted * 0.7)), approved: Math.max(2, Math.round(totalApproved * 0.7)), disbursed: Math.max(1, Math.round(totalDisbursed * 0.7)) },
          { month: 'Jul', submitted: totalSubmitted, approved: totalApproved, disbursed: totalDisbursed },
        ]);
      }

      // Check KYC completion for farmer
      if (userRole === 'farmer' && user?.id) {
        farmerProfileApi.getProfile(user.id).then(res => {
          const data = res.data?.data || res.data;
          setHasKycProfile(!!(data && data.id));
        }).catch(() => {
          setHasKycProfile(false);
        });
      }
    } catch (e) {
      console.warn('Live metrics load error', e);
    }
  };

  const ROLE_KPIS = {
    farmer: [
      { label: 'Active Policies', value: String(analyticsData?.totalPolicies || 3), sub: 'Kharif & Rabi seasons', icon: <FileText size={20} />, trend: 0, color: '#1B5E8A' },
      { label: 'Pending Claims', value: String(realClaims.filter(c => c.status === 'CLAIM_INITIATED' || c.status === 'Pending').length || 1), sub: 'Under review', icon: <Clock size={20} />, trend: 0, color: '#D97706' },
      { label: 'Total Disbursed', value: `₹${(analyticsData?.totalDisbursedAmount || 124500).toLocaleString()}`, sub: 'Direct Benefit Transfer', icon: <IndianRupee size={20} />, trend: 12, color: '#2E7D52' },
      { label: 'Loss Reports', value: '2', sub: 'Submitted with GPS', icon: <AlertTriangle size={20} />, trend: 0, color: '#C0392B' },
    ],
    bank_officer: [
      { label: 'Enrolled Farmers', value: '2,847', sub: '+143 this month', icon: <Users size={20} />, trend: 5.3, color: '#1B5E8A' },
      { label: 'Active Policies', value: String(analyticsData?.totalPolicies || '4,219'), sub: 'Across all crops', icon: <FileText size={20} />, trend: 8.1, color: '#2E7D52' },
      { label: 'Pending Approvals', value: '67', sub: 'Requires action', icon: <Clock size={20} />, trend: -3.2, color: '#D97706' },
      { label: 'Total Premium', value: '₹3.2 Cr', sub: 'Collected YTD', icon: <IndianRupee size={20} />, trend: 14.7, color: '#6A0DAD' },
    ],
    surveyor: [
      { label: 'Assigned Surveys', value: '18', sub: 'This week', icon: <ClipboardCheck size={20} />, trend: 0, color: '#1B5E8A' },
      { label: 'Completed', value: '52', sub: 'This month', icon: <CheckCircle size={20} />, trend: 22, color: '#2E7D52' },
      { label: 'Pending', value: '6', sub: 'Overdue: 2', icon: <Clock size={20} />, trend: -15, color: '#D97706' },
      { label: 'Area Covered', value: '1,240 ha', sub: 'Surveyed YTD', icon: <AlertTriangle size={20} />, trend: 9.4, color: '#7B3F00' },
    ],
    insurance_officer: [
      { label: 'Claims Received', value: String(analyticsData?.totalClaims || 523), sub: 'Current season', icon: <FileText size={20} />, trend: 8.7, color: '#1B5E8A' },
      { label: 'Under Review', value: String(realClaims.filter(c => c.status === 'CLAIM_INITIATED' || c.status === 'LEVEL1_APPROVED').length || 89), sub: '2-tier pipeline', icon: <Clock size={20} />, trend: -12, color: '#D97706' },
      { label: 'Settlement Ratio', value: `${(analyticsData?.claimSettlementRatio || 76.1).toFixed(1)}%`, sub: 'Statutory target: >90%', icon: <CheckCircle size={20} />, trend: 3.4, color: '#2E7D52' },
      { label: 'Amount Disbursed', value: `₹${((analyticsData?.totalDisbursedAmount || 24700000) / 10000000).toFixed(1)} Cr`, sub: 'DBT cleared', icon: <IndianRupee size={20} />, trend: 18.2, color: '#6A0DAD' },
    ],
    state_officer: [
      { label: 'Total Farmers', value: '1,24,890', sub: 'Registered statewide', icon: <Users size={20} />, trend: 6.8, color: '#1B5E8A' },
      { label: 'Active Claims', value: String(analyticsData?.totalClaims || '8,734'), sub: 'Current season', icon: <FileText size={20} />, trend: 11.2, color: '#2E7D52' },
      { label: 'Disbursements', value: `₹${((analyticsData?.totalDisbursedAmount || 142000000) / 10000000).toFixed(1)} Cr`, sub: 'Released this year', icon: <IndianRupee size={20} />, trend: 23.1, color: '#C0392B' },
      { label: 'District Coverage', value: '34/36', sub: 'Districts active', icon: <CheckCircle size={20} />, trend: 5.9, color: '#D97706' },
    ],
    admin: [
      { label: 'Total Enrolled Policies', value: String(analyticsData?.totalPolicies || '12,847'), sub: 'Verified in grid', icon: <Users size={20} />, trend: 2.4, color: '#1B5E8A' },
      { label: 'Settlement Ratio', value: `${(analyticsData?.claimSettlementRatio || 99.9).toFixed(1)}%`, sub: 'Efficiency KPI', icon: <CheckCircle size={20} />, trend: 0.1, color: '#2E7D52' },
      { label: 'Claims Recorded', value: String(analyticsData?.totalClaims || '234'), sub: 'Actuarial review', icon: <Clock size={20} />, trend: -8.3, color: '#D97706' },
      { label: 'Total DBT Disbursed', value: `₹${(analyticsData?.totalDisbursedAmount || 38700000).toLocaleString()}`, sub: 'Direct bank payout', icon: <IndianRupee size={20} />, trend: 19.6, color: '#6A0DAD' },
    ],
  };

  const kpis = ROLE_KPIS[userRole] || ROLE_KPIS.admin;
  const showCharts = ['insurance_officer', 'state_officer', 'admin', 'bank_officer'].includes(userRole);

  const displayClaims = realClaims.length > 0 ? realClaims.slice(0, 5).map(c => ({
    id: `CLM-${c.id}`,
    farmer: c.farmerName || user?.name || 'Registered Farmer',
    crop: c.cropName || 'Paddy',
    district: c.district || user?.district || 'Nashik',
    amount: `₹${(c.claimAmount || 0).toLocaleString()}`,
    status: c.status === 'SETTLED' ? 'Disbursed' : c.status === 'APPROVED' ? 'Approved' : c.status === 'LEVEL1_APPROVED' ? 'Under Review' : 'Pending',
    date: c.claimDate || 'Recent',
  })) : [];

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0] || (userRole === 'farmer' ? 'Farmer' : 'Officer')} 👋
        </h1>
        <p style={{ fontSize: 14, color: '#6B7A8D', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {user?.designation || (userRole === 'farmer' ? 'Registered Farmer' : 'PMFBY Officer')}
        </p>
      </div>

      {/* KYC Alert Banner for Farmers */}
      {userRole === 'farmer' && !hasKycProfile && (
        <div style={{
          marginBottom: 24, padding: '18px 22px', borderRadius: 12,
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '1.5px solid #F59E0B',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#F59E0B25', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} color="#D97706" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E' }}>
                Action Required: Complete Your Farmer KYC Profile
              </div>
              <div style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>
                Your Aadhaar and DBT bank account are not yet linked. Complete your KYC profile now to unlock policy enrollment and claim settlements.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('farmer_profile')}
            style={{
              padding: '10px 20px', borderRadius: 8, background: '#D97706', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
            }}
          >
            Complete KYC Profile →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12, padding: '20px 20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 80, height: 80,
              background: `${kpi.color}08`, borderRadius: '0 12px 0 80px',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${kpi.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: kpi.color,
              }}>
                {kpi.icon}
              </div>
              {kpi.trend !== 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: kpi.trend > 0 ? '#2E7D52' : '#C0392B' }}>
                  {kpi.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', letterSpacing: '-0.02em', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {showCharts && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Claims trend */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Claims Overview — 2026</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Monthly submitted, approved, and disbursed</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={claimsData}>
                <defs>
                  <linearGradient id="cgSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B5E8A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1B5E8A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cgDisbursed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D52" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2E7D52" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0F2744', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }} />
                <Area type="monotone" dataKey="submitted" stroke="#1B5E8A" fill="url(#cgSubmitted)" strokeWidth={2} name="Submitted" />
                <Area type="monotone" dataKey="disbursed" stroke="#2E7D52" fill="url(#cgDisbursed)" strokeWidth={2} name="Disbursed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crop loss breakdown */}
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Crop Loss by Commodity (%)</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Avg assessed damage percentage</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cropLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="crop" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: '#0F2744', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }} />
                <Bar dataKey="loss" fill="#2E7D52" radius={[4, 4, 0, 0]} name="Loss %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Farmer Fast Actions */}
      {userRole === 'farmer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Enroll New Crop Policy', desc: 'Apply for Kharif/Rabi subsidized insurance', action: () => onNavigate('policy_enrollment'), color: '#2E7D52', icon: <FileText size={22} /> },
            { label: 'Intimate Crop Loss', desc: 'Submit geo-tagged damage notice within 72 hrs', action: () => onNavigate('loss_notification'), color: '#C0392B', icon: <AlertTriangle size={22} /> },
            { label: 'Track Claim & DBT Status', desc: 'Check bank credit reference & UTR number', action: () => onNavigate('claim_management'), color: '#1B5E8A', icon: <IndianRupee size={22} /> },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              style={{
                background: 'white', borderRadius: 12, padding: '20px', border: `1px solid ${item.color}30`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#6B7A8D', lineHeight: 1.4 }}>{item.desc}</div>
              </div>
              <ArrowRight size={16} color="#9CA3AF" style={{ marginTop: 4 }} />
            </button>
          ))}
        </div>
      )}

      {/* Recent Claims Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Recent Insurance Claims</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Latest claims recorded in PMFBY national grid</div>
          </div>
          <button
            onClick={() => onNavigate('claim_management')}
            style={{ fontSize: 13, color: '#1B5E8A', fontWeight: 600, background: 'none', border: '1px solid #1B5E8A', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Claim ID', 'Farmer', 'Crop', 'District', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '36px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', marginBottom: 8 }}>
                      <FileText size={22} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No Recent Claims Found</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                      {userRole === 'farmer' ? 'You have no active crop insurance claims on file.' : 'No claims currently recorded in the system.'}
                    </div>
                  </td>
                </tr>
              ) : (
                displayClaims.map((claim, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1B5E8A', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{claim.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1A2332', fontWeight: 500 }}>{claim.farmer}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{claim.crop}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{claim.district}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1A2332', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{claim.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: STATUS_COLORS[claim.status]?.bg || '#F1F5F9',
                        color: STATUS_COLORS[claim.status]?.text || '#374151',
                      }}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>{claim.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
