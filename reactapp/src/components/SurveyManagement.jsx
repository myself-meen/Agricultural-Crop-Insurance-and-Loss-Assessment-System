import React, { useState, useEffect } from 'react';
import { ClipboardCheck, MapPin, User, Calendar, Star, CheckCircle, AlertCircle, Wheat, Clock, ShieldCheck, RefreshCw, Plus } from './Icons';
import { surveyApi, userApi, lossNotificationApi, claimApi, authApi } from '../services/api';

const STATUS_CHIP = {
  'In Progress': { bg: '#DBEAFE', text: '#1E40AF' },
  'Completed': { bg: '#DCFCE7', text: '#166534' },
  'Verified': { bg: '#EDE9FE', text: '#5B21B6' },
  'Pending Assignment': { bg: '#FEF3C7', text: '#92400E' },
  'ASSIGNED': { bg: '#DBEAFE', text: '#1E40AF' },
  'SUBMITTED': { bg: '#DCFCE7', text: '#166534' },
  'VERIFIED': { bg: '#EDE9FE', text: '#5B21B6' },
};

export default function SurveyManagement({ user }) {
  const [activeTab, setActiveTab] = useState('surveys'); // 'surveys' | 'pending' | 'submit' | 'surveyors'
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [lossVal, setLossVal] = useState('65');
  const [yieldAssessed, setYieldAssessed] = useState('850.5');
  const [remarks, setRemarks] = useState('Crop loss verified on ground. Flood inundation evident.');
  const [submitted, setSubmitted] = useState(false);
  const [claimInitiatedMsg, setClaimInitiatedMsg] = useState(null);

  const [surveys, setSurveys] = useState([]);
  const [pendingLosses, setPendingLosses] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Assign surveyor modal state
  const [assignModal, setAssignModal] = useState(null); // null or loss notification object
  const [selectedSurveyorId, setSelectedSurveyorId] = useState('');
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0]);

  // Add surveyor modal state
  const [showAddSurveyor, setShowAddSurveyor] = useState(false);
  const [surveyorForm, setSurveyorForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: 'Surveyor@123',
    district: 'Nashik',
  });

  const userRole = (user?.role || '').toLowerCase().replace('insurer', 'insurance_officer');
  const isSurveyor = userRole === 'surveyor';
  const canAssign = ['insurance_officer', 'state_officer', 'admin', 'bank_officer'].includes(userRole);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [survRes, lossesRes, usersRes] = await Promise.allSettled([
        surveyApi.getAllSurveys(),
        lossNotificationApi.getAllLosses(),
        userApi.getAllUsers(),
      ]);

      // 1. Process Survey Assignments
      if (survRes.status === 'fulfilled') {
        const list = survRes.value.data?.data || survRes.value.data || [];
        if (Array.isArray(list)) {
          setSurveys(list.map(s => ({
            id: `SRV-${s.id}`,
            rawId: s.id,
            notifId: `LN-${s.notificationId || s.id}`,
            farmer: s.farmerName || 'Registered Farmer',
            crop: s.cropName || 'Paddy',
            district: s.district || 'Nashik',
            surveyor: s.surveyorName || (s.surveyorId === 4 ? 'Surveyor Officer' : `Surveyor #${s.surveyorId || 4}`),
            surveyorId: s.surveyorId,
            due: s.surveyDate || '14 Jul 2026',
            status: s.status === 'VERIFIED' ? 'Verified' : s.status === 'SUBMITTED' ? 'Completed' : 'In Progress',
            rawStatus: s.status,
            lossEstimate: s.lossAssessedPct != null ? s.lossAssessedPct : s.assessedLossPercentage != null ? s.assessedLossPercentage : null,
            yieldAssessed: s.yieldAssessedKgHa || s.yieldAssessed,
            photos: s.surveyPhotos,
          })));
        }
      }

      // 2. Process Loss Notifications awaiting survey
      if (lossesRes.status === 'fulfilled') {
        const lList = lossesRes.value.data?.data || lossesRes.value.data || [];
        if (Array.isArray(lList)) {
          const pending = lList.filter(l => l.status === 'SUBMITTED' || l.status === 'Pending' || l.status === 'Pending Review');
          setPendingLosses(pending.map(l => ({
            id: l.id,
            displayId: `LN-${l.id}`,
            surveyId: l.surveyId,
            surveyStatus: l.surveyStatus,
            farmer: l.farmerName || 'Registered Farmer',
            crop: l.cropName || 'Paddy',
            district: l.district || 'Nashik',
            area: l.affectedAreaHa ? `${l.affectedAreaHa} Ha` : '2.0 Ha',
            cause: l.lossType || 'Flood',
            date: l.lossDate ? new Date(l.lossDate).toLocaleDateString('en-GB') : 'Recent',
            lat: l.geoLat || '23.2599',
            lng: l.geoLng || '77.4126',
            policyId: l.policyId,
            rawStatus: l.status,
          })));
        }
      }

      // 3. Process Surveyors Directory
      if (usersRes.status === 'fulfilled') {
        const uList = usersRes.value.data?.data || usersRes.value.data || [];
        const surs = uList.filter(u => u.role === 'SURVEYOR');
        if (surs.length > 0) {
          setSurveyors(surs);
          if (!selectedSurveyorId) {
            setSelectedSurveyorId(String(surs[0].id));
          }
        } else {
          setSurveyors([
            { id: 4, name: 'Surveyor Officer', email: 'surveyor@assess.gov.in', district: 'Nashik' },
          ]);
          if (!selectedSurveyorId) setSelectedSurveyorId('4');
        }
      }
    } catch (e) {
      console.warn('Survey data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Start Survey Assessment directly from a loss notification
  const handleStartAssessmentFromLoss = async (l) => {
    if (l.surveyId) {
      const match = surveys.find(s => s.rawId === l.surveyId);
      if (match) {
        setSelectedSurvey(match);
      } else {
        setSelectedSurvey({
          id: `SRV-${l.surveyId}`,
          rawId: l.surveyId,
          notifId: l.displayId,
          farmer: l.farmer,
          crop: l.crop,
          district: l.district,
        });
      }
      setActiveTab('submit');
      return;
    }

    try {
      setLoading(true);
      const survId = isSurveyor && user?.id ? parseInt(user.id) : (parseInt(selectedSurveyorId) || 4);
      const res = await surveyApi.assignSurveyor(l.id, survId, {
        notificationId: l.id,
        surveyorId: survId,
        surveyDate: new Date().toISOString().split('T')[0]
      });
      const sData = res.data?.data || res.data;
      setSelectedSurvey({
        id: `SRV-${sData.id}`,
        rawId: sData.id,
        notifId: l.displayId,
        farmer: l.farmer,
        crop: l.crop,
        district: l.district,
      });
      await loadData();
      setActiveTab('submit');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to initialize survey assessment');
    } finally {
      setLoading(false);
    }
  };

  // Assign Surveyor to Loss Notification
  const handleAssignSurveyor = async (e) => {
    e?.preventDefault();
    if (!assignModal || !selectedSurveyorId) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      await surveyApi.assignSurveyor(assignModal.id, parseInt(selectedSurveyorId), {
        notificationId: assignModal.id,
        surveyorId: parseInt(selectedSurveyorId),
        surveyDate: surveyDate,
      });

      setActionSuccess(`Surveyor successfully assigned to Loss Notification ${assignModal.displayId}!`);
      setAssignModal(null);
      await loadData();
      setActiveTab('surveys');
    } catch (err) {
      console.error('Failed to assign surveyor:', err);
      setErrorMessage(err.message || 'Failed to assign surveyor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Ground Survey Assessment
  const handleSubmitAssessment = async () => {
    if (!selectedSurvey?.rawId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const payload = {
        assessedLossPercentage: parseFloat(lossVal),
        lossAssessedPct: parseFloat(lossVal),
        yieldAssessed: parseFloat(yieldAssessed),
        yieldAssessedKgHa: parseFloat(yieldAssessed),
        surveyRemarks: remarks,
        surveyPhotos: JSON.stringify([{ url: 'field_evidence.jpg', timestamp: new Date().toISOString() }]),
        surveyorLatitude: 23.2599,
        surveyGeoLat: 23.2599,
        surveyorLongitude: 77.4126,
        surveyGeoLng: 77.4126,
      };

      await surveyApi.submit(selectedSurvey.rawId, payload);
      setSubmitted(true);
      setActionSuccess(`Assessment for survey ${selectedSurvey.id} recorded successfully!`);

      // Optionally auto-initiate claim if not already initiated
      try {
        const claimRes = await claimApi.initiateClaim(selectedSurvey.rawId);
        const cData = claimRes.data?.data || claimRes.data;
        if (cData) {
          setClaimInitiatedMsg(`Crop insurance claim ${cData.claimNumber || `CLM-${cData.id}`} has been automatically generated for ₹${(cData.claimedAmount || 0).toLocaleString()} and queued for review.`);
        }
      } catch (cErr) {
        console.log('Claim initiation notice:', cErr.message);
      }

      await loadData();
    } catch (err) {
      console.error('Assessment submission error:', err);
      setErrorMessage(err.message || 'Failed to submit ground survey assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Update Survey State (e.g., mark as VERIFIED)
  const handleUpdateStatus = async (surveyId, newStatus) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await surveyApi.updateStatus(surveyId, newStatus);
      setActionSuccess(`Survey SRV-${surveyId} status updated to ${newStatus}!`);
      await loadData();
    } catch (err) {
      console.error('Failed to update survey status:', err);
      setErrorMessage(err.message || 'Failed to update survey status.');
    } finally {
      setLoading(false);
    }
  };

  // Unassign / Cancel a survey assignment (returns notice to pending queue)
  const handleUnassignSurvey = async (surveyId) => {
    if (!window.confirm(`Are you sure you want to unassign Survey SRV-${surveyId}? The loss notification will return to SUBMITTED state for reassignment.`)) {
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await surveyApi.deleteSurvey(surveyId);
      setActionSuccess(`Survey SRV-${surveyId} unassigned successfully. Loss notification returned to pending list.`);
      await loadData();
    } catch (err) {
      console.error('Failed to unassign survey:', err);
      setErrorMessage(err.message || 'Failed to unassign survey.');
    } finally {
      setLoading(false);
    }
  };

  // Register a new Field Surveyor into the system
  const handleRegisterSurveyor = async (e) => {
    e?.preventDefault();
    if (!surveyorForm.name || !surveyorForm.email || !surveyorForm.phoneNumber) {
      setErrorMessage('Please provide Surveyor name, email, and 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await authApi.register({
        name: surveyorForm.name,
        email: surveyorForm.email,
        phoneNumber: surveyorForm.phoneNumber,
        password: surveyorForm.password || 'Surveyor@123',
        role: 'SURVEYOR',
      });
      setActionSuccess(`Field Surveyor "${surveyorForm.name}" registered successfully!`);
      setShowAddSurveyor(false);
      setSurveyorForm({
        name: '',
        email: '',
        phoneNumber: '',
        password: 'Surveyor@123',
        district: 'Nashik',
      });
      await loadData();
    } catch (err) {
      console.error('Failed to register surveyor:', err);
      setErrorMessage(err.message || 'Failed to register field surveyor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', margin: 0 }}>Survey Management</h1>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>Field survey assignment, ground loss quantification, and actuarial report submission</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {canAssign && (
            <button
              onClick={() => setShowAddSurveyor(true)}
              style={{
                padding: '8px 16px', borderRadius: 8, background: '#166534', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Plus size={14} /> Add Field Surveyor
            </button>
          )}
          <button
            onClick={loadData}
            disabled={loading}
            style={{ padding: '8px 14px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#6B7A8D', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        <button
          onClick={() => { setActiveTab('surveys'); setSubmitted(false); }}
          style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'surveys' ? 600 : 400,
            background: activeTab === 'surveys' ? 'white' : 'transparent',
            color: activeTab === 'surveys' ? '#1A2332' : '#6B7A8D',
            border: 'none', cursor: 'pointer',
            boxShadow: activeTab === 'surveys' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Active & Completed Surveys ({surveys.length})
        </button>

        <button
          onClick={() => { setActiveTab('pending'); setSubmitted(false); }}
          style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'pending' ? 600 : 400,
            background: activeTab === 'pending' ? 'white' : 'transparent',
            color: activeTab === 'pending' ? '#D97706' : '#6B7A8D',
            border: 'none', cursor: 'pointer',
            boxShadow: activeTab === 'pending' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span>Loss Notifications Awaiting Survey</span>
          {pendingLosses.length > 0 && (
            <span style={{ background: '#D97706', color: 'white', borderRadius: 12, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {pendingLosses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('submit'); setSubmitted(false); }}
          style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'submit' ? 600 : 400,
            background: activeTab === 'submit' ? 'white' : 'transparent',
            color: activeTab === 'submit' ? '#1A2332' : '#6B7A8D',
            border: 'none', cursor: 'pointer',
            boxShadow: activeTab === 'submit' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {isSurveyor ? 'Submit Assessment' : 'Assessment Form'}
        </button>

        <button
          onClick={() => { setActiveTab('surveyors'); setSubmitted(false); }}
          style={{
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: activeTab === 'surveyors' ? 600 : 400,
            background: activeTab === 'surveyors' ? 'white' : 'transparent',
            color: activeTab === 'surveyors' ? '#1A2332' : '#6B7A8D',
            border: 'none', cursor: 'pointer',
            boxShadow: activeTab === 'surveyors' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          Surveyors Directory
        </button>
      </div>

      {/* Tab 1: Surveys List */}
      {activeTab === 'surveys' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Survey ID', 'Notification', 'Farmer', 'Crop', 'District', 'Assigned Surveyor', 'Due / Survey Date', 'Loss %', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <ClipboardCheck size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No Survey Assignments Found</div>
                    <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                      {pendingLosses.length > 0
                        ? `There are ${pendingLosses.length} loss notifications awaiting surveyor assignment. Switch to the "Awaiting Survey" tab to assign.`
                        : 'No loss notifications currently require survey.'}
                    </div>
                  </td>
                </tr>
              ) : (
                surveys.map((s, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#6A0DAD', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{s.id}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#C0392B', fontFamily: 'DM Mono, monospace' }}>{s.notifId}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1A2332', fontWeight: 500 }}>{s.farmer}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{s.crop}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{s.district}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{s.surveyor}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#9CA3AF' }}>{s.due}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: s.lossEstimate ? '#C0392B' : '#9CA3AF', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>
                      {s.lossEstimate != null ? `${s.lossEstimate}%` : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: STATUS_CHIP[s.status]?.bg || '#DBEAFE', color: STATUS_CHIP[s.status]?.text || '#1E40AF' }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.status === 'In Progress' && (
                          <>
                            <button
                              onClick={() => { setSelectedSurvey(s); setActiveTab('submit'); }}
                              style={{ fontSize: 12, color: '#1B5E8A', background: 'none', border: '1px solid #1B5E8A', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                            >
                              Submit Assessment
                            </button>
                            {canAssign && (
                              <button
                                onClick={() => handleUnassignSurvey(s.rawId)}
                                title="Cancel assignment and return notification to pending list"
                                style={{ fontSize: 12, color: '#991B1B', background: '#FEE2E2', border: '1px solid #FCA5A5', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Unassign
                              </button>
                            )}
                          </>
                        )}
                        {canAssign && s.status === 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(s.rawId, 'VERIFIED')}
                            style={{ fontSize: 12, color: '#166534', background: '#DCFCE7', border: '1px solid #86EFAC', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Verify Sign-off
                          </button>
                        )}
                        {canAssign && s.status === 'Verified' && (
                          <span style={{ fontSize: 11, color: '#6A0DAD', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={14} /> Claim Ready
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Loss Notifications Awaiting Survey (Pending Assignment) */}
      {activeTab === 'pending' && (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#92400E' }}>
                Farmer Loss Intimations Awaiting Field Surveyor Assignment
              </div>
              <div style={{ fontSize: 12, color: '#B45309', marginTop: 2 }}>
                PMFBY statutory mandate requires surveyor inspection assignment within 48 hours of loss intimation.
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E', background: '#FDE68A', padding: '4px 10px', borderRadius: 20 }}>
              {pendingLosses.length} Pending
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Notification ID', 'Farmer', 'Crop', 'District', 'Loss Type', 'Affected Area', 'Incident Date', 'GPS Coords', 'Assign Action'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingLosses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <CheckCircle size={36} color="#166534" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#166534' }}>All Loss Notifications Assigned!</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                      No incoming loss intimations are currently waiting for surveyor dispatch.
                    </div>
                  </td>
                </tr>
              ) : (
                pendingLosses.map((l, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#C0392B', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{l.displayId}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1A2332', fontWeight: 500 }}>{l.farmer}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{l.crop}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{l.district}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#C0392B', fontWeight: 600 }}>{l.cause}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{l.area}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748B' }}>{l.date}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#6B7A8D', fontFamily: 'DM Mono, monospace' }}>{l.lat}, {l.lng}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canAssign ? (
                          <button
                            onClick={() => setAssignModal(l)}
                            style={{
                              padding: '6px 14px', borderRadius: 8, background: '#1B5E8A', color: 'white',
                              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                            }}
                          >
                            <User size={13} /> Assign Surveyor
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartAssessmentFromLoss(l)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, background: '#166534', color: 'white',
                              border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                            }}
                          >
                            <ClipboardCheck size={13} /> Conduct Survey
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Assignment Modal Dialog */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '18px 24px', background: '#0F2744', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Assign Field Surveyor</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{assignModal.displayId} • {assignModal.farmer} ({assignModal.crop})</div>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAssignSurveyor} style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Select Field Surveyor *
                </label>
                <select
                  value={selectedSurveyorId}
                  onChange={e => setSelectedSurveyorId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}
                >
                  {surveyors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (ID: {s.id}) — {s.district || 'District Surveyor'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Scheduled Inspection Date *
                </label>
                <input
                  type="date"
                  value={surveyDate}
                  onChange={e => setSurveyDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  style={{ padding: '10px 18px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '10px 20px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  {loading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Surveyor Modal Dialog */}
      {showAddSurveyor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 480, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '18px 24px', background: '#166534', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Onboard New Field Surveyor</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Register an accredited PMFBY crop loss assessment officer</div>
              </div>
              <button onClick={() => setShowAddSurveyor(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterSurveyor} style={{ padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={surveyorForm.name}
                  onChange={e => setSurveyorForm({ ...surveyorForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.survey@gov.in"
                  value={surveyorForm.email}
                  onChange={e => setSurveyorForm({ ...surveyorForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={surveyorForm.phoneNumber}
                    onChange={e => setSurveyorForm({ ...surveyorForm, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                    District Base *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik"
                    value={surveyorForm.district}
                    onChange={e => setSurveyorForm({ ...surveyorForm, district: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Surveyor@123"
                  value={surveyorForm.password}
                  onChange={e => setSurveyorForm({ ...surveyorForm, password: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddSurveyor(false)}
                  style={{ padding: '10px 18px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '10px 20px', borderRadius: 8, background: '#166534', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
                >
                  {loading ? 'Creating...' : 'Register Surveyor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Submit Assessment Form */}
      {activeTab === 'submit' && (
        <div style={{ maxWidth: 640, background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={32} color="#166534" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332' }}>Ground Assessment Recorded</h3>
              <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 16 }}>
                Survey for {selectedSurvey?.id || 'SRV-1041'} submitted successfully.
              </p>
              {claimInitiatedMsg && (
                <div style={{ margin: '0 auto 20px', padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#166534', maxWidth: 480 }}>
                  <strong>Claim Automated:</strong> {claimInitiatedMsg}
                </div>
              )}
              <button
                onClick={() => { setActiveTab('surveys'); setSubmitted(false); }}
                style={{ padding: '8px 20px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Back to Surveys
              </button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>
                Submit Yield Loss Assessment — {selectedSurvey?.id || (surveys[0]?.id || 'SRV-1')}
              </h3>
              <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 20 }}>
                Farmer: {selectedSurvey?.farmer || surveys[0]?.farmer || 'Ramesh Kumar'} • Crop: {selectedSurvey?.crop || surveys[0]?.crop || 'Paddy'}
              </p>

              {surveys.length > 1 && !selectedSurvey && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                    Select Survey Assignment
                  </label>
                  <select
                    onChange={e => {
                      const found = surveys.find(s => s.id === e.target.value);
                      if (found) setSelectedSurvey(found);
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}
                  >
                    {surveys.map(s => (
                      <option key={s.id} value={s.id}>{s.id} — {s.farmer} ({s.crop})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Assessed Loss Percentage ({lossVal}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lossVal}
                  onChange={e => setLossVal(e.target.value)}
                  style={{ width: '100%', accentColor: '#C0392B' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Assessed Harvest Yield (kg / Ha)
                </label>
                <input
                  type="number"
                  value={yieldAssessed}
                  onChange={e => setYieldAssessed(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                  Surveyor Observations & Sign-Off
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                />
              </div>

              <button
                onClick={handleSubmitAssessment}
                disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                {loading ? 'Submitting Assessment...' : 'Sign & Submit Ground Report'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Surveyors Directory */}
      {activeTab === 'surveyors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Accredited Field Surveyors Directory</div>
              <div style={{ fontSize: 12, color: '#6B7A8D', marginTop: 2 }}>Authorized loss assessment officers conducting on-ground CCE (Crop Cutting Experiments) and satellite verification</div>
            </div>
            <button
              onClick={() => setShowAddSurveyor(true)}
              style={{
                padding: '8px 16px', borderRadius: 8, background: '#166534', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Plus size={14} /> Onboard New Surveyor
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {surveyors.map((s, idx) => {
            const assignedCount = surveys.filter(sv => sv.surveyorId === s.id).length;
            return (
              <div key={idx} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#7B3F0015', color: '#7B3F00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {s.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7A8D' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 10 }}>District: <strong>{s.district || 'Maharashtra / MP'}</strong></div>
                <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
                  <span>Assigned: <strong>{assignedCount}</strong></span>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Active Field Assessor</span>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
