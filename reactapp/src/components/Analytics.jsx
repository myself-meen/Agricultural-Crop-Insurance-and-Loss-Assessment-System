import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Download, Filter, TrendingUp, RefreshCw, IndianRupee, ShieldCheck, FileText, AlertTriangle, CheckCircle, Clock } from './Icons';
import { analyticsApi, policyApi, claimApi, lossNotificationApi, farmerProfileApi, userApi } from '../services/api';

const CAUSE_COLORS = {
  FLOOD: '#1B5E8A',
  DROUGHT: '#D97706',
  HAILSTORM: '#6A0DAD',
  PEST: '#C0392B',
  FIRE: '#DC2626',
  OTHER: '#2E7D52',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics({ user }) {
  const [period, setPeriod] = useState('All Seasons');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Raw fetched entities from live database
  const [rawPolicies, setRawPolicies] = useState([]);
  const [rawClaims, setRawClaims] = useState([]);
  const [rawLosses, setRawLosses] = useState([]);
  const [rawProfiles, setRawProfiles] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [backendKpis, setBackendKpis] = useState(null);

  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, policiesRes, claimsRes, lossesRes, profilesRes, usersRes] = await Promise.allSettled([
        analyticsApi.getDashboardAnalytics(),
        policyApi.getAllPolicies(),
        claimApi.getAllClaims(),
        lossNotificationApi.getAllLosses(),
        farmerProfileApi.getAllProfiles(),
        userApi.getAllUsers(),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setBackendKpis(analyticsRes.value.data?.data || analyticsRes.value.data);
      }
      if (policiesRes.status === 'fulfilled') {
        setRawPolicies(policiesRes.value.data?.data || policiesRes.value.data || []);
      }
      if (claimsRes.status === 'fulfilled') {
        setRawClaims(claimsRes.value.data?.data || claimsRes.value.data || []);
      }
      if (lossesRes.status === 'fulfilled') {
        setRawLosses(lossesRes.value.data?.data || lossesRes.value.data || []);
      }
      if (profilesRes.status === 'fulfilled') {
        setRawProfiles(profilesRes.value.data?.data || profilesRes.value.data || []);
      }
      if (usersRes.status === 'fulfilled') {
        setRawUsers(usersRes.value.data?.data || usersRes.value.data || []);
      }
    } catch (err) {
      console.warn('Error fetching live analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Farmer ID -> District Lookup Map
  const farmerDistrictMap = useMemo(() => {
    const map = {};
    rawProfiles.forEach(p => {
      if (p.userId && p.district) map[p.userId] = p.district.trim();
    });
    rawUsers.forEach(u => {
      if (u.id && u.address && !map[u.id]) {
        // extract district from address if present
        map[u.id] = u.address.trim();
      }
    });
    return map;
  }, [rawProfiles, rawUsers]);

  // Policy ID -> District Lookup Map
  const policyDistrictMap = useMemo(() => {
    const map = {};
    rawPolicies.forEach(p => {
      const dist = p.district || farmerDistrictMap[p.farmerId] || null;
      if (p.id && dist) map[p.id] = dist;
    });
    return map;
  }, [rawPolicies, farmerDistrictMap]);

  // Distinct list of districts present in the database across profiles, policies, and claims
  const availableDistricts = useMemo(() => {
    const set = new Set();
    rawProfiles.forEach(p => { if (p.district && p.district.trim()) set.add(p.district.trim()); });
    rawPolicies.forEach(p => {
      const d = p.district || farmerDistrictMap[p.farmerId];
      if (d && d.trim()) set.add(d.trim());
    });
    rawClaims.forEach(c => {
      const d = c.district || policyDistrictMap[c.policyId] || farmerDistrictMap[c.farmerId];
      if (d && d.trim()) set.add(d.trim());
    });
    return Array.from(set).sort();
  }, [rawProfiles, rawPolicies, rawClaims, farmerDistrictMap, policyDistrictMap]);

  // Helper function to match a policy / claim / loss with the active period filter
  const filterByPeriod = (item, type = 'policy') => {
    if (period === 'All Seasons' || period === 'All Time') return true;

    let season = '';
    let year = null;

    if (type === 'policy') {
      season = item.season || item.cropSeason || '';
      year = item.cropYear || item.year;
    } else if (type === 'claim') {
      season = item.season || '';
      year = item.cropYear || (item.claimDate ? new Date(item.claimDate).getFullYear() : null);
    } else if (type === 'loss') {
      season = item.season || '';
      year = item.lossDate ? new Date(item.lossDate).getFullYear() : null;
    }

    if (period === 'Kharif 2026') return season.toUpperCase() === 'KHARIF' && (!year || Number(year) === 2026);
    if (period === 'Rabi 2025-26') return season.toUpperCase() === 'RABI' && (!year || Number(year) === 2025 || Number(year) === 2026);
    if (period === 'Kharif 2025') return season.toUpperCase() === 'KHARIF' && (!year || Number(year) === 2025);
    if (period === 'Rabi 2024-25') return season.toUpperCase() === 'RABI' && (!year || Number(year) === 2024 || Number(year) === 2025);

    return true;
  };

  // Helper to get effective district for any record
  const getRecordDistrict = (item, type = 'policy') => {
    if (type === 'policy') {
      return item.district || farmerDistrictMap[item.farmerId] || 'Regional District';
    }
    if (type === 'claim') {
      return item.district || policyDistrictMap[item.policyId] || farmerDistrictMap[item.farmerId] || 'Regional District';
    }
    if (type === 'loss') {
      return item.district || policyDistrictMap[item.policyId] || farmerDistrictMap[item.farmerId] || 'Regional District';
    }
    return item.district || 'Regional District';
  };

  // Filtered live datasets
  const filteredPolicies = useMemo(() => {
    return rawPolicies.filter(p => {
      const matchPeriod = filterByPeriod(p, 'policy');
      const dist = getRecordDistrict(p, 'policy');
      const matchDistrict = selectedDistrict === 'ALL' || dist.toLowerCase() === selectedDistrict.toLowerCase();
      return matchPeriod && matchDistrict;
    });
  }, [rawPolicies, period, selectedDistrict, farmerDistrictMap]);

  const filteredClaims = useMemo(() => {
    return rawClaims.filter(c => {
      const matchPeriod = filterByPeriod(c, 'claim');
      const dist = getRecordDistrict(c, 'claim');
      const matchDistrict = selectedDistrict === 'ALL' || dist.toLowerCase() === selectedDistrict.toLowerCase();
      return matchPeriod && matchDistrict;
    });
  }, [rawClaims, period, selectedDistrict, policyDistrictMap, farmerDistrictMap]);

  const filteredLosses = useMemo(() => {
    return rawLosses.filter(l => {
      const matchPeriod = filterByPeriod(l, 'loss');
      const dist = getRecordDistrict(l, 'loss');
      const matchDistrict = selectedDistrict === 'ALL' || dist.toLowerCase() === selectedDistrict.toLowerCase();
      return matchPeriod && matchDistrict;
    });
  }, [rawLosses, period, selectedDistrict, policyDistrictMap, farmerDistrictMap]);

  // Dynamic Actuarial KPIs
  const kpiMetrics = useMemo(() => {
    const totalPolicies = filteredPolicies.length;
    const totalSumInsured = filteredPolicies.reduce((acc, p) => acc + Number(p.sumInsured || 0), 0);
    const totalFarmerPremium = filteredPolicies.reduce((acc, p) => acc + Number(p.premiumFarmer || 0), 0);
    const totalStateSubsidy = filteredPolicies.reduce((acc, p) => acc + Number(p.premiumState || 0), 0);
    const totalCentreSubsidy = filteredPolicies.reduce((acc, p) => acc + Number(p.premiumCentre || 0), 0);
    const totalSubsidy = totalStateSubsidy + totalCentreSubsidy;
    const totalGrossPremium = totalFarmerPremium + totalSubsidy;

    const totalLossNotifications = filteredLosses.length;
    const totalClaims = filteredClaims.length;
    const claimsApproved = filteredClaims.filter(c => c.status === 'APPROVED' || c.status === 'LEVEL2_APPROVED' || c.status === 'PAID').length;
    const claimsPaid = filteredClaims.filter(c => c.status === 'PAID').length;
    const claimsPending = filteredClaims.filter(c => c.status === 'INITIATED' || c.status === 'PENDING' || c.status === 'LEVEL1_APPROVED').length;
    const claimsRejected = filteredClaims.filter(c => c.status === 'REJECTED').length;

    const totalDisbursed = filteredClaims
      .filter(c => c.status === 'PAID')
      .reduce((acc, c) => acc + Number(c.approvedAmount || c.claimedAmount || 0), 0);

    const totalClaimLiability = filteredClaims
      .reduce((acc, c) => acc + Number(c.approvedAmount || c.claimedAmount || 0), 0);

    return {
      totalPolicies,
      totalSumInsured,
      totalFarmerPremium,
      totalSubsidy,
      totalGrossPremium,
      totalLossNotifications,
      totalClaims,
      claimsApproved,
      claimsPaid,
      claimsPending,
      claimsRejected,
      totalDisbursed,
      totalClaimLiability,
    };
  }, [filteredPolicies, filteredClaims, filteredLosses]);

  // 1. Dynamic Loss Causes (Peril Breakdown)
  const causeData = useMemo(() => {
    if (filteredLosses.length === 0) return [];
    const counts = {};
    filteredLosses.forEach(l => {
      const type = (l.lossType || 'OTHER').toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
    });

    const total = filteredLosses.length;
    return Object.entries(counts).map(([type, count]) => {
      let label = type;
      if (type === 'FLOOD') label = 'Flood / Inundation';
      else if (type === 'DROUGHT') label = 'Drought / Dry Spell';
      else if (type === 'HAILSTORM') label = 'Hailstorm';
      else if (type === 'PEST') label = 'Pest Attack';
      else if (type === 'FIRE') label = 'Crop Fire';

      return {
        name: label,
        rawType: type,
        value: parseFloat(((count / total) * 100).toFixed(1)),
        count: count,
        color: CAUSE_COLORS[type] || '#2E7D52',
      };
    });
  }, [filteredLosses]);

  // 2. Dynamic District Aggregation
  const districtData = useMemo(() => {
    const distMap = {};

    filteredPolicies.forEach(p => {
      const d = getRecordDistrict(p, 'policy');
      if (!distMap[d]) distMap[d] = { district: d, policies: 0, claims: 0, sumInsured: 0, disbursed: 0 };
      distMap[d].policies += 1;
      distMap[d].sumInsured += Number(p.sumInsured || 0);
    });

    filteredClaims.forEach(c => {
      const d = getRecordDistrict(c, 'claim');
      if (!distMap[d]) distMap[d] = { district: d, policies: 0, claims: 0, sumInsured: 0, disbursed: 0 };
      distMap[d].claims += 1;
      if (c.status === 'PAID') {
        distMap[d].disbursed += Number(c.approvedAmount || 0);
      }
    });

    return Object.values(distMap).map(d => ({
      district: d.district,
      policies: d.policies,
      claims: d.claims,
      disbursedLakhs: parseFloat((d.disbursed / 100000).toFixed(2)),
      sumInsuredLakhs: parseFloat((d.sumInsured / 100000).toFixed(2)),
    }));
  }, [filteredPolicies, filteredClaims, farmerDistrictMap, policyDistrictMap]);

  // 3. Dynamic Crop Portfolio
  const cropBreakdown = useMemo(() => {
    const cropMap = {};

    filteredPolicies.forEach(p => {
      const crop = p.cropName || 'Other Crop';
      if (!cropMap[crop]) cropMap[crop] = { crop, policies: 0, claims: 0, sumInsured: 0, disbursed: 0, acreageHa: 0 };
      cropMap[crop].policies += 1;
      cropMap[crop].sumInsured += Number(p.sumInsured || 0);
      cropMap[crop].acreageHa += Number(p.sownAreaHa || 0);
    });

    filteredClaims.forEach(c => {
      const crop = c.cropName || 'Other Crop';
      if (!cropMap[crop]) cropMap[crop] = { crop, policies: 0, claims: 0, sumInsured: 0, disbursed: 0, acreageHa: 0 };
      cropMap[crop].claims += 1;
      if (c.status === 'PAID') {
        cropMap[crop].disbursed += Number(c.approvedAmount || 0);
      }
    });

    return Object.values(cropMap).sort((a, b) => b.policies - a.policies);
  }, [filteredPolicies, filteredClaims]);

  // 4. Chronological Monthly Trend derived directly from DB Timestamps
  const monthlyTrend = useMemo(() => {
    const monthMap = {};

    // Map policies by enrollmentDate or createdDate
    filteredPolicies.forEach(p => {
      const dateStr = p.enrollmentDate || p.createdDate;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
          if (!monthMap[key]) monthMap[key] = { month: key, policies: 0, claims: 0, disbursedLakhs: 0, timestamp: d.getTime() };
          monthMap[key].policies += 1;
        }
      }
    });

    // Map claims by disbursedDate or claimDate
    filteredClaims.forEach(c => {
      const dateStr = c.disbursedDate || c.claimDate || c.level2ApprovedAt;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
          if (!monthMap[key]) monthMap[key] = { month: key, policies: 0, claims: 0, disbursedLakhs: 0, timestamp: d.getTime() };
          monthMap[key].claims += 1;
          if (c.status === 'PAID') {
            monthMap[key].disbursedLakhs += Number(c.approvedAmount || 0) / 100000;
          }
        }
      }
    });

    const list = Object.values(monthMap).sort((a, b) => a.timestamp - b.timestamp);
    if (list.length === 0) {
      const now = new Date();
      const currentMonth = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
      return [{
        month: currentMonth,
        policies: filteredPolicies.length,
        claims: filteredClaims.length,
        disbursedLakhs: parseFloat((kpiMetrics.totalDisbursed / 100000).toFixed(2)),
      }];
    }

    return list.map(item => ({
      month: item.month,
      policies: item.policies,
      claims: item.claims,
      disbursedLakhs: parseFloat(item.disbursedLakhs.toFixed(2)),
    }));
  }, [filteredPolicies, filteredClaims, kpiMetrics.totalDisbursed]);

  // Computed Settlement & Approval Ratios
  const settlementRate = kpiMetrics.totalClaims > 0
    ? ((kpiMetrics.claimsPaid / kpiMetrics.totalClaims) * 100).toFixed(1)
    : '0.0';

  const approvalRate = kpiMetrics.totalClaims > 0
    ? ((kpiMetrics.claimsApproved / kpiMetrics.totalClaims) * 100).toFixed(1)
    : '0.0';

  const handleExport = () => {
    let csv = `PMFBY ACTUARIAL & LOSS ASSESSMENT REPORT\n`;
    csv += `Generated Period: ${period}, District Filter: ${selectedDistrict}\n`;
    csv += `Generated At: ${new Date().toLocaleString()}\n\n`;

    csv += `1. EXECUTIVE KPI SUMMARY\n`;
    csv += `Total Enrolled Policies,${kpiMetrics.totalPolicies}\n`;
    csv += `Total Insured Acreage (Ha),${filteredPolicies.reduce((acc, p) => acc + Number(p.sownAreaHa || 0), 0)}\n`;
    csv += `Total Sum Insured (INR),${kpiMetrics.totalSumInsured}\n`;
    csv += `Total Gross Premium (INR),${kpiMetrics.totalGrossPremium}\n`;
    csv += `Farmer Premium Share (INR),${kpiMetrics.totalFarmerPremium}\n`;
    csv += `Government Subsidy (INR),${kpiMetrics.totalSubsidy}\n`;
    csv += `Reported Loss Notifications,${kpiMetrics.totalLossNotifications}\n`;
    csv += `Total Claims Filed,${kpiMetrics.totalClaims}\n`;
    csv += `Claims Approved,${kpiMetrics.claimsApproved}\n`;
    csv += `Claims Paid / Disbursed via DBT,${kpiMetrics.claimsPaid}\n`;
    csv += `Total DBT Disbursed (INR),${kpiMetrics.totalDisbursed}\n`;
    csv += `DBT Settlement Rate (%),${settlementRate}%\n\n`;

    csv += `2. CROP PORTFOLIO BREAKDOWN\n`;
    csv += `Crop,Policies Enrolled,Acreage (Ha),Claims Filed,Sum Insured (INR),DBT Disbursed (INR)\n`;
    cropBreakdown.forEach(c => {
      csv += `"${c.crop}",${c.policies},${c.acreageHa || 0},${c.claims},${c.sumInsured},${c.disbursed}\n`;
    });
    csv += `\n`;

    csv += `3. DISTRICT PERFORMANCE BREAKDOWN\n`;
    csv += `District,Policies,Claims,Sum Insured (Lakhs),DBT Disbursed (Lakhs)\n`;
    districtData.forEach(d => {
      csv += `"${d.district}",${d.policies},${d.claims},${d.sumInsuredLakhs},${d.disbursedLakhs}\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PMFBY_Actuarial_Analytics_${period.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A2332', margin: 0, letterSpacing: '-0.02em' }}>
              PMFBY Actuarial & Loss Analytics
            </h1>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 9999, border: '1px solid #BBF7D0' }}>
              ● Live Database Feed
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>
            Real-time actuarial aggregation calculated dynamically from active crop policies, field surveys, and DBT settlements
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Season & Year Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Season:</span>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#1E293B', outline: 'none', cursor: 'pointer' }}
            >
              <option value="All Seasons">All Seasons (Cumulative)</option>
              <option value="Kharif 2026">Kharif 2026</option>
              <option value="Rabi 2025-26">Rabi 2025-26</option>
              <option value="Kharif 2025">Kharif 2025</option>
              <option value="Rabi 2024-25">Rabi 2024-25</option>
            </select>
          </div>

          {/* District Filter */}
          {availableDistricts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>District:</span>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#1E293B', outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL">All Districts ({availableDistricts.length})</option>
                {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={fetchLiveData}
            disabled={loading}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#475569', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh'}
          </button>

          <button
            onClick={handleExport}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 3px rgba(27,94,138,0.3)' }}
          >
            <Download size={14} /> Export CSV Audit
          </button>
        </div>
      </div>

      {/* Summary KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          {
            label: 'Active Enrolled Policies',
            val: kpiMetrics.totalPolicies.toLocaleString(),
            sub: `Total Sum Insured: ₹${(kpiMetrics.totalSumInsured / 100000).toFixed(2)} Lakh`,
            icon: <FileText size={18} color="#1B5E8A" />,
            color: '#1B5E8A',
            bg: '#EFF6FF',
          },
          {
            label: 'Loss Intimations & Claims',
            val: `${kpiMetrics.totalLossNotifications} Losses / ${kpiMetrics.totalClaims} Claims`,
            sub: `${kpiMetrics.claimsPending} pending actuarial review`,
            icon: <AlertTriangle size={18} color="#D97706" />,
            color: '#D97706',
            bg: '#FFFBEB',
          },
          {
            label: 'DBT Settlement Ratio',
            val: `${settlementRate}%`,
            sub: `${kpiMetrics.claimsPaid} of ${kpiMetrics.totalClaims} disbursed via DBT`,
            icon: <CheckCircle size={18} color="#166534" />,
            color: '#166534',
            bg: '#F0FDF4',
          },
          {
            label: 'Total DBT Disbursed',
            val: `₹${(kpiMetrics.totalDisbursed / 100000).toFixed(2)} Lakh`,
            sub: `Gross Premium Pool: ₹${(kpiMetrics.totalGrossPremium / 100000).toFixed(2)} L`,
            icon: <IndianRupee size={18} color="#6A0DAD" />,
            color: '#6A0DAD',
            bg: '#FAF5FF',
          },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700 }}>{k.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {k.icon}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Visualizations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, marginBottom: 24 }}>
        {/* Monthly Trend Chart */}
        <div style={{ gridColumn: 'span 12', background: 'white', borderRadius: 12, padding: 22, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332' }}>Live Timeline & DBT Settlement Flow</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Monthly chronological trends from live policy enrollments and verified claim disbursements</div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[{ label: 'Policies Enrolled', color: '#1B5E8A' }, { label: 'Claims Filed', color: '#D97706' }, { label: 'DBT Disbursed (₹ Lakh)', color: '#166534' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, background: l.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" L" />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="policies" stroke="#1B5E8A" strokeWidth={2.5} dot={{ r: 4, fill: '#1B5E8A' }} name="Policies" />
                <Line yAxisId="left" type="monotone" dataKey="claims" stroke="#D97706" strokeWidth={2.5} dot={{ r: 4, fill: '#D97706' }} name="Claims" />
                <Line yAxisId="right" type="monotone" dataKey="disbursedLakhs" stroke="#166534" strokeWidth={2.5} strokeDasharray="4 2" dot={{ r: 4, fill: '#166534' }} name="DBT Disbursed ₹ Lakh" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              No timeline data available for the selected filter.
            </div>
          )}
        </div>

        {/* Cause of Loss Pie Chart */}
        <div style={{ gridColumn: 'span 5', background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 2 }}>Crop Loss by Peril</div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Live distribution of reported damage causes</div>
          
          {causeData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={210}>
                <PieChart>
                  <Pie data={causeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {causeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 10 }}>
                {causeData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#334155' }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{c.count} ({c.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              No loss notifications reported for this period.
            </div>
          )}
        </div>

        {/* District Breakdown Bar Chart */}
        <div style={{ gridColumn: 'span 7', background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 2 }}>District-wise Performance & Volume</div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Policies, claims, and DBT disbursement volume across active districts</div>
          
          {districtData.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={districtData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="policies" fill="#1B5E8A" radius={[4, 4, 0, 0]} name="Policies Enrolled" />
                <Bar dataKey="claims" fill="#D97706" radius={[4, 4, 0, 0]} name="Claims Filed" />
                <Bar dataKey="disbursedLakhs" fill="#166534" radius={[4, 4, 0, 0]} name="DBT Disbursed (₹ Lakh)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              No district records found.
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Crop Portfolio Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Crop Portfolio & Actuarial Breakdown</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Dynamic performance across {cropBreakdown.length} insured crop varieties in the current database
            </div>
          </div>
          <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            {filteredPolicies.length} Total Policies Filtered
          </span>
        </div>

        {cropBreakdown.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Crop Variety', 'Enrolled Policies', 'Insured Acreage (Ha)', 'Claims Filed', 'Claim Incident Rate', 'Total Sum Insured', 'DBT Disbursed'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cropBreakdown.map((c, i) => {
                  const claimRate = c.policies > 0 ? ((c.claims / c.policies) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                        🌾 {c.crop}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>
                        {c.policies}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>
                        {c.acreageHa ? c.acreageHa.toFixed(1) : '—'} Ha
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>
                        {c.claims}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, maxWidth: 60, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: parseFloat(claimRate) > 50 ? '#DC2626' : parseFloat(claimRate) > 20 ? '#D97706' : '#166534', width: `${Math.min(parseFloat(claimRate), 100)}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{claimRate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#0F172A', fontWeight: 600, fontFamily: 'monospace' }}>
                        ₹{Number(c.sumInsured).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: c.disbursed > 0 ? '#166534' : '#94A3B8', fontWeight: 700, fontFamily: 'monospace' }}>
                        ₹{Number(c.disbursed).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
            No crop policies found for the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
