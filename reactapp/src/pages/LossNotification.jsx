import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyApi, lossNotificationApi } from '../services/api';
import Toast from '../components/common/Toast';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Calendar, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  LocateFixed 
} from 'lucide-react';

const SAMPLE_DAMAGE_PHOTOS = [
  { label: 'Inundated Field (Flood)', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Severe Drought Cracks', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Hailstorm Impact', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pest Infestation', url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80' },
];

export const LossNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [formData, setFormData] = useState({
    lossType: 'FLOOD',
    incidentDate: new Date().toISOString().split('T')[0],
    estimatedLossPercentage: '65',
    remarks: 'Heavy torrential rainfall caused standing water logging across the parcel for 4 consecutive days.',
    latitude: '23.2599',
    longitude: '77.4126',
    photoEvidenceUrl: SAMPLE_DAMAGE_PHOTOS[0].url,
  });

  const [loading, setLoading] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadFarmerPolicies();
    }
  }, [user]);

  const loadFarmerPolicies = async () => {
    try {
      const res = await policyApi.getPoliciesByFarmer(user.id);
      const active = res.data || [];
      setPolicies(active);
      if (active.length > 0) {
        setSelectedPolicyId(active[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGeoLocating(false);
        setToast({ type: 'success', message: 'Accurate GPS coordinates captured successfully!' });
      },
      (error) => {
        setGeoLocating(false);
        setToast({
          type: 'info',
          message: 'Could not fetch device GPS. Defaulting to state agricultural center coordinates.',
        });
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicyId) {
      setToast({ type: 'error', message: 'Please select an insured policy to report damage against.' });
      return;
    }

    setLoading(true);
    try {
      await lossNotificationApi.reportLoss(selectedPolicyId, {
        lossType: formData.lossType,
        incidentDate: formData.incidentDate,
        estimatedLossPercentage: parseFloat(formData.estimatedLossPercentage),
        remarks: formData.remarks,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        photoEvidenceUrl: formData.photoEvidenceUrl,
      });

      setToast({ type: 'success', message: 'Crop loss reported successfully! Surveyor assignment initiated.' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to lodge crop loss notification.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="glass-card p-6 sm:p-8 border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4 mb-6 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Intimate Crop Loss Damage</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit prompt intimation within 72 hours of localized natural calamities (PMFBY Guidelines).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Policy Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Affected Insured Crop Policy
            </label>
            {policies.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400">
                No active policies found. Please enroll a crop policy first before lodging loss.
              </div>
            ) : (
              <select
                value={selectedPolicyId}
                onChange={(e) => setSelectedPolicyId(e.target.value)}
                className="glass-select font-semibold text-white"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    Policy #{p.id} — {p.cropName} ({p.season}) • Khasra: {p.khasraNumber} • {p.sownAreaHectares} Ha
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Loss Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cause of Damage (Loss Type)
              </label>
              <select
                value={formData.lossType}
                onChange={(e) => setFormData({ ...formData, lossType: e.target.value })}
                className="glass-select font-semibold text-rose-400"
              >
                <option value="FLOOD" className="bg-slate-900 text-white">Inundation / Flood</option>
                <option value="DROUGHT" className="bg-slate-900 text-white">Severe Drought</option>
                <option value="HAILSTORM" className="bg-slate-900 text-white">Hailstorm Damage</option>
                <option value="PEST" className="bg-slate-900 text-white">Pest / Disease Attack</option>
                <option value="FIRE" className="bg-slate-900 text-white">Natural / Lightning Fire</option>
                <option value="CYCLONE" className="bg-slate-900 text-white">Cyclone / High Wind</option>
                <option value="OTHER" className="bg-slate-900 text-white">Other Natural Calamity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Date
              </label>
              <input
                type="date"
                required
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                className="glass-input text-slate-200"
              />
            </div>
          </div>

          {/* Estimated Loss % Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Farmer's Estimated Crop Damage
              </label>
              <span className="text-sm font-black font-mono text-rose-400">
                {formData.estimatedLossPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={formData.estimatedLossPercentage}
              onChange={(e) => setFormData({ ...formData, estimatedLossPercentage: e.target.value })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Partial (10%)</span>
              <span>Substantial (50%)</span>
              <span>Total Destruction (100%)</span>
            </div>
          </div>

          {/* Geo-tagging Section */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> Ground GPS Coordinates
              </span>
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={geoLocating}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                {geoLocating ? 'Acquiring GPS...' : 'Auto-Detect Device GPS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Latitude</span>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="glass-input font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Longitude</span>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="glass-input font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Photo Evidence Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-teal-400" /> Photographic Damage Evidence
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {SAMPLE_DAMAGE_PHOTOS.map((photo) => (
                <button
                  key={photo.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, photoEvidenceUrl: photo.url })}
                  className={`p-1 rounded-xl border text-left overflow-hidden transition-all ${
                    formData.photoEvidenceUrl === photo.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt={photo.label} className="w-full h-16 object-cover rounded-lg" />
                  <div className="text-[10px] text-slate-300 truncate mt-1 px-1">{photo.label}</div>
                </button>
              ))}
            </div>

            <input
              type="url"
              value={formData.photoEvidenceUrl}
              onChange={(e) => setFormData({ ...formData, photoEvidenceUrl: e.target.value })}
              placeholder="Or enter custom image URL"
              className="glass-input text-xs font-mono"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Observations / Damage Notes
            </label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="glass-input text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || policies.length === 0}
              className="btn-danger flex items-center gap-2 px-6 py-3 w-full sm:w-auto"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" /> Submit Crop Loss Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LossNotification;
