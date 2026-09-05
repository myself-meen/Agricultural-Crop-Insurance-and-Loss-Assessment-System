import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  CheckCircle, 
  FileText, 
  X, 
  Sprout, 
  Calendar, 
  Printer 
} from 'lucide-react';

export const PolicyPortal = () => {
  const { user, role } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, [user, role]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      let res;
      if (role === 'FARMER' && user?.id) {
        res = await policyApi.getPoliciesByFarmer(user.id);
      } else {
        res = await policyApi.getAllPolicies();
      }
      setPolicies(res.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch insurance policies.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (policyId, newStatus) => {
    setActionLoading(true);
    try {
      await policyApi.updatePolicyStatus(policyId, newStatus);
      setToast({ type: 'success', message: `Policy #${policyId} status updated to ${newStatus}` });
      loadPolicies();
      if (selectedPolicy?.id === policyId) {
        setSelectedPolicy((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update policy status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      (p.cropName && p.cropName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.khasraNumber && p.khasraNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {role === 'FARMER' ? 'My Crop Insurance Policies' : 'National Policy Directory'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, verify and inspect registered PMFBY agricultural policies and coverage terms.
          </p>
        </div>

        {role === 'FARMER' && (
          <Link to="/enroll" className="btn-primary text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" /> Enroll New Crop
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-card p-4 border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by crop, Khasra, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'ENROLLED', 'APPROVED', 'SETTLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Policy Table */}
      <div className="glass-card border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Loading crop policies...</p>
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No policies matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Policy No.</th>
                  <th className="py-3.5 px-4">Crop Cultivated</th>
                  <th className="py-3.5 px-4">Season</th>
                  <th className="py-3.5 px-4">Area (Ha)</th>
                  <th className="py-3.5 px-4">Khasra No.</th>
                  <th className="py-3.5 px-4">Sum Insured</th>
                  <th className="py-3.5 px-4">Farmer Share</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPolicies.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      PMFBY-{p.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{p.cropName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.season}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{p.sownAreaHectares} Ha</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{p.khasraNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      ₹{p.totalSumInsured?.toLocaleString('en-IN') || (p.sownAreaHectares * p.sumInsuredPerHectare).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      ₹{p.farmerPremiumShare?.toLocaleString('en-IN') || 'Calculated'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedPolicy(p)}
                        className="text-slate-300 hover:text-white p-1.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        title="View Certificate"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {(role === 'INSURER' || role === 'ADMIN') && p.status === 'ENROLLED' && (
                        <button
                          onClick={() => handleStatusUpdate(p.id, 'APPROVED')}
                          disabled={actionLoading}
                          className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          title="Approve Policy"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Certificate Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 border-emerald-500/30 relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Header */}
            <div className="text-center border-b border-slate-800 pb-4 mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                <Sprout className="w-4 h-4" /> Government of India • PMFBY
              </div>
              <h3 className="text-xl font-extrabold text-white">Digital Crop Insurance Certificate</h3>
              <p className="text-xs font-mono text-emerald-400 mt-1">
                Certificate Ref: PMFBY-CERT-2026-{selectedPolicy.id}
              </p>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Insured Crop & Season</span>
                <span className="text-sm font-bold text-white">
                  {selectedPolicy.cropName} ({selectedPolicy.season})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Land Parcel (Khasra No.)</span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedPolicy.khasraNumber}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Insured Sown Area</span>
                <span className="text-sm font-bold text-white">
                  {selectedPolicy.sownAreaHectares} Hectares
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Total Sum Insured</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{selectedPolicy.totalSumInsured?.toLocaleString('en-IN') || (selectedPolicy.sownAreaHectares * selectedPolicy.sumInsuredPerHectare).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Farmer Premium Contribution</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{selectedPolicy.farmerPremiumShare?.toLocaleString('en-IN') || 'Subsidized'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Current Coverage Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedPolicy.status} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>

              <button
                onClick={() => setSelectedPolicy(null)}
                className="btn-primary text-xs px-5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyPortal;
