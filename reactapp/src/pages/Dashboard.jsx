import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  policyApi, 
  lossNotificationApi, 
  surveyApi, 
  claimApi, 
  analyticsApi, 
  farmerProfileApi 
} from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  ClipboardCheck, 
  CreditCard, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Sprout, 
  Calendar, 
  MapPin 
} from 'lucide-react';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentItems, setRecentItems] = useState([]);
  const [farmerProfile, setFarmerProfile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [role, user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (role === 'FARMER' && user?.id) {
        // Fetch farmer policies, losses, and profile
        const [policiesRes, profileRes, lossesRes] = await Promise.allSettled([
          policyApi.getPoliciesByFarmer(user.id),
          farmerProfileApi.getProfile(user.id),
          lossNotificationApi.getLossByFarmer(user.id),
        ]);

        const policies = policiesRes.status === 'fulfilled' ? policiesRes.value.data : [];
        const profile = profileRes.status === 'fulfilled' ? profileRes.value.data : null;
        const losses = lossesRes.status === 'fulfilled' ? lossesRes.value.data : [];

        setFarmerProfile(profile);
        setStats({
          totalPolicies: policies.length,
          activePolicies: policies.filter((p) => p.status === 'ENROLLED' || p.status === 'APPROVED').length,
          reportedLosses: losses.length,
          settledPolicies: policies.filter((p) => p.status === 'SETTLED').length,
        });
        setRecentItems(policies.slice(0, 5));
      } else if (role === 'SURVEYOR' && user?.id) {
        const res = await surveyApi.getSurveysBySurveyor(user.id);
        const surveys = res.data || [];
        setStats({
          assignedSurveys: surveys.filter((s) => s.status === 'ASSIGNED').length,
          completedSurveys: surveys.filter((s) => s.status === 'SURVEYED').length,
          totalAssigned: surveys.length,
        });
        setRecentItems(surveys.slice(0, 5));
      } else {
        // Insurer, Admin, State Officer, Bank Officer
        const [analyticsRes, policiesRes, claimsRes, lossesRes] = await Promise.allSettled([
          analyticsApi.getDashboardAnalytics(),
          policyApi.getAllPolicies(),
          claimApi.getAllClaims(),
          lossNotificationApi.getAllLosses(),
        ]);

        const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : {};
        const policies = policiesRes.status === 'fulfilled' ? policiesRes.value.data : [];
        const claims = claimsRes.status === 'fulfilled' ? claimsRes.value.data : [];
        const losses = lossesRes.status === 'fulfilled' ? lossesRes.value.data : [];

        setStats({
          totalPolicies: analytics.totalPolicies || policies.length,
          totalClaims: analytics.totalClaims || claims.length,
          claimSettlementRatio: analytics.claimSettlementRatio || 0,
          totalDisbursedAmount: analytics.totalDisbursedAmount || 0,
          pendingLosses: losses.filter((l) => l.status === 'SUBMITTED').length,
          pendingClaims: claims.filter((c) => c.status === 'CLAIM_INITIATED' || c.status === 'LEVEL1_APPROVED').length,
        });
        setRecentItems(claims.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-emerald-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {role} Portal
              </span>
              {farmerProfile && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {farmerProfile.district}, {farmerProfile.state}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Officer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {role === 'FARMER'
                ? 'Manage your insured land, monitor coverage subsidies, and lodge claim intimations.'
                : 'National Crop Insurance Administration & Actuarial Settlement Grid'}
            </p>
          </div>

          {/* Role-Specific Primary CTA */}
          <div className="flex flex-wrap gap-2">
            {role === 'FARMER' && (
              <>
                <Link to="/enroll" className="btn-primary text-xs flex items-center gap-1.5">
                  <Sprout className="w-4 h-4" /> Enroll New Crop
                </Link>
                <Link to="/report-loss" className="btn-secondary text-xs flex items-center gap-1.5 text-rose-300 hover:text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> Report Crop Loss
                </Link>
              </>
            )}
            {role === 'INSURER' && (
              <>
                <Link to="/surveys" className="btn-primary text-xs flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4" /> Assign Surveyors
                </Link>
                <Link to="/claims" className="btn-secondary text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Review Claims
                </Link>
              </>
            )}
            {role === 'SURVEYOR' && (
              <Link to="/surveys" className="btn-primary text-xs flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4" /> Go to Field Tasks
              </Link>
            )}
            {(role === 'ADMIN' || role === 'STATE_OFFICER') && (
              <Link to="/analytics" className="btn-primary text-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> View Analytics
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'FARMER' ? (
          <>
            <div className="glass-card p-5 border-emerald-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Active Crop Policies</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.activePolicies || 0}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Total Enrolled: {stats.totalPolicies || 0}</div>
            </div>

            <div className="glass-card p-5 border-amber-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Loss Intimations</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{stats.reportedLosses || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Logged with GPS tag</div>
            </div>

            <div className="glass-card p-5 border-teal-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Settled Claims</span>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-3xl font-extrabold text-teal-400">{stats.settledPolicies || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct Benefit Transferred</div>
            </div>

            <div className="glass-card p-5 border-slate-700">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Farmer KYC Status</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-base font-bold text-white mt-1">
                {farmerProfile ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Bank & Aadhaar Verified
                  </span>
                ) : (
                  <Link to="/profile" className="text-amber-400 text-xs underline">
                    Complete Profile Now
                  </Link>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {farmerProfile?.bankAccountNumber ? `A/C: ****${farmerProfile.bankAccountNumber.slice(-4)}` : 'Bank KYC Required'}
              </div>
            </div>
          </>
        ) : role === 'SURVEYOR' ? (
          <>
            <div className="glass-card p-5 border-amber-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Pending Field Inspections</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{stats.assignedSurveys || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Assigned by insurer</div>
            </div>

            <div className="glass-card p-5 border-emerald-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Completed Surveys</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{stats.completedSurveys || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">With GPS verification</div>
            </div>

            <div className="glass-card p-5 border-blue-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Assigned Lifetime</span>
                <ClipboardCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.totalAssigned || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Accredited surveyor queue</div>
            </div>

            <div className="glass-card p-5 border-teal-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>GPS Precision Check</span>
                <MapPin className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-lg font-bold text-teal-400 mt-1">Geo-Tagging On</div>
              <div className="text-[11px] text-slate-400 mt-1">HTML5 Geolocation Enabled</div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card p-5 border-emerald-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Enrolled Policies</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">{stats.totalPolicies || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Kharif, Rabi & Zaid</div>
            </div>

            <div className="glass-card p-5 border-blue-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Claims Logged</span>
                <CreditCard className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-blue-400">{stats.totalClaims || 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Actuarial assessment pipeline</div>
            </div>

            <div className="glass-card p-5 border-teal-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Settlement Ratio</span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-3xl font-extrabold text-teal-400">
                {(stats.claimSettlementRatio || 0).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Target: &gt; 90%</div>
            </div>

            <div className="glass-card p-5 border-amber-500/20">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total DBT Disbursed</span>
                <CreditCard className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400">
                ₹{(stats.totalDisbursedAmount || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Direct to bank accounts</div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card p-6 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            {role === 'FARMER' ? 'My Insured Crops' : role === 'SURVEYOR' ? 'Recent Assigned Inspections' : 'Recent Claims Activity'}
          </h3>
          <Link
            to={role === 'FARMER' ? '/policies' : role === 'SURVEYOR' ? '/surveys' : '/claims'}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No records found. Click the action buttons above to create your first record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.cropName || item.lossType || `Claim #${item.id}`}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {item.season ? `${item.season} • ${item.sownAreaHectares} Ha` : item.claimAmount ? `₹${item.claimAmount.toLocaleString()}` : item.remarks || 'Standard'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={role === 'FARMER' ? '/policies' : role === 'SURVEYOR' ? '/surveys' : '/claims'}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
