import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, FileText, AlertTriangle, CheckCircle, Clock, IndianRupee, Users, ClipboardCheck, ArrowRight, ShieldCheck, Shield } from './Icons';
import { analyticsApi, claimApi, farmerProfileApi, policyApi, lossNotificationApi, surveyApi } from '../services/api';

const STATUS_COLORS = {
  Approved: { bg: '#DCFCE7', text: '#166534' },
  'Level 1 Approved': { bg: '#EDE9FE', text: '#5B21B6' },
  'Under Review': { bg: '#FEF3C7', text: '#92400E' },
  Pending: { bg: '#DBEAFE', text: '#1E40AF' },
  Disbursed: { bg: '#DCFCE7', text: '#166534' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
  SETTLED: { bg: '#DCFCE7', text: '#166534' },
  PAID: { bg: '#DCFCE7', text: '#166534' },
  APPROVED: { bg: '#DCFCE7', text: '#166534' },
  LEVEL1_APPROVED: { bg: '#EDE9FE', text: '#5B21B6' },
  INITIATED: { bg: '#FEF3C7', text: '#92400E' },
};

export default function Dashboard({ user, onNavigate }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [farmerStats, setFarmerStats] = useState({
    policies: [],
    claims: [],
    losses: [],
    totalSumInsured: 0,
    totalDisbursed: 0,
  });
  const [surveyorStats, setSurveyorStats] = useState({
    assigned: 0,
    completed: 0,
    surveys: [],
  });
  const [allClaims, setAllClaims] = useState([]);
  const [hasKycProfile, setHasKycProfile] = useState(true);
  const [loading, setLoading] = useState(false);

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
  const isFarmer = userRole === 'farmer';
  const isSurveyor = userRole === 'surveyor';

  useEffect(() => {
    loadRoleData();
  }, [user]);

  const loadRoleData = async () => {
    try {
      setLoading(true);

      if (isFarmer && user?.id) {
        // Strict farmer isolation: ONLY load farmer's own policies, claims, loss notifications, and KYC
        const [polRes, clmRes, lossRes, kycRes] = await Promise.allSettled([
          policyApi.getPoliciesByFarmer(user.id),
          claimApi.getClaimsByFarmer(user.id),
          lossNotificationApi.getLossByFarmer(user.id),
          farmerProfileApi.getProfile(user.id),
        ]);

        const policies = polRes.status === 'fulfilled' ? (polRes.value.data?.data || polRes.value.data || []) : [];
        const claims = clmRes.status === 'fulfilled' ? (clmRes.value.data?.data || clmRes.value.data || []) : [];
        const losses = lossRes.status === 'fulfilled' ? (lossRes.value.data?.data || lossRes.value.data || []) : [];

        const totalSumInsured = policies.reduce((acc, p) => acc + (Number(p.sumInsured) || 0), 0);
        const totalDisbursed = claims
          .filter(c => c.status === 'PAID' || c.status === 'SETTLED')
          .reduce((acc, c) => acc + (Number(c.approvedAmount) || Number(c.claimedAmount) || 0), 0);

        setFarmerStats({
          policies,
          claims,
          losses,
          totalSumInsured,
          totalDisbursed,
        });

        if (kycRes.status === 'fulfilled') {
          const kyc = kycRes.value.data?.data || kycRes.value.data;
          setHasKycProfile(!!(kyc && kyc.id));
        } else {
          setHasKycProfile(false);
        }
      } else if (isSurveyor && user?.id) {
        // Surveyor-specific metrics
        const survRes = await surveyApi.getSurveysBySurveyor(user.id);
        const sList = survRes.data?.data || survRes.data || [];
        const completed = sList.filter(s => s.status === 'SUBMITTED' || s.status === 'VERIFIED').length;
        setSurveyorStats({
          assigned: sList.length,
          completed,
          surveys: sList,
        });
      } else {
        // Officers & Admin: Global PMFBY metrics
        const [anRes, clRes] = await Promise.allSettled([
          analyticsApi.getDashboardAnalytics(),
          claimApi.getAllClaims(),
        ]);
        if (anRes.status === 'fulfilled') setAnalyticsData(anRes.value.data?.data || anRes.value.data);
        if (clRes.status === 'fulfilled') setAllClaims(clRes.value.data?.data || clRes.value.data || []);
      }
    } catch (e) {
      console.warn('Dashboard data fetch fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  // Farmer KPIs
  const farmerKpis = [
    { label: 'My Enrolled Policies', value: String(farmerStats.policies.length), sub: 'Active crop insurance', icon: <FileText size={20} />, trend: 0, color: '#1B5E8A' },
    { label: 'Total Sum Insured', value: `₹${farmerStats.totalSumInsured.toLocaleString()}`, sub: 'PMFBY crop coverage', icon: <Shield size={20} />, trend: 0, color: '#2E7D52' },
    { label: 'Crop Loss Intimations', value: String(farmerStats.losses.length), sub: 'Geo-tagged notices', icon: <AlertTriangle size={20} />, trend: 0, color: '#C0392B' },
    { label: 'DBT Payouts Received', value: `₹${farmerStats.totalDisbursed.toLocaleString()}`, sub: 'Transferred to bank', icon: <IndianRupee size={20} />, trend: 0, color: '#166534' },
  ];

  // Surveyor KPIs
  const surveyorKpis = [
    { label: 'Assigned Inspections', value: String(surveyorStats.assigned), sub: 'In active queue', icon: <ClipboardCheck size={20} />, trend: 0, color: '#1B5E8A' },
    { label: 'Completed Assessments', value: String(surveyorStats.completed), sub: 'Reports submitted', icon: <CheckCircle size={20} />, trend: 0, color: '#2E7D52' },
    { label: 'Pending Visits', value: String(Math.max(0, surveyorStats.assigned - surveyorStats.completed)), sub: 'Action required', icon: <Clock size={20} />, trend: 0, color: '#D97706' },
    { label: 'Field Coverage Base', value: user?.district || 'Nashik', sub: 'Assigned district', icon: <AlertTriangle size={20} />, trend: 0, color: '#7B3F00' },
  ];

  // Officer / Admin KPIs
  const officerKpis = [
    { label: 'Total Enrolled Policies', value: String(analyticsData?.totalPolicies || '1,420'), sub: 'Across Kharif & Rabi', icon: <FileText size={20} />, trend: 5.2, color: '#1B5E8A' },
    { label: 'Loss Intimations', value: String(analyticsData?.totalLossNotifications || '89'), sub: 'Field damage notices', icon: <AlertTriangle size={20} />, trend: -2.1, color: '#D97706' },
    { label: 'Claims Recorded', value: String(analyticsData?.totalClaims || '64'), sub: 'Under review & approved', icon: <Shield size={20} />, trend: 8.4, color: '#6A0DAD' },
    { label: 'Total DBT Disbursed', value: `₹${(analyticsData?.totalDisbursed || 1850000).toLocaleString()}`, sub: 'Direct benefit transfers', icon: <IndianRupee size={20} />, trend: 14.5, color: '#2E7D52' },
  ];

  const currentKpis = isFarmer ? farmerKpis : isSurveyor ? surveyorKpis : officerKpis;
  const showCharts = ['insurance_officer', 'state_officer', 'admin', 'bank_officer'].includes(userRole);

  // Table items strictly scoped to role
  const displayClaims = isFarmer
    ? farmerStats.claims.slice(0, 5).map(c => ({
        id: c.claimNumber || `CLM-${c.id}`,
        farmer: user?.name || 'You',
        crop: c.cropName || 'Paddy',
        district: c.district || user?.district || 'Nashik',
        amount: `₹${(c.approvedAmount || c.claimedAmount || 0).toLocaleString()}`,
        status: c.status === 'PAID' || c.status === 'SETTLED' ? 'Disbursed' : c.status === 'APPROVED' ? 'Approved' : c.status === 'LEVEL1_APPROVED' ? 'Level 1 Approved' : 'Under Review',
        date: c.disbursedDate || 'Recent',
      }))
    : allClaims.slice(0, 5).map(c => ({
        id: c.claimNumber || `CLM-${c.id}`,
        farmer: c.farmerName || 'Farmer',
        crop: c.cropName || 'Paddy',
        district: c.district || 'District',
        amount: `₹${(c.approvedAmount || c.claimedAmount || 0).toLocaleString()}`,
        status: c.status === 'PAID' || c.status === 'SETTLED' ? 'Disbursed' : c.status === 'APPROVED' ? 'Approved' : c.status === 'LEVEL1_APPROVED' ? 'Level 1 Approved' : 'Under Review',
        date: c.disbursedDate || 'Recent',
      }));

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', margin: 0 }}>
          Welcome back, {user?.name?.split(' ')[0] || (isFarmer ? 'Farmer' : 'Officer')} 👋
        </h1>
        <p style={{ fontSize: 14, color: '#6B7A8D', margin: '4px 0 0' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {user?.designation || (isFarmer ? 'Registered PMFBY Farmer' : 'PMFBY Officer')}
        </p>
      </div>

      {/* KYC Alert Banner for Farmers */}
      {isFarmer && !hasKycProfile && (
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
                Link your 12-digit Aadhaar and DBT bank account to receive claim settlements and enrollment subsidies.
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
        {currentKpis.map((kpi, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 12, padding: '20px',
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
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', letterSpacing: '-0.02em', marginBottom: 4 }}>{kpi.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Farmer Quick Actions */}
      {isFarmer && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Enroll Crop Insurance Policy', desc: 'Enroll land & calculate PMFBY subsidized premium', action: () => onNavigate('policy_enrollment'), color: '#2E7D52', icon: <FileText size={22} /> },
            { label: 'Report Crop Damage / Loss', desc: 'Submit geo-tagged damage notice with field photos', action: () => onNavigate('loss_notification'), color: '#C0392B', icon: <AlertTriangle size={22} /> },
            { label: 'My Claims & DBT Compensation', desc: 'Track actuarial approvals and bank UTR transfers', action: () => onNavigate('claim_management'), color: '#1B5E8A', icon: <IndianRupee size={22} /> },
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

      {/* Surveyor Fast Actions */}
      {isSurveyor && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 28 }}>
          <button
            onClick={() => onNavigate('survey_management')}
            style={{
              background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #1B5E8A30',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#1B5E8A15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1B5E8A' }}>
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332' }}>View Assigned Survey Tasks ({surveyorStats.assigned})</div>
              <div style={{ fontSize: 12, color: '#6B7A8D', marginTop: 2 }}>Conduct ground yield assessment and capture geo-evidence</div>
            </div>
          </button>
          <button
            onClick={() => onNavigate('survey_management')}
            style={{
              background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #2E7D5230',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#2E7D5215', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D52' }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332' }}>Submit Inspection Assessment Report</div>
              <div style={{ fontSize: 12, color: '#6B7A8D', marginTop: 2 }}>Record assessed yield loss % and upload site photos</div>
            </div>
          </button>
        </div>
      )}

      {/* Charts row for Officers */}
      {showCharts && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 28 }}>
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

      {/* Claims Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>
              {isFarmer ? 'My Insurance Claims & DBT Settlements' : 'Recent Insurance Claims'}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
              {isFarmer ? 'Real-time status of your crop insurance compensation claims' : 'Latest claims recorded in PMFBY national grid'}
            </div>
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
                      <ShieldCheck size={22} color="#94A3B8" />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>
                      {isFarmer ? 'No insurance claims filed yet' : 'No claims recorded in the system'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                      {isFarmer ? 'When a crop loss is reported and verified, your claim will appear here.' : 'Submitted claims will be listed here.'}
                    </div>
                  </td>
                </tr>
              ) : (
                displayClaims.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#1B5E8A', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{c.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: '#1A2332' }}>{c.farmer}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{c.crop}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{c.district}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1A2332', fontFamily: 'DM Mono, monospace' }}>{c.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 600,
                        background: STATUS_COLORS[c.status]?.bg || '#DBEAFE',
                        color: STATUS_COLORS[c.status]?.text || '#1E40AF'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#9CA3AF' }}>{c.date}</td>
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
