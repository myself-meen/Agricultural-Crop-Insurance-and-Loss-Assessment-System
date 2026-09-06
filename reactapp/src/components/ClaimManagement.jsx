import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, CheckCircle, XCircle, Clock, IndianRupee, FileText, ChevronRight, AlertCircle, RefreshCw } from './Icons';
import { claimApi } from '../services/api';

const DEFAULT_CLAIMS = [
  { id: 'CLM-2847', notif: 'LN-2847', survey: 'SRV-1041', farmer: 'Ramesh Kumar', crop: 'Paddy', district: 'Nashik', season: 'Kharif 2024', sumInsured: 125000, lossPercent: 65, claimAmount: 81250, status: 'Approved', stage: 4, date: '12 Jul 2024', bank: 'SBI – XXXX1234', utrNumber: 'PMFBY-2024-849102' },
  { id: 'CLM-2846', notif: 'LN-2846', survey: 'SRV-1040', farmer: 'Sunita Devi', crop: 'Wheat', district: 'Ahmednagar', season: 'Rabi 2023-24', sumInsured: 45000, lossPercent: 72, claimAmount: 32400, status: 'Under Review', stage: 2, date: '11 Jul 2024', bank: 'BOM – XXXX5678' },
  { id: 'CLM-2845', notif: 'LN-2845', survey: 'SRV-1039', farmer: 'Mahendra Yadav', crop: 'Cotton', district: 'Wardha', season: 'Kharif 2024', sumInsured: 357500, lossPercent: null, claimAmount: null, status: 'Pending Survey', stage: 1, date: '11 Jul 2024', bank: 'Canara – XXXX9012' },
  { id: 'CLM-2844', notif: 'LN-2844', survey: 'SRV-1038', farmer: 'Geeta Bai', crop: 'Soybean', district: 'Buldhana', season: 'Kharif 2024', sumInsured: 90000, lossPercent: 48, claimAmount: 43200, status: 'Disbursed', stage: 5, date: '10 Jul 2024', bank: 'UCO – XXXX3456', utrNumber: 'PMFBY-2024-910231' },
  { id: 'CLM-2843', notif: 'LN-2843', survey: null, farmer: 'Arvind Patel', crop: 'Maize', district: 'Nashik', season: 'Kharif 2024', sumInsured: 120000, lossPercent: 0, claimAmount: 0, status: 'Rejected', stage: 3, date: '09 Jul 2024', bank: 'PNB – XXXX7890' },
];

const STAGES = ['Notification', 'Survey', 'Review', 'Approval', 'Disbursement'];

const STATUS_CHIP = {
  'Approved': { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={12} /> },
  'Under Review': { bg: '#FEF3C7', text: '#92400E', icon: <Clock size={12} /> },
  'Pending Survey': { bg: '#DBEAFE', text: '#1E40AF', icon: <AlertCircle size={12} /> },
  'Disbursed': { bg: '#EDE9FE', text: '#5B21B6', icon: <CheckCircle size={12} /> },
  'Rejected': { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={12} /> },
};

export default function ClaimManagement({ user }) {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [approvingId, setApprovingId] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const role = (user?.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer');
  const isFarmer = role === 'farmer';
  const canApprove = ['insurance_officer', 'state_officer', 'admin'].includes(role);
  const canDisburse = ['bank_officer', 'admin'].includes(role);

  useEffect(() => {
    fetchClaims();
  }, [user]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let res;
      if (isFarmer && user?.id) {
        res = await claimApi.getClaimsByFarmer(user.id);
      } else {
        res = await claimApi.getAllClaims();
      }
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        const mapped = list.map((c, i) => {
          const isSettled = c.status === 'PAID' || c.status === 'SETTLED' || c.status === 'Disbursed';
          const isApproved = c.status === 'APPROVED' || c.status === 'LEVEL2_APPROVED' || c.status === 'Approved';
          const isL1 = c.status === 'LEVEL1_APPROVED';
          const isRejected = c.status === 'REJECTED' || c.status === 'Rejected';

          const displayStatus = isSettled ? 'Disbursed'
            : isApproved ? 'Approved'
            : isL1 ? 'Under Review'
            : isRejected ? 'Rejected'
            : 'Under Review';

          const stage = isSettled ? 5 : isApproved ? 4 : isL1 ? 3 : 2;

          return {
            id: c.claimNumber || `CLM-${c.id || 1000 + i}`,
            backendId: c.id,
            notif: c.lossNotificationId ? `LN-${c.lossNotificationId}` : (c.lossNotification?.notificationNumber || `LN-${1000 + i}`),
            survey: c.surveyId ? `SRV-${c.surveyId}` : (c.surveyAssignment ? `SRV-${c.surveyAssignment.id}` : `SRV-${1040}`),
            farmer: c.farmerName || c.lossNotification?.farmer?.user?.name || (isFarmer ? (user?.name || 'Registered Farmer') : 'Farmer Ramesh'),
            crop: c.cropName || c.lossNotification?.policy?.cropName || 'Paddy',
            district: c.district || c.lossNotification?.farmer?.district || 'Nashik',
            season: c.season || c.lossNotification?.policy?.season || 'Kharif 2026',
            sumInsured: c.sumInsured || c.lossNotification?.policy?.sumInsured || 100000,
            lossPercent: c.lossAssessedPct != null ? c.lossAssessedPct : (c.surveyAssignment?.assessedLossPercent || c.assessedLossPercentage || 65),
            claimAmount: c.approvedAmount || c.claimedAmount || (c.lossAssessedPct ? Math.round(100000 * (c.lossAssessedPct / 100)) : 65000),
            status: displayStatus,
            stage: stage,
            date: c.disbursedDate || (c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')),
            bank: c.dbtBankAccount ? `${c.dbtBankAccount} (${c.dbtIfsc || 'SBIN0001234'})` : 'Aadhaar Linked DBT Account',
            utrNumber: c.dbtUtr || c.utrNumber,
          };
        });
        setClaims(mapped);
      }
    } catch (err) {
      console.warn('Backend claim fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claim) => {
    try {
      setApprovingId(claim.id);
      if (claim.backendId) {
        await claimApi.updateStatus(claim.backendId, 'APPROVED', remarks || 'Approved by Officer');
      }
      setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Approved', stage: 4 } : c));
      setSelected(prev => prev ? { ...prev, status: 'Approved', stage: 4 } : null);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleDisburse = async (claim) => {
    try {
      if (claim.backendId) {
        const res = await claimApi.disburse(claim.backendId);
        const updated = res.data?.data || res.data;
        const utr = updated?.dbtUtr || `PMFBY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Disbursed', stage: 5, utrNumber: utr } : c));
        setSelected(prev => prev ? { ...prev, status: 'Disbursed', stage: 5, utrNumber: utr } : null);
      } else {
        const utr = `PMFBY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Disbursed', stage: 5, utrNumber: utr } : c));
        setSelected(prev => prev ? { ...prev, status: 'Disbursed', stage: 5, utrNumber: utr } : null);
      }
    } catch (err) {
      console.error('Disbursement failed:', err);
    }
  };

  const filtered = filter === 'All' ? claims : claims.filter(c => c.status === filter);

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7A8D', fontSize: 13, fontFamily: 'inherit' }}
        >
          ← Back to Claims
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
          <div>
            {/* Claim header */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Claim ID</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1A2332', fontFamily: 'DM Mono, monospace' }}>{selected.id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: STATUS_CHIP[selected.status]?.bg, color: STATUS_CHIP[selected.status]?.text, fontSize: 13, fontWeight: 700 }}>
                  {STATUS_CHIP[selected.status]?.icon} {selected.status}
                </div>
              </div>

              {/* Progress tracker */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Claim Progress</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {STAGES.map((stage, i) => {
                    const done = i < selected.stage;
                    const active = i === selected.stage - 1;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STAGES.length - 1 ? 1 : 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
                            background: done || active ? (selected.status === 'Rejected' && active ? '#FEE2E2' : done ? '#2E7D52' : '#1B5E8A') : '#E2E8F0',
                            color: done || active ? 'white' : '#9CA3AF'
                          }}>
                            {done && i < selected.stage - 1 ? <CheckCircle size={14} /> : i + 1}
                          </div>
                          <span style={{ fontSize: 10, color: active ? '#1A2332' : '#9CA3AF', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.3 }}>{stage}</span>
                        </div>
                        {i < STAGES.length - 1 && <div style={{ flex: 1, height: 2, background: i < selected.stage - 1 ? '#2E7D52' : '#E2E8F0', margin: '0 6px', marginBottom: 22 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Farmer', selected.farmer],
                  ['Crop', selected.crop],
                  ['Season', selected.season],
                  ['District', selected.district],
                  ['Loss Notification', selected.notif],
                  ['Survey Report', selected.survey || 'Completed'],
                  ['Sum Insured', `₹${(selected.sumInsured || 0).toLocaleString()}`],
                  ['Loss Assessed', selected.lossPercent != null ? `${selected.lossPercent}%` : 'Pending'],
                ].map(([k, v], i) => (
                  <div key={i} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332', fontFamily: ['Loss Notification', 'Survey Report', 'Sum Insured', 'Loss Assessed'].includes(k) ? 'DM Mono, monospace' : 'inherit' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim amount */}
            {selected.claimAmount != null && selected.claimAmount > 0 && (
              <div style={{ background: '#0F2744', borderRadius: 12, padding: '24px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <IndianRupee size={18} color="#4CAF91" />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Claim Calculation & DBT Record</span>
                </div>
                {[
                  ['Sum Insured', `₹${(selected.sumInsured || 0).toLocaleString()}`],
                  ['Loss Percentage', `${selected.lossPercent}%`],
                  ['Admissible Claim', `₹${(selected.claimAmount || 0).toLocaleString()}`, true],
                  ['Bank Account', selected.bank],
                  ...(selected.utrNumber ? [['DBT UTR Number', selected.utrNumber, true]] : []),
                ].map(([k, v, hi], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{k}</span>
                    <span style={{ fontSize: hi ? 18 : 14, fontWeight: hi ? 800 : 600, color: hi ? '#4CAF91' : 'white', fontFamily: 'DM Mono, monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Audit trail */}
          <div>
            {canApprove && selected.status === 'Under Review' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>Officer Approval Actions</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Remarks</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Add remarks or conditions for approval..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'inherit', background: '#FAFBFD', outline: 'none', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleApprove(selected)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#2E7D52', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <CheckCircle size={15} /> Approve Claim
                  </button>
                  <button
                    onClick={() => {
                      setClaims(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'Rejected' } : c));
                      setSelected(prev => ({ ...prev, status: 'Rejected' }));
                    }}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            )}

            {(canDisburse || canApprove) && selected.status === 'Approved' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>DBT Disbursement</div>
                <p style={{ fontSize: 13, color: '#4B5563', marginBottom: 14 }}>Claim has been validated. Initiate Direct Benefit Transfer (DBT) to the farmer's linked bank account.</p>
                <button
                  onClick={() => handleDisburse(selected)}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <IndianRupee size={16} /> Disburse ₹{selected.claimAmount?.toLocaleString()} via DBT
                </button>
              </div>
            )}

            {isFarmer && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#2E7D52" />
                  <span>Beneficiary Payout Status</span>
                </div>
                {selected.status === 'Under Review' && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400E' }}>
                    <strong>Verification in Progress:</strong> Your claim is being assessed and verified against the field survey report. You will be notified once approved.
                  </div>
                )}
                {selected.status === 'Approved' && (
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#1E40AF' }}>
                    <strong>Claim Approved:</strong> ₹{(selected.claimAmount || 0).toLocaleString()} has been sanctioned and queued for DBT release to your Aadhaar-linked account.
                  </div>
                )}
                {selected.status === 'Disbursed' && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#166534' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>DBT Settlement Complete</div>
                    <div>₹{(selected.claimAmount || 0).toLocaleString()} credited to {selected.bank}.</div>
                    {selected.utrNumber && (
                      <div style={{ marginTop: 6, fontSize: 12, fontFamily: 'DM Mono, monospace', color: '#15803D' }}>
                        UTR: {selected.utrNumber}
                      </div>
                    )}
                  </div>
                )}
                {selected.status === 'Rejected' && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#991B1B' }}>
                    <strong>Claim Ineligible:</strong> Based on the field assessment report, this claim does not meet PMFBY shortfall criteria.
                  </div>
                )}
              </div>
            )}

            {/* Audit trail */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 16 }}>Audit Trail</div>
              {[
                { event: 'Loss Notification Submitted', by: selected.farmer, date: selected.date, icon: <FileText size={14} />, color: '#6B7A8D' },
                { event: 'Survey Assigned & Assessed', by: 'Field Surveyor', date: selected.date, icon: <Shield size={14} />, color: '#1B5E8A' },
                { event: 'Claim Reviewed & Validated', by: 'Insurance Officer', date: selected.date, icon: <CheckCircle size={14} />, color: '#2E7D52' },
                ...(selected.status === 'Disbursed' ? [{ event: 'DBT Payout Transferred', by: 'PFMS Gateway', date: selected.date, icon: <CheckCircle size={14} />, color: '#6A0DAD' }] : []),
              ].map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 16 : 0, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${ev.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ev.color, flexShrink: 0 }}>{ev.icon}</div>
                    {i < 3 && <div style={{ width: 1, flex: 1, background: '#E2E8F0', marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < 3 ? 16 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2332' }}>{ev.event}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{ev.by} · {ev.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', margin: 0 }}>Claim Management</h1>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>End-to-end crop insurance claim lifecycle & DBT settlement</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchClaims}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#6B7A8D', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Claims', val: claims.length, color: '#6B7A8D' },
          { label: 'Under Review', val: claims.filter(c => c.status === 'Under Review').length, color: '#D97706' },
          { label: 'Approved', val: claims.filter(c => c.status === 'Approved').length, color: '#2E7D52' },
          { label: 'Disbursed', val: claims.filter(c => c.status === 'Disbursed').length, color: '#6A0DAD' },
          { label: 'Rejected', val: claims.filter(c => c.status === 'Rejected').length, color: '#C0392B' },
        ].map((k, i) => (
          <div
            key={i}
            onClick={() => setFilter(k.label === 'Total Claims' ? 'All' : k.label)}
            style={{ background: 'white', borderRadius: 10, padding: '14px 16px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8, padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}>
          {['All', 'Under Review', 'Approved', 'Disbursed', 'Rejected', 'Pending Survey'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: filter === f ? 600 : 400,
                background: filter === f ? '#1B5E8A' : 'transparent', color: filter === f ? 'white' : '#6B7A8D',
                border: filter === f ? 'none' : '1px solid #E2E8F0', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Claim ID', 'Farmer', 'Crop', 'District', 'Sum Insured', 'Loss %', 'Claim Amount', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '52px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', marginBottom: 12 }}>
                    <ShieldCheck size={28} color="#94A3B8" />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 6 }}>
                    No Insurance Claims Found
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', maxWidth: 440, margin: '0 auto', lineHeight: 1.5 }}>
                    {isFarmer
                      ? 'You currently have no crop insurance claims on file. Claims are triggered automatically upon completion and approval of a field loss assessment survey.'
                      : 'No claim records match the currently selected filter status.'}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr
                  key={i}
                  style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}
                  onClick={() => setSelected(c)}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#1B5E8A', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{c.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#1A2332' }}>{c.farmer}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{c.crop}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{c.district}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#374151' }}>₹{(c.sumInsured || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: c.lossPercent ? '#C0392B' : '#9CA3AF', fontWeight: 600 }}>{c.lossPercent != null ? `${c.lossPercent}%` : '—'}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: c.claimAmount ? '#1A2332' : '#9CA3AF', fontFamily: 'DM Mono, monospace' }}>
                    {c.claimAmount ? `₹${(c.claimAmount || 0).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: STATUS_CHIP[c.status]?.bg, color: STATUS_CHIP[c.status]?.text, width: 'fit-content' }}>
                      {STATUS_CHIP[c.status]?.icon}{c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#9CA3AF' }}>{c.date}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
