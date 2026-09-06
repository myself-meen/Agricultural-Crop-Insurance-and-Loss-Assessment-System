import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Landmark, MapPin, CheckCircle, AlertCircle, Edit3, Save, Wheat } from './Icons';
import { farmerProfileApi } from '../services/api';

export default function FarmerProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    bankAccountNo: '',
    ifscCode: '',
    bankName: '',
    state: 'Maharashtra',
    district: 'Nashik',
    pincode: '422001',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await farmerProfileApi.getProfile(user.id);
      const data = res.data?.data || res.data;
      if (data && data.id) {
        setProfile(data);
        setFormData({
          aadhaarNumber: data.aadhaarNumber || '',
          bankAccountNo: data.bankAccountNo || '',
          ifscCode: data.ifscCode || '',
          bankName: data.bankName || '',
          state: data.state || 'Maharashtra',
          district: data.district || 'Nashik',
          pincode: data.pincode || '422001',
        });
      } else {
        setProfile(null);
        setIsEditing(true); // First-time setup: open form immediately
      }
    } catch (err) {
      // If 404 or profile not found, this is a first-time user
      setProfile(null);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate Aadhaar: 12 digits
    const cleanAadhaar = formData.aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMessage('Aadhaar number must be exactly 12 digits.');
      setSaving(false);
      return;
    }

    // Validate Bank account: min 9 digits
    const cleanBank = formData.bankAccountNo.replace(/\D/g, '');
    if (cleanBank.length < 9) {
      setErrorMessage('Bank account number must be at least 9 digits.');
      setSaving(false);
      return;
    }

    // Validate IFSC: 11 chars
    const cleanIfsc = formData.ifscCode.trim().toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setErrorMessage('Please enter a valid 11-character RBI IFSC code (e.g., SBIN0001234).');
      setSaving(false);
      return;
    }

    try {
      const res = await farmerProfileApi.saveProfile(user.id, {
        aadhaarNumber: cleanAadhaar,
        bankAccountNo: cleanBank,
        ifscCode: cleanIfsc,
        bankName: formData.bankName.trim() || 'State Bank of India',
        state: formData.state.trim() || 'Maharashtra',
        district: formData.district.trim() || 'Nashik',
        pincode: formData.pincode.trim() || '422001',
      });
      const savedData = res.data?.data || res.data;
      setProfile(savedData);
      setIsEditing(false);
      setSuccessMessage('Your Farmer KYC Profile has been successfully verified and saved to the PMFBY National Registry!');
      await loadProfile();
    } catch (err) {
      console.error('Failed to save profile:', err);
      setErrorMessage(err.message || 'Failed to save profile. Please check your information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7A8D' }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Loading your farmer profile...</div>
      </div>
    );
  }

  const isFirstTime = !profile;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', margin: 0 }}>
            {isFirstTime ? 'Farmer KYC Onboarding' : 'My Farmer Profile & KYC'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7A8D', margin: '4px 0 0' }}>
            Pradhan Mantri Fasal Bima Yojana (PMFBY) · Verified Citizen Registry
          </p>
        </div>
        {!isFirstTime && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 8, background: '#1B5E8A', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600
            }}
          >
            <Edit3 size={15} /> Update Profile
          </button>
        )}
      </div>

      {/* Success banner */}
      {successMessage && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8,
          background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <CheckCircle size={18} color="#166534" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', borderRadius: 8,
          background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <AlertCircle size={18} color="#991B1B" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* First-time setup welcome notice */}
      {isFirstTime && (
        <div style={{
          marginBottom: 24, padding: '18px 20px', borderRadius: 10,
          background: 'linear-gradient(135deg, #0F2744 0%, #1B5E8A 100%)', color: 'white',
          boxShadow: '0 4px 12px rgba(15, 39, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Wheat size={22} color="#4ADE80" />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Welcome to AgroShield, {user?.name}!</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>
            To enroll in crop insurance policies, calculate government subsidies, and receive Direct Benefit Transfer (DBT) claim settlements, you must first complete your one-time Aadhaar KYC and link your bank account below.
          </p>
        </div>
      )}

      {/* View Mode: Verified Profile Certificate Card */}
      {!isEditing && profile ? (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Card header */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#2E7D52', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700
              }}>
                {(user?.name || 'F').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A2332' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: '#6B7A8D', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span>Farmer ID: <strong>F-{user?.id}</strong></span>
                  <span>•</span>
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
              background: '#DCFCE7', color: '#166534', fontSize: 12, fontWeight: 700
            }}>
              <ShieldCheck size={16} /> KYC Verified & Aadhaar Seeded
            </div>
          </div>

          {/* Details grid */}
          <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Identity & Aadhaar */}
            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#1B5E8A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                <User size={16} /> Identity & Aadhaar
              </div>
              <div style={{ fontSize: 13, color: '#374151', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Full Name</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1A2332' }}>{user?.name}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Aadhaar Number (Encrypted)</span>
                  <span style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace', color: '#1A2332' }}>
                    XXXX-XXXX-{profile.aadhaarNumber ? profile.aadhaarNumber.slice(-4) : 'XXXX'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Designation / Category</span>
                  <span style={{ fontWeight: 600, color: '#2E7D52' }}>Registered Farmer</span>
                </div>
              </div>
            </div>

            {/* Bank & DBT Settlement */}
            <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#1B5E8A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                <Landmark size={16} /> Bank Account for Direct Benefit Transfer
              </div>
              <div style={{ fontSize: 13, color: '#374151', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Bank Name</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#1A2332' }}>{profile.bankName}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Account Number</span>
                  <span style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace', color: '#1A2332' }}>
                    XXXX-XXXX-{profile.bankAccountNo ? profile.bankAccountNo.slice(-4) : 'XXXX'}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>IFSC Code</span>
                  <span style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace', color: '#1A2332' }}>{profile.ifscCode}</span>
                </div>
              </div>
            </div>

            {/* Land & Location */}
            <div style={{ gridColumn: 'span 2', background: '#F8FAFC', borderRadius: 10, padding: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#1B5E8A', fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                <MapPin size={16} /> Farm Location & Domicile
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>State</span>
                  <span style={{ fontWeight: 600, color: '#1A2332' }}>{profile.state}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>District</span>
                  <span style={{ fontWeight: 600, color: '#1A2332' }}>{profile.district}</span>
                </div>
                <div>
                  <span style={{ color: '#6B7A8D', display: 'block', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Postal Pincode</span>
                  <span style={{ fontWeight: 600, color: '#1A2332' }}>{profile.pincode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit / Create Form */
        <form onSubmit={handleSave} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A2332' }}>
              {isFirstTime ? 'Step 1: Enter Your KYC & DBT Information' : 'Update Farmer KYC Profile'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7A8D' }}>
              Required by the Ministry of Agriculture for subsidized PMFBY enrollment and compensation.
            </p>
          </div>

          <div style={{ padding: '28px' }}>
            {/* Identity section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B5E8A', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} /> 1. Citizen Identity & Aadhaar
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Farmer Name</label>
                  <input value={user?.name || ''} disabled style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, background: '#F8FAFC', color: '#6B7A8D' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>12-Digit Aadhaar Number *</label>
                  <input
                    value={formData.aadhaarNumber}
                    maxLength={12}
                    onChange={e => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 555566667777"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            {/* Bank details for DBT */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B5E8A', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Landmark size={16} /> 2. Bank Account Details (For DBT Payouts)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Bank Name *</label>
                  <input
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. State Bank of India"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Account Number *</label>
                  <input
                    value={formData.bankAccountNo}
                    onChange={e => setFormData({ ...formData, bankAccountNo: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 987654321012"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>IFSC Code *</label>
                  <input
                    value={formData.ifscCode}
                    maxLength={11}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SBIN0001234"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>

            {/* Farm Location */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1B5E8A', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={16} /> 3. Farm Location & Address
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>State</label>
                  <input
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>District</label>
                  <input
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase' }}>Pincode</label>
                  <input
                    value={formData.pincode}
                    maxLength={6}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '18px 28px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            {!isFirstTime && (
              <button
                type="button"
                onClick={() => { setIsEditing(false); setErrorMessage(null); }}
                style={{ padding: '10px 20px', borderRadius: 8, background: 'white', border: '1px solid #E2E8F0', color: '#374151', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 8, background: '#2E7D52', color: 'white',
                border: 'none', cursor: saving ? 'wait' : 'pointer', fontSize: 14, fontWeight: 600
              }}
            >
              <Save size={16} /> {saving ? 'Verifying & Saving...' : isFirstTime ? 'Complete KYC Verification' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
