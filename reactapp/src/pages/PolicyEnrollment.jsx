import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyApi } from '../services/api';
import Toast from '../components/common/Toast';
import { Sprout, Calculator, ShieldCheck, ArrowRight, AlertCircle, IndianRupee } from 'lucide-react';

export const PolicyEnrollment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropName: 'Paddy (Rice)',
    season: 'KHARIF',
    sownAreaHectares: '2.5',
    sumInsuredPerHectare: '45000',
    khasraNumber: 'KH-108/3',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // Compute PMFBY premium breakdown in real-time
  const area = parseFloat(formData.sownAreaHectares) || 0;
  const perHa = parseFloat(formData.sumInsuredPerHectare) || 0;
  const totalSumInsured = area * perHa;

  let farmerRate = 0.02; // Kharif 2%
  if (formData.season === 'RABI') farmerRate = 0.015; // Rabi 1.5%
  if (formData.season === 'ZAID') farmerRate = 0.05; // Zaid 5.0%

  const actuarialRate = 0.10; // 10% benchmark actuarial cost
  const totalPremium = totalSumInsured * actuarialRate;
  const farmerPremium = totalSumInsured * farmerRate;
  const totalSubsidy = Math.max(0, totalPremium - farmerPremium);
  const centralSubsidy = totalSubsidy / 2;
  const stateSubsidy = totalSubsidy / 2;

  const validate = () => {
    const errs = {};
    if (!formData.cropName.trim()) errs.cropName = 'Crop name is required';
    if (!formData.khasraNumber.trim()) errs.khasraNumber = 'Khasra / Land parcel ID is required';
    if (area <= 0) errs.sownAreaHectares = 'Sown area must be greater than 0';
    if (perHa <= 0) errs.sumInsuredPerHectare = 'Sum insured per hectare must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await policyApi.enrollPolicy(user.id, {
        cropName: formData.cropName,
        season: formData.season,
        sownAreaHectares: area,
        sumInsuredPerHectare: perHa,
        khasraNumber: formData.khasraNumber,
      });

      setToast({ type: 'success', message: 'Crop insurance policy enrolled successfully!' });
      setTimeout(() => {
        navigate('/policies');
      }, 1200);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to enroll crop policy.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sprout className="w-6 h-6 text-emerald-400" /> New Crop Policy Enrollment
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          PMFBY Subsidized Agricultural Insurance Application with instantaneous premium calculation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Crop Cultivated
                </label>
                <input
                  type="text"
                  required
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  placeholder="e.g. Paddy, Wheat, Soybean"
                  className={`glass-input ${errors.cropName ? 'border-rose-500' : ''}`}
                />
                {errors.cropName && <p className="text-[11px] text-rose-400 mt-1">{errors.cropName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cropping Season
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  className="glass-select font-semibold text-emerald-400"
                >
                  <option value="KHARIF" className="bg-slate-900 text-white">Kharif (Monsoon - 2% Premium)</option>
                  <option value="RABI" className="bg-slate-900 text-white">Rabi (Winter - 1.5% Premium)</option>
                  <option value="ZAID" className="bg-slate-900 text-white">Zaid / Commercial (5% Premium)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sown Area (in Hectares)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.sownAreaHectares}
                  onChange={(e) => setFormData({ ...formData, sownAreaHectares: e.target.value })}
                  placeholder="2.5"
                  className={`glass-input ${errors.sownAreaHectares ? 'border-rose-500' : ''}`}
                />
                {errors.sownAreaHectares && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.sownAreaHectares}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sum Insured / Hectare (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  required
                  value={formData.sumInsuredPerHectare}
                  onChange={(e) => setFormData({ ...formData, sumInsuredPerHectare: e.target.value })}
                  placeholder="45000"
                  className={`glass-input ${errors.sumInsuredPerHectare ? 'border-rose-500' : ''}`}
                />
                {errors.sumInsuredPerHectare && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.sumInsuredPerHectare}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Land Parcel / Khasra / Survey Number
              </label>
              <input
                type="text"
                required
                value={formData.khasraNumber}
                onChange={(e) => setFormData({ ...formData, khasraNumber: e.target.value })}
                placeholder="KH-108/3B (Revenue Survey Record)"
                className={`glass-input ${errors.khasraNumber ? 'border-rose-500' : ''}`}
              />
              {errors.khasraNumber && <p className="text-[11px] text-rose-400 mt-1">{errors.khasraNumber}</p>}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={loading || totalSumInsured <= 0}
                className="btn-primary flex items-center gap-2 px-6 py-3 w-full sm:w-auto"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm & Enroll Policy <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live PMFBY Calculator Breakdown Panel */}
        <div className="glass-card p-6 border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4 border-b border-slate-800 pb-3">
              <Calculator className="w-4 h-4" /> Live Premium Calculator
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Insured Sum:</span>
                <span className="font-mono font-bold text-white">
                  ₹{totalSumInsured.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Farmer Rate ({formData.season}):</span>
                <span className="font-semibold text-emerald-400">{(farmerRate * 100).toFixed(1)}%</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-slate-400 text-[11px]">Farmer Net Premium Payable</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  ₹{farmerPremium.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Directly payable upon enrollment</div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Government Subsidy (50:50 Share)
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Central Govt Share (50%):</span>
                  <span className="font-mono text-teal-400">
                    ₹{centralSubsidy.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>State Govt Share (50%):</span>
                  <span className="font-mono text-teal-400">
                    ₹{stateSubsidy.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold text-[11px] pt-1 border-t border-slate-800/50">
                  <span>Total Govt Subsidy:</span>
                  <span className="font-mono text-emerald-400">
                    ₹{totalSubsidy.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>PMFBY Statutory Premium Safeguard Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyEnrollment;
