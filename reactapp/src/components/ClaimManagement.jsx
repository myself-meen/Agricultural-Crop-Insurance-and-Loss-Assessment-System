import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, CheckCircle, XCircle, Clock, IndianRupee, FileText, ChevronRight, AlertCircle, RefreshCw, Plus } from './Icons';
import { claimApi, surveyApi, lossNotificationApi } from '../services/api';

const STAGES = ['Loss Reported', 'Field Surveyed', 'Level-1 Review', 'Actuarial Approval', 'DBT Disbursed'];

const STATUS_CHIP = {
  'Approved': { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={12} /> },
  'Level 1 Approved': { bg: '#EDE9FE', text: '#5B21B6', icon: <Clock size={12} /> },
  'Under Review': { bg: '#FEF3C7', text: '#92400E', icon: <Clock size={12} /> },
  'Pending Survey': { bg: '#DBEAFE', text: '#1E40AF', icon: <AlertCircle size={12} /> },
  'Disbursed': { bg: '#DCFCE7', text: '#166534', icon: <CheckCircle size={12} /> },
  'Rejected': { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle size={12} /> },
};

export default function ClaimManagement({ user }) {
  const [claims, setClaims] = useState([]);
  const [surveyedLosses, setSurveyedLosses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const role = (user?.role || 'farmer').toLowerCase().replace('insurer', 'insurance_officer');
  const isFarmer = role === 'farmer';
  const isOfficer = ['insurance_officer', 'state_officer', 'admin', 'bank_officer'].includes(role);
  const canApprove = ['insurance_officer', 'state_officer', 'admin'].includes(role);
  const canDisburse = ['insurance_officer', 'bank_officer', 'admin'].includes(role);

  useEffect(() => {
    fetchClaimsAndPending();
  }, [user]);

  const fetchClaimsAndPending = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const [claimsRes, surveysRes, lossesRes] = await Promise.allSettled([
        isFarmer && user?.id ? claimApi.getClaimsByFarmer(user.id) : claimApi.getAllClaims(),
        surveyApi.getAllSurveys(),
        lossNotificationApi.getAllLosses(),
      ]);

      // 1. Process Claims
      let loadedClaims = [];
      if (claimsRes.status === 'fulfilled') {
        const list = claimsRes.value.data?.data || claimsRes.value.data || [];
        if (Array.isArray(list)) {
          loadedClaims = list.map((c, i) => {
            const isSettled = c.status === 'PAID' || c.status === 'SETTLED';
            const isApproved = c.status === 'APPROVED';
            const isL1 = c.status === 'LEVEL1_APPROVED';
            const isRejected = c.status === 'REJECTED';

            const displayStatus = isSettled ? 'Disbursed'
              : isApproved ? 'Approved'
              : isL1 ? 'Level 1 Approved'
              : isRejected ? 'Rejected'
              : 'Under Review';

            const stage = isSettled ? 5 : isApproved ? 4 : isL1 ? 3 : 2;

            return {
              id: c.claimNumber || `CLM-${c.id || 1000 + i}`,
              backendId: c.id,
              rawStatus: c.status,
              notif: c.lossNotificationId ? `LN-${c.lossNotificationId}` : (c.lossNotification?.notificationNumber || `LN-${c.id}`),
              survey: c.surveyId ? `SRV-${c.surveyId}` : (c.surveyAssignment ? `SRV-${c.surveyAssignment.id}` : 'Completed'),
              farmer: c.farmerName || (isFarmer ? (user?.name || 'Registered Farmer') : (c.farmerId ? `Farmer ID #${c.farmerId}` : 'Registered Farmer')),
              farmerId: c.farmerId,
              crop: c.cropName || 'Paddy',
              district: c.district || 'Regional Jurisdiction',
              season: c.season || 'KHARIF',
              sumInsured: c.sumInsured || 100000,
              lossPercent: c.lossAssessedPct != null ? c.lossAssessedPct : 0,
              claimAmount: c.approvedAmount || c.claimedAmount || 0,
              status: displayStatus,
              stage: stage,
              date: c.disbursedDate || (c.level2ApprovedAt ? new Date(c.level2ApprovedAt).toLocaleDateString('en-GB') : (c.level1ApprovedAt ? new Date(c.level1ApprovedAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))),
              bank: c.dbtBankAccount ? `${c.dbtBankAccount} ${c.dbtIfsc ? `(${c.dbtIfsc})` : ''}` : 'Aadhaar Linked DBT Account',
              utrNumber: c.dbtUtr,
              remarks: c.remarks,
            };
          });
          setClaims(loadedClaims);
        }
      }

      // 2. Identify surveyed losses that haven't been initiated into claims yet
      if (surveysRes.status === 'fulfilled' && isOfficer) {
        const sList = surveysRes.value.data?.data || surveysRes.value.data || [];
        if (Array.isArray(sList)) {
          const completedSurveys = sList.filter(s => s.status === 'SUBMITTED' || s.status === 'VERIFIED');
          const existingSurveyIds = new Set(loadedClaims.map(c => c.survey?.replace('SRV-', '')).filter(Boolean));

          const uninitiated = completedSurveys.filter(s => !existingSurveyIds.has(String(s.id)));
          setSurveyedLosses(uninitiated);
        }
      }
    } catch (err) {
      console.warn('Backend claim fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateClaim = async (surveyId) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await claimApi.initiateClaim(surveyId);
      const c = res.data?.data || res.data;
      setSuccessMsg(`Claim ${c?.claimNumber || `CLM-${c?.id}`} initiated successfully for survey SRV-${surveyId}!`);
      await fetchClaimsAndPending();
    } catch (err) {
      console.error('Failed to initiate claim:', err);
      setErrorMsg(err.message || 'Failed to initiate claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLevel1Approve = async (claim) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await claimApi.approveL1(claim.backendId, user?.id || 3, remarks || 'Level 1 ground survey verified & approved');
      setSuccessMsg(`Claim ${claim.id} received Level 1 Actuarial Approval!`);
      await fetchClaimsAndPending();
      setSelected(null);
    } catch (err) {
      console.error('L1 Approval failed:', err);
      setErrorMsg(err.message || 'Level 1 approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLevel2Approve = async (claim) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await claimApi.approveL2(claim.backendId, user?.id || 3, remarks || 'Final Level 2 Actuarial Approval sanctioned');
      setSuccessMsg(`Claim ${claim.id} successfully Approved for DBT Disbursement!`);
      await fetchClaimsAndPending();
      setSelected(null);
    } catch (err) {
      console.error('L2 Approval failed:', err);
      setErrorMsg(err.message || 'Level 2 approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (claim) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await claimApi.rejectClaim(claim.backendId, user?.id || 3, remarks || 'Claim does not meet PMFBY shortfall criteria');
      setSuccessMsg(`Claim ${claim.id} has been Rejected.`);
      await fetchClaimsAndPending();
      setSelected(null);
    } catch (err) {
      console.error('Rejection failed:', err);
      setErrorMsg(err.message || 'Claim rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async (claim) => {
    try {
      setActionLoading(true);
      setErrorMsg(null);
      const res = await claimApi.disburse(claim.backendId);
      const updated = res.data?.data || res.data;
      setSuccessMsg(`DBT Payout Transferred! UTR: ${updated?.dbtUtr || 'UTR' + Date.now()} for Claim ${claim.id}`);
      await fetchClaimsAndPending();
      setSelected(null);
    } catch (err) {
      console.error('Disbursement failed:', err);
      setErrorMsg(err.message || 'DBT Disbursement failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeClaim = async (claim) => {
    if (!window.confirm(`Are you sure you want to withdraw/revoke Claim ${claim.id}? This will remove the draft claim record.`)) {
      return;
    }
    try {
      setActionLoading(true);
      setErrorMsg(null);
      await claimApi.deleteClaim(claim.backendId);
      setSuccessMsg(`Claim ${claim.id} has been revoked successfully.`);
      await fetchClaimsAndPending();
      setSelected(null);
    } catch (err) {
      console.error('Claim revocation failed:', err);
      setErrorMsg(err.message || 'Claim revocation failed. Claims that are approved or disbursed cannot be deleted.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = filter === 'All' ? claims : claims.filter(c => c.status === filter);

  if (selected) {
    return (
      <div>
        <button
          onClick={() => { setSelected(null); setRemarks(''); }}
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
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>PMFBY Claim Lifecycle Stage</div>
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
                  ['Farmer Name', selected.farmer],
                  ['Crop Enrolled', selected.crop],
                  ['Season', selected.season],
                  ['District', selected.district],
                  ['Loss Notification', selected.notif],
                  ['Survey Assessment', selected.survey],
                  ['Sum Insured (PMFBY)', `₹${(selected.sumInsured || 0).toLocaleString()}`],
                  ['Loss Assessed (%)', `${selected.lossPercent}%`],
                ].map(([k, v], i) => (
                  <div key={i} style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332', fontFamily: ['Loss Notification', 'Survey Assessment', 'Sum Insured (PMFBY)', 'Loss Assessed (%)'].includes(k) ? 'DM Mono, monospace' : 'inherit' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim calculation & DBT bank info */}
            <div style={{ background: '#0F2744', borderRadius: 12, padding: '24px', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <IndianRupee size={18} color="#4CAF91" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>PMFBY Admissible Claim Calculation</span>
              </div>
              {[
                ['Sum Insured', `₹${(selected.sumInsured || 0).toLocaleString()}`],
                ['Ground Yield Loss Percentage', `${selected.lossPercent}%`],
                ['Admissible Claim Compensation', `₹${(selected.claimAmount || 0).toLocaleString()}`, true],
                ['Seeded DBT Bank Account', selected.bank],
                ...(selected.utrNumber ? [['Bank Direct Benefit Transfer UTR', selected.utrNumber, true]] : []),
              ].map(([k, v, hi], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{k}</span>
                  <span style={{ fontSize: hi ? 18 : 14, fontWeight: hi ? 800 : 600, color: hi ? '#4CAF91' : 'white', fontFamily: 'DM Mono, monospace' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action sidebar */}
          <div>
            {/* Officer Level 1 Approval Action */}
            {canApprove && selected.status === 'Under Review' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Level-1 Claim Review</div>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Review ground survey evidence vs satellite NDVI metrics and approve for Level-2 Actuarial sign-off.</p>
                
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Officer Remarks</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Verify yield loss and attach review notes..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', background: '#FAFBFD', outline: 'none', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleLevel1Approve(selected)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#2E7D52', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <CheckCircle size={15} /> Level-1 Approve
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReject(selected)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* Officer Level 2 Final Approval Action */}
            {canApprove && selected.status === 'Level 1 Approved' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Level-2 Actuarial Final Approval</div>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Sanction compensation of ₹{(selected.claimAmount || 0).toLocaleString()} for immediate DBT disbursement.</p>
                
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Final Sanction Remarks</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Actuarial approval verified under PMFBY guidelines..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 13, fontFamily: 'inherit', background: '#FAFBFD', outline: 'none', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleLevel2Approve(selected)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#166534', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <CheckCircle size={15} /> Sanction Claim
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReject(selected)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#FEE2E2', color: '#991B1B', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* DBT Disbursement Action */}
            {(canDisburse || canApprove) && selected.status === 'Approved' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Execute Direct Benefit Transfer</div>
                <p style={{ fontSize: 13, color: '#4B5563', marginBottom: 14 }}>Claim has been actuarially sanctioned. Transmit funds directly to farmer's seeded bank account.</p>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDisburse(selected)}
                  style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <IndianRupee size={16} /> Disburse ₹{(selected.claimAmount || 0).toLocaleString()} via DBT
                </button>
              </div>
            )}

            {/* Farmer Status Card */}
            {isFarmer && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#2E7D52" />
                  <span>Beneficiary Payout Status</span>
                </div>
                {selected.status === 'Under Review' && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#92400E' }}>
                    <strong>Level-1 Review in Progress:</strong> Your claim is undergoing ground verification review.
                  </div>
                )}
                {selected.status === 'Level 1 Approved' && (
                  <div style={{ background: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#5B21B6' }}>
                    <strong>Level-1 Passed:</strong> Pending final actuarial sanction before fund release.
                  </div>
                )}
                {selected.status === 'Approved' && (
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#1E40AF' }}>
                    <strong>Claim Sanctioned:</strong> ₹{(selected.claimAmount || 0).toLocaleString()} approved and queued for DBT release.
                  </div>
                )}
                {selected.status === 'Disbursed' && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#166534' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>DBT Settlement Complete</div>
                    <div>₹{(selected.claimAmount || 0).toLocaleString()} credited to {selected.bank}.</div>
                    {selected.utrNumber && (
                      <div style={{ marginTop: 6, fontSize: 12, fontFamily: 'DM Mono, monospace', color: '#15803D' }}>
                        Bank UTR: {selected.utrNumber}
                      </div>
                    )}
                  </div>
                )}
                {selected.status === 'Rejected' && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#991B1B' }}>
                    <strong>Claim Ineligible:</strong> Claim does not meet PMFBY shortfall criteria.
                  </div>
                )}
                {selected.status === 'Under Review' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleRevokeClaim(selected)}
                    style={{
                      marginTop: 12, width: '100%', padding: '8px', borderRadius: 8,
                      background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600
                    }}
                  >
                    Withdraw Draft Claim
                  </button>
                )}
              </div>
            )}

            {/* Audit Trail */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 16 }}>Audit Trail</div>
              {[
                { event: 'Loss Notification Submitted', by: selected.farmer, date: selected.date, icon: <FileText size={14} />, color: '#6B7A8D' },
                { event: 'Field Survey Completed', by: 'Accredited Surveyor', date: selected.date, icon: <Shield size={14} />, color: '#1B5E8A' },
                { event: 'Actuarial Claim Validation', by: 'Insurance Officer', date: selected.date, icon: <CheckCircle size={14} />, color: '#2E7D52' },
                ...(selected.status === 'Disbursed' ? [{ event: 'DBT Direct Benefit Transfer', by: 'PFMS / Bank UTR', date: selected.date, icon: <CheckCircle size={14} />, color: '#6A0DAD' }] : []),
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', margin: 0 }}>
            {isFarmer ? 'My Insurance Claims & DBT Settlement' : 'Claim Management & DBT Settlement'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>
            {isFarmer
              ? 'Track your crop insurance claim review, actuarial sanctions, and Direct Benefit Transfers'
              : 'End-to-end PMFBY actuarial claim approvals, shortfall calculation & DBT transfers'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchClaimsAndPending}
            disabled={loading}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#6B7A8D', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 8, background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 8, background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Surveyed Losses Ready for Claim Initiation (Officer View) */}
      {isOfficer && surveyedLosses.length > 0 && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#166534" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
                Field Surveys Completed & Ready for Claim Assessment ({surveyedLosses.length})
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#15803D' }}>Click "Initiate Claim" to calculate sum insured shortfall</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {surveyedLosses.map(s => (
              <div key={s.id} style={{ background: 'white', borderRadius: 8, padding: '12px 14px', border: '1px solid #DCFCE7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332' }}>{s.farmerName || 'Farmer'} · {s.cropName || 'Crop'}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Survey SRV-{s.id} · Loss: <strong style={{ color: '#C0392B' }}>{s.lossAssessedPct || 60}%</strong>
                  </div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleInitiateClaim(s.id)}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#166534', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Initiate Claim
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Claims', val: claims.length, color: '#6B7A8D' },
          { label: 'Under Review', val: claims.filter(c => c.status === 'Under Review' || c.status === 'Level 1 Approved').length, color: '#D97706' },
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
          {['All', 'Under Review', 'Level 1 Approved', 'Approved', 'Disbursed', 'Rejected'].map(f => (
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
                      ? 'You currently have no crop insurance claims on file. Claims are generated once field surveys are completed by an accredited surveyor.'
                      : 'No claim records match the selected filter status.'}
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
