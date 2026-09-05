import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmerProfileApi } from '../services/api';
import Toast from '../components/common/Toast';
import { UserCheck, CreditCard, MapPin, LandPlot, ShieldCheck, Save, AlertCircle } from 'lucide-react';

export const FarmerProfile = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    bankAccountNumber: '',
    ifscCode: '',
    landHoldingHectares: '',
    state: '',
    district: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await farmerProfileApi.getProfile(user.id);
      if (res.data) {
        setFormData({
          aadhaarNumber: res.data.aadhaarNumber || '',
          bankAccountNumber: res.data.bankAccountNumber || '',
          ifscCode: res.data.ifscCode || '',
          landHoldingHectares: res.data.landHoldingHectares || '',
          state: res.data.state || '',
          district: res.data.district || '',
        });
      }
    } catch (err) {
      // 404 is normal if first time
      console.log('No existing profile found, ready to create new.');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      errs.aadhaarNumber = 'Aadhaar must be exactly 12 numeric digits';
    }
    if (!/^\d{9,18}$/.test(formData.bankAccountNumber)) {
      errs.bankAccountNumber = 'Bank account number must be between 9 and 18 digits';
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      errs.ifscCode = 'Invalid IFSC format (e.g. SBIN0001234)';
    }
    if (!formData.landHoldingHectares || Number(formData.landHoldingHectares) <= 0) {
      errs.landHoldingHectares = 'Please enter valid land holding in hectares';
    }
    if (!formData.state.trim()) {
      errs.state = 'State is required';
    }
    if (!formData.district.trim()) {
      errs.district = 'District is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await farmerProfileApi.saveProfile(user.id, {
        ...formData,
        ifscCode: formData.ifscCode.toUpperCase(),
        landHoldingHectares: Number(formData.landHoldingHectares),
      });
      setToast({ type: 'success', message: 'Farmer KYC and Bank Details saved successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update farmer profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to categorize farmer based on PMFBY standard landholding rules
  const getHoldingCategory = (ha) => {
    const val = Number(ha);
    if (!val || val <= 0) return 'Not Specified';
    if (val < 1.0) return 'Marginal Farmer (< 1 Ha)';
    if (val <= 2.0) return 'Small Farmer (1 - 2 Ha)';
    if (val <= 4.0) return 'Semi-Medium Farmer (2 - 4 Ha)';
    if (val <= 10.0) return 'Medium Farmer (4 - 10 Ha)';
    return 'Large Farmer (> 10 Ha)';
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Fetching verified farmer profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="glass-card p-6 sm:p-8 border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Farmer Profile & Bank KYC</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified Aadhaar and bank details are required for electronic DBT claim settlements.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Identity Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  12-Digit Aadhaar Number
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="555566667777"
                  className={`glass-input font-mono ${errors.aadhaarNumber ? 'border-rose-500' : ''}`}
                />
                {errors.aadhaarNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.aadhaarNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Name
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="glass-input bg-slate-900/50 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bank KYC Section */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-400" /> Direct Benefit Transfer (DBT) Bank Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="987654321012"
                  className={`glass-input font-mono ${errors.bankAccountNumber ? 'border-rose-500' : ''}`}
                />
                {errors.bankAccountNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.bankAccountNumber}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="SBIN0001234"
                  className={`glass-input font-mono uppercase ${errors.ifscCode ? 'border-rose-500' : ''}`}
                />
                {errors.ifscCode && <p className="text-[11px] text-rose-400 mt-1">{errors.ifscCode}</p>}
              </div>
            </div>
          </div>

          {/* Land Details Section */}
          <div className="pt-4 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <LandPlot className="w-4 h-4 text-amber-400" /> Landholding & Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Total Land Holding (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.landHoldingHectares}
                  onChange={(e) => setFormData({ ...formData, landHoldingHectares: e.target.value })}
                  placeholder="2.5"
                  className={`glass-input ${errors.landHoldingHectares ? 'border-rose-500' : ''}`}
                />
                {errors.landHoldingHectares && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.landHoldingHectares}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Madhya Pradesh"
                  className={`glass-input ${errors.state ? 'border-rose-500' : ''}`}
                />
                {errors.state && <p className="text-[11px] text-rose-400 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Sehore"
                  className={`glass-input ${errors.district ? 'border-rose-500' : ''}`}
                />
                {errors.district && <p className="text-[11px] text-rose-400 mt-1">{errors.district}</p>}
              </div>
            </div>

            {/* Live Farmer Category Pill */}
            {formData.landHoldingHectares && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Classified Category:</span>
                <span className="font-semibold text-emerald-400">
                  {getHoldingCategory(formData.landHoldingHectares)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6 py-2.5"
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Farmer Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerProfile;
