import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, Calendar, IndianRupee, AlertCircle } from './Icons';
import { policyApi, userApi } from '../services/api';

const STATUS_CHIP = {
  Active: { bg: '#DCFCE7', text: '#166534' },
  APPROVED: { bg: '#DCFCE7', text: '#166534' },
  ENROLLED: { bg: '#DBEAFE', text: '#1E40AF' },
  SETTLED: { bg: '#EDE9FE', text: '#5B21B6' },
  Expired: { bg: '#F1F5F9', text: '#6B7A8D' },
  Lapsed: { bg: '#FEE2E2', text: '#991B1B' },
  Pending: { bg: '#FEF3C7', text: '#92400E' },
};

const CROP_RATES = {
  Paddy: { sum: 50000, premiumRate: 0.02, season: 'KHARIF' },
  Wheat: { sum: 45000, premiumRate: 0.015, season: 'RABI' },
  Cotton: { sum: 65000, premiumRate: 0.05, season: 'ZAID' },
  Soybean: { sum: 50000, premiumRate: 0.02, season: 'KHARIF' },
  Maize: { sum: 40000, premiumRate: 0.02, season: 'KHARIF' },
  Sugarcane: { sum: 80000, premiumRate: 0.05, season: 'ZAID' },
};

export default function PolicyEnrollment({ user }) {
  const [showEnroll, setShowEnroll] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [area, setArea] = useState('2.5');
  const [khasraNumber, setKhasraNumber] = useState('147/A, 148/B');
  const [season, setSeason] = useState('KHARIF');
  const [enrolled, setEnrolled] = useState(false);
  const [filter, setFilter] = useState('All');
  const [policies, setPolicies] = useState([]);
  const [farmersList, setFarmersList] = useState([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdPolicyId, setCreatedPolicyId] = useState('POL-10422');
  const [errorMessage, setErrorMessage] = useState(null);

  const isFarmer = (user?.role || '').toLowerCase() === 'farmer';

  useEffect(() => {
    loadPolicies();
  }, [user]);

  const loadPolicies = async () => {
    try {
      let res;
      if (isFarmer && user?.id) {
        res = await policyApi.getPoliciesByFarmer(user.id);
      } else {
        res = await policyApi.getAllPolicies();
      }
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setPolicies(list.map(p => {
          const areaVal = p.sownAreaHa || p.sownAreaHectares || 2.5;
          const sumVal = p.sumInsured || (areaVal * 50000);
          const premVal = p.premiumFarmer || (sumVal * 0.02);
          return {
            id: `POL-${p.id}`,
            rawId: p.id,
            farmer: p.farmerName || (p.farmerId === 2 ? 'Farmer Ramesh' : (isFarmer ? (user?.name || 'Registered Farmer') : `Farmer #${p.farmerId || '1'}`)),
            crop: p.cropName || 'Paddy',
            season: `${p.season || 'KHARIF'} ${p.cropYear || 2026}`,
            area: `${areaVal} Ha`,
            sumInsured: `₹${Number(sumVal).toLocaleString()}`,
            premium: `₹${Number(premVal).toLocaleString()}`,
            status: p.status === 'ENROLLED' ? 'Active' : (p.status || 'Active'),
            startDate: p.enrollmentDate || '01 Jun 2026',
            endDate: '30 Nov 2026',
          };
        }));
      }
      if (!isFarmer) {
        try {
          const uRes = await userApi.getUsersByRole('FARMER');
          const fList = uRes.data?.data || uRes.data || [];
          if (Array.isArray(fList) && fList.length > 0) {
            setFarmersList(fList);
            setSelectedFarmerId(prev => prev || String(fList[0].id));
          }
        } catch (fErr) {
          console.warn('Failed to load farmers list:', fErr);
        }
      }
    } catch (e) {
      console.warn('Fallback to sample policies:', e);
    }
  };

  const rate = CROP_RATES[selectedCrop] || CROP_RATES.Paddy;
  const areaNum = parseFloat(area) || 0;
  const sumInsured = Math.round(rate.sum * areaNum);
  const farmerRate = season === 'RABI' ? 0.015 : season === 'ZAID' ? 0.05 : 0.02;
  const totalActuarialCost = Math.round(sumInsured * 0.10);
  const farmerShare = Math.round(sumInsured * farmerRate);
  const govtSubsidy = Math.max(0, totalActuarialCost - farmerShare);

  const handleEnroll = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const targetFarmerId = isFarmer ? (parseInt(user?.id) || 2) : (parseInt(selectedFarmerId) || 2);
      const enrolledById = isFarmer ? null : (parseInt(user?.id) || null);
      const res = await policyApi.enrollPolicy(targetFarmerId, {
        khasraSurveyNo: khasraNumber,
        cropName: selectedCrop,
        season: season,
        cropYear: new Date().getFullYear(),
        sownAreaHa: areaNum,
        sumInsured: sumInsured,
        farmerId: targetFarmerId,
        enrolledById: enrolledById,
        state: 'Maharashtra',
        district: 'Nashik',
      });
      const newPolicy = res.data?.data || res.data;
      const newId = newPolicy?.id || '10422';
      setCreatedPolicyId(`POL-${newId}`);
      setEnrolled(true);
      await loadPolicies();
    } catch (err) {
      console.error('API error enrolling policy:', err);
      setErrorMessage(err.message || 'Failed to enroll policy in database.');
    } finally {
      setLoading(false);
    }
  };

  const displayList = policies;
  const filtered = filter === 'All' ? displayList : displayList.filter(p => p.status === filter);

  if (enrolled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <CheckCircle size={36} color="#166534" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>Policy Enrolled Successfully</h2>
        <p style={{ fontSize: 14, color: '#6B7A8D', marginBottom: 8, textAlign: 'center' }}>
          Policy ID <strong style={{ fontFamily: 'DM Mono, monospace' }}>{createdPolicyId}</strong> issued under PM Fasal Bima Yojana
        </p>
        <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 24, textAlign: 'center', maxWidth: 380 }}>
          Subsidized farmer premium of <strong>₹{farmerShare.toLocaleString()}</strong> payable. Central & State subsidy of <strong>₹{govtSubsidy.toLocaleString()}</strong> applied automatically.
        </p>
        <button
          onClick={() => { setEnrolled(false); setShowEnroll(false); }}
          style={{ padding: '10px 24px', borderRadius: 8, background: '#1B5E8A', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}
        >
          View All Policies
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', margin: 0 }}>Policy Enrollment</h1>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>PMFBY · Agricultural crop insurance policy issuance and coverage terms</p>
        </div>
        {!showEnroll && (
          <button
            onClick={() => setShowEnroll(true)}
            style={{ padding: '10px 20px', borderRadius: 8, background: '#2E7D52', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}
          >
            + New Enrollment
          </button>
        )}
      </div>

      {showEnroll ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A2332' }}>New Policy Enrollment</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7A8D' }}>Fill in crop and season details to calculate premium</p>
            </div>
            <div style={{ padding: '24px' }}>
              {errorMessage && (
                <div style={{
                  marginBottom: 16, padding: '12px 16px', borderRadius: 8,
                  background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B',
                  fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>
                    {isFarmer ? 'Farmer Beneficiary' : 'Select Farmer Beneficiary *'}
                  </label>
                  {isFarmer ? (
                    <input value={user?.name || 'Farmer Ramesh'} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', color: '#6B7A8D' }} />
                  ) : (
                    <select
                      value={selectedFarmerId}
                      onChange={e => setSelectedFarmerId(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}
                    >
                      {farmersList.length > 0 ? (
                        farmersList.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.phoneNumber || f.email || `ID #${f.id}`})</option>
                        ))
                      ) : (
                        <option value="2">Farmer Ramesh (9876543210)</option>
                      )}
                    </select>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Season</label>
                  <select value={season} onChange={e => setSeason(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}>
                    <option value="KHARIF">Kharif (Monsoon - 2% Premium)</option>
                    <option value="RABI">Rabi (Winter - 1.5% Premium)</option>
                    <option value="ZAID">Zaid / Commercial (5% Premium)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Crop Cultivated</label>
                  <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: 'white' }}>
                    {Object.keys(CROP_RATES).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Insured Sown Area (Ha)</label>
                  <input type="number" value={area} onChange={e => setArea(e.target.value)} min="0.1" step="0.1" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'DM Mono, monospace' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Survey / Khasra / Gat Numbers</label>
                  <input value={khasraNumber} onChange={e => setKhasraNumber(e.target.value)} placeholder="147/A, 148/B" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'DM Mono, monospace' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 12 }}>
              <button onClick={() => setShowEnroll(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#374151', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button onClick={handleEnroll} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#2E7D52', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {loading ? 'Submitting...' : 'Confirm Enrollment & Issue Policy'}
              </button>
            </div>
          </div>

          {/* Premium calculator */}
          <div style={{ background: '#0F2744', borderRadius: 12, padding: '24px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <IndianRupee size={18} color="#4CAF91" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>Live Premium Calculator</h3>
            </div>
            <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Commodity & Area</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedCrop} · {area} Hectares</div>
            </div>
            {[
              { label: 'Total Sum Insured', value: `₹${sumInsured.toLocaleString()}`, highlight: false },
              { label: `Farmer Share (${(farmerRate * 100).toFixed(1)}%)`, value: `₹${farmerShare.toLocaleString()}`, highlight: true },
              { label: 'Central Subsidy (50%)', value: `₹${Math.round(govtSubsidy / 2).toLocaleString()}`, highlight: false },
              { label: 'State Subsidy (50%)', value: `₹${Math.round(govtSubsidy / 2).toLocaleString()}`, highlight: false },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: r.highlight ? 800 : 600, color: r.highlight ? '#4CAF91' : 'white', fontFamily: 'DM Mono, monospace' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 8, background: 'rgba(76,175,145,0.15)', border: '1px solid rgba(76,175,145,0.3)', fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
              PMFBY statutory rate cap protects the farmer. 50:50 equal subsidy absorbed by Central and State Governments.
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['All', 'Active', 'Expired', 'Lapsed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: filter === f ? 600 : 400,
                background: filter === f ? '#1B5E8A' : 'white', color: filter === f ? 'white' : '#6B7A8D',
                border: filter === f ? 'none' : '1px solid #E2E8F0', cursor: 'pointer',
              }}>{f}</button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B7A8D' }}>
                <FileText size={36} color="#9CA3AF" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>
                  {isFarmer ? 'No Enrolled Policies Found' : 'No Policies in Database'}
                </div>
                <div style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 16 }}>
                  {isFarmer
                    ? 'You have not enrolled any crop policies yet. Click "New Enrollment" above to calculate premium and get coverage.'
                    : 'No active or historical policies have been registered in the system.'}
                </div>
                {isFarmer && (
                  <button
                    onClick={() => setShowEnroll(true)}
                    style={{ padding: '8px 18px', borderRadius: 8, background: '#2E7D52', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  >
                    + Enroll New Crop Policy
                  </button>
                )}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Policy ID', 'Farmer', 'Crop', 'Season', 'Area', 'Sum Insured', 'Farmer Premium', 'Period', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#1B5E8A', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{p.id}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, color: '#1A2332' }}>{p.farmer}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{p.crop}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7A8D' }}>{p.season}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#374151' }}>{p.area}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#1A2332', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{p.sumInsured}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: '#2E7D52', fontWeight: 600, fontFamily: 'DM Mono, monospace' }}>{p.premium}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{p.startDate} – {p.endDate}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: STATUS_CHIP[p.status]?.bg || '#DCFCE7', color: STATUS_CHIP[p.status]?.text || '#166534' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
