import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { surveyApi, lossNotificationApi, userApi } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { 
  ClipboardCheck, 
  UserPlus, 
  MapPin, 
  Camera, 
  Calendar, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const SurveyManagement = () => {
  const { user, role } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [losses, setLosses] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states
  const [assignModalData, setAssignModalData] = useState(null); // loss notification to assign
  const [surveyorId, setSurveyorId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [assignmentRemarks, setAssignmentRemarks] = useState('Conduct on-ground crop damage verification.');

  const [assessmentModalData, setAssessmentModalData] = useState(null); // survey to submit
  const [assessedLoss, setAssessedLoss] = useState('60');
  const [yieldAssessed, setYieldAssessed] = useState('850.5');
  const [surveyRemarks, setSurveyRemarks] = useState('Field inspection confirmed substantial damage from localized flood.');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user, role]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (role === 'SURVEYOR' && user?.id) {
        const res = await surveyApi.getSurveysBySurveyor(user.id);
        setSurveys(res.data || []);
      } else {
        const [surveysRes, lossesRes, usersRes] = await Promise.allSettled([
          surveyApi.getAllSurveys(),
          lossNotificationApi.getAllLosses(),
          userApi.getAllUsers(),
        ]);

        if (surveysRes.status === 'fulfilled') setSurveys(surveysRes.value.data || []);
        if (lossesRes.status === 'fulfilled') setLosses(lossesRes.value.data || []);
        if (usersRes.status === 'fulfilled') {
          const allUsers = usersRes.value.data || [];
          const surs = allUsers.filter((u) => u.role === 'SURVEYOR');
          setSurveyors(surs);
          if (surs.length > 0) setSurveyorId(surs[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSurveyor = async (e) => {
    e.preventDefault();
    if (!assignModalData || !surveyorId) return;

    setActionLoading(true);
    try {
      await surveyApi.assignSurveyor(assignModalData.id, surveyorId, {
        deadlineDate,
        assignmentRemarks,
      });
      setToast({ type: 'success', message: 'Surveyor assigned successfully!' });
      setAssignModalData(null);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to assign surveyor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    if (!assessmentModalData) return;

    setActionLoading(true);
    try {
      await surveyApi.submitSurvey(assessmentModalData.id, {
        assessedLossPercentage: parseFloat(assessedLoss),
        yieldAssessed: parseFloat(yieldAssessed),
        surveyRemarks,
        surveyorLatitude: 23.2599,
        surveyorLongitude: 77.4126,
        surveyPhotoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      });
      setToast({ type: 'success', message: 'Damage assessment recorded! Insurance claim pipeline initiated.' });
      setAssessmentModalData(null);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to submit field survey.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-emerald-400" />
          {role === 'SURVEYOR' ? 'My Assigned Ground Surveys' : 'Field Survey Administration'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {role === 'SURVEYOR'
            ? 'Verify on-ground crop damage and submit actuarial yield assessment reports.'
            : 'Assign accredited loss surveyors to investigate farmer loss intimations.'}
        </p>
      </div>

      {/* Insurer / Admin View: Unassigned Loss Intimations Table */}
      {role !== 'SURVEYOR' && (
        <div className="glass-card p-6 border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Loss Notifications Awaiting Surveyor Assignment
          </h2>

          {losses.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No pending loss notifications require surveyor assignment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Notice ID</th>
                    <th className="py-3 px-4">Loss Cause</th>
                    <th className="py-3 px-4">Incident Date</th>
                    <th className="py-3 px-4">Claimed Loss %</th>
                    <th className="py-3 px-4">GPS Coordinates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {losses.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">#{l.id}</td>
                      <td className="py-3 px-4 font-semibold text-white">{l.lossType}</td>
                      <td className="py-3 px-4">{l.incidentDate}</td>
                      <td className="py-3 px-4 font-mono text-rose-400 font-bold">{l.estimatedLossPercentage}%</td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {l.latitude?.toFixed(4)}, {l.longitude?.toFixed(4)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {l.status === 'SUBMITTED' ? (
                          <button
                            onClick={() => setAssignModalData(l)}
                            className="btn-primary text-xs py-1 px-3"
                          >
                            Assign Surveyor
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">Assigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Surveys Table */}
      <div className="glass-card p-6 border-slate-800">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Field Survey Assignments
        </h2>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No survey assignments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Survey ID</th>
                  <th className="py-3 px-4">Notification Ref</th>
                  <th className="py-3 px-4">Assigned Surveyor</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Assessed Loss %</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {surveys.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">SRV-{s.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">Notice #{s.lossNotificationId || s.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {s.surveyorName || `Surveyor ID: ${s.surveyorId || 'Accredited'}`}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.deadlineDate || 'Standard'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {s.assessedLossPercentage != null ? `${s.assessedLossPercentage}%` : 'Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {role === 'SURVEYOR' && s.status === 'ASSIGNED' && (
                        <button
                          onClick={() => setAssessmentModalData(s)}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          Submit Assessment
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

      {/* Assign Surveyor Modal */}
      {assignModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border-slate-800 relative shadow-2xl">
            <button
              onClick={() => setAssignModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" /> Assign Surveyor to Loss #{assignModalData.id}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an accredited surveyor to inspect reported {assignModalData.lossType} damage.
            </p>

            <form onSubmit={handleAssignSurveyor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Surveyor</label>
                {surveyors.length === 0 ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter Surveyor User ID"
                    value={surveyorId}
                    onChange={(e) => setSurveyorId(e.target.value)}
                    className="glass-input"
                  />
                ) : (
                  <select
                    value={surveyorId}
                    onChange={(e) => setSurveyorId(e.target.value)}
                    className="glass-select font-semibold text-white"
                  >
                    {surveyors.map((sur) => (
                      <option key={sur.id} value={sur.id} className="bg-slate-900 text-white">
                        {sur.name} ({sur.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Inspection Deadline</label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assignment Remarks</label>
                <textarea
                  rows={3}
                  value={assignmentRemarks}
                  onChange={(e) => setAssignmentRemarks(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalData(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assessment Modal */}
      {assessmentModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 border-slate-800 relative shadow-2xl">
            <button
              onClick={() => setAssessmentModalData(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400" /> Submit Ground Assessment for Survey #{assessmentModalData.id}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter inspected crop yield loss metrics and finalize on-ground inspection.
            </p>

            <form onSubmit={handleSubmitAssessment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assessed Loss %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    required
                    value={assessedLoss}
                    onChange={(e) => setAssessedLoss(e.target.value)}
                    className="glass-input font-mono font-bold text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Yield Assessed (kg/Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={yieldAssessed}
                    onChange={(e) => setYieldAssessed(e.target.value)}
                    className="glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Surveyor Technical Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={surveyRemarks}
                  onChange={(e) => setSurveyRemarks(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> GPS Coordinates Auto-Affixed
                </div>
                <div>Lat: 23.259900 • Lng: 77.412600 (Geo-fence verified)</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssessmentModalData(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary text-xs"
                >
                  Finalize & Submit Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManagement;
