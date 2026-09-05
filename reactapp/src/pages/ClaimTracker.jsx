import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { claimApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Search, 
  DollarSign, 
  FileText, 
  CheckCheck,
  Send
} from 'lucide-react';

export const ClaimTracker = () => {
  const { user, role } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal
  const [rejectClaimId, setRejectClaimId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Remarks prompt
  const [remarks, setRemarks] = useState('Documents and field surveyor assessment verified.');

  useEffect(() => {
    loadClaims();
  }, [user, role]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await claimApi.getAllClaims();
      setClaims(res.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load insurance claims.' });
    } finally {
      setLoading(false);
    }
  };

  const handleL1Approve = async (claimId) => {
    setActionLoading(true);
    try {
      await claimApi.approveL1(claimId, user.id, remarks);
      setToast({ type: 'success', message: `Claim #${claimId} Level 1 Approved!` });
      loadClaims();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'L1 Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleL2Approve = async (claimId) => {
    setActionLoading(true);
    try {
      await claimApi.approveL2(claimId, user.id, remarks);
      setToast({ type: 'success', message: `Claim #${claimId} Level 2 Final Approved! Ready for DBT Disbursement.` });
      loadClaims();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'L2 Approval failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectClaimId || !rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      await claimApi.rejectClaim(rejectClaimId, user.id, rejectionReason);
      setToast({ type: 'success', message: `Claim #${rejectClaimId} has been rejected.` });
      setRejectClaimId(null);
      setRejectionReason('');
      loadClaims();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Rejection failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburseDBT = async (claimId) => {
    setActionLoading(true);
    try {
      const res = await claimApi.disburseDbt(claimId);
      const utr = res.data?.utrNumber || 'GENERATED';
      setToast({ 
        type: 'success', 
        message: `DBT Disbursed! Ref UTR: ${utr}. Associated policy marked SETTLED.` 
      });
      loadClaims();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'DBT Disbursement failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredClaims = claims.filter((c) => {
    return (
      c.id.toString().includes(searchTerm) ||
      (c.status && c.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            Two-Tier Actuarial Claims & DBT Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute Level 1 verification, Level 2 senior clearance, and electronic Direct Benefit Transfer.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search claim ID or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="glass-card border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Loading insurance claims...</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No claims recorded yet in the actuarial settlement grid.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Claim ID</th>
                  <th className="py-3.5 px-4">Survey Ref</th>
                  <th className="py-3.5 px-4">Sanctioned Amount</th>
                  <th className="py-3.5 px-4">Lifecycle Status</th>
                  <th className="py-3.5 px-4">L1 Officer</th>
                  <th className="py-3.5 px-4">L2 Officer</th>
                  <th className="py-3.5 px-4">DBT UTR</th>
                  <th className="py-3.5 px-4 text-right">Actuarial Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      CLM-{c.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      SRV-{c.surveyAssignmentId || c.surveyId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      ₹{c.claimAmount?.toLocaleString('en-IN') || '0.00'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.level1ApprovedBy ? (
                        <span className="text-purple-400 font-medium">Officer #{c.level1ApprovedBy}</span>
                      ) : (
                        'Pending'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.level2ApprovedBy ? (
                        <span className="text-teal-400 font-medium">Officer #{c.level2ApprovedBy}</span>
                      ) : (
                        'Pending'
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 text-[11px]">
                      {c.utrNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* L1 Approval */}
                      {c.status === 'CLAIM_INITIATED' && (role === 'INSURER' || role === 'STATE_OFFICER' || role === 'ADMIN') && (
                        <>
                          <button
                            onClick={() => handleL1Approve(c.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-semibold cursor-pointer"
                          >
                            L1 Approve
                          </button>
                          <button
                            onClick={() => setRejectClaimId(c.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* L2 Approval */}
                      {c.status === 'LEVEL1_APPROVED' && (role === 'INSURER' || role === 'STATE_OFFICER' || role === 'ADMIN') && (
                        <>
                          <button
                            onClick={() => handleL2Approve(c.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/40 text-xs font-semibold cursor-pointer"
                          >
                            L2 Final Clear
                          </button>
                          <button
                            onClick={() => setRejectClaimId(c.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* DBT Payout Trigger */}
                      {(c.status === 'APPROVED' || c.status === 'LEVEL2_APPROVED') && (role === 'INSURER' || role === 'BANK_OFFICER' || role === 'ADMIN') && (
                        <button
                          onClick={() => handleDisburseDBT(c.id)}
                          disabled={actionLoading}
                          className="btn-primary text-xs py-1 px-3 flex items-center gap-1 inline-flex"
                        >
                          <Send className="w-3.5 h-3.5" /> Disburse DBT
                        </button>
                      )}

                      {c.status === 'SETTLED' && (
                        <span className="text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" /> Disbursed
                        </span>
                      )}

                      {c.status === 'REJECTED' && (
                        <span className="text-rose-400 font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectClaimId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 border-slate-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" /> Reject Insurance Claim #{rejectClaimId}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Please enter the statutory reason for rejecting this crop insurance claim.
            </p>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rejection Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Damage reported beyond 72h statutory window or crop not covered under notification."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectClaimId(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-danger text-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimTracker;
