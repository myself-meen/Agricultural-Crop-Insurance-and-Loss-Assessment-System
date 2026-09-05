import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import Toast from '../components/common/Toast';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  CreditCard, 
  AlertTriangle, 
  Percent, 
  PieChart, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getDashboardAnalytics();
      setData(res.data || {});
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load system analytics.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Aggregating national crop insurance actuarial metrics...</p>
      </div>
    );
  }

  const lossMap = data?.lossDistribution || {};
  const totalLossReports = Object.values(lossMap).reduce((acc, curr) => acc + curr, 0) || 1;

  const getLossColor = (type) => {
    switch (type) {
      case 'FLOOD': return 'bg-blue-500';
      case 'DROUGHT': return 'bg-amber-500';
      case 'HAILSTORM': return 'bg-cyan-500';
      case 'PEST': return 'bg-emerald-500';
      case 'FIRE': return 'bg-rose-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          National PMFBY Analytics & Actuarial Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-level overview of scheme enrollment, disaster intimation trends, and DBT fund settlement velocity.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Enrolled Crop Policies</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {data?.totalPolicies?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Aadhaar & Land verified
          </div>
        </div>

        <div className="glass-card p-5 border-blue-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Claims Sanctioned</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400">
            {data?.totalClaims?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Processed via 2-tier approval
          </div>
        </div>

        <div className="glass-card p-5 border-teal-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Settlement Ratio (CSR)</span>
            <Percent className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold text-teal-400">
            {(data?.claimSettlementRatio || 0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Statutory Target: &gt; 90%
          </div>
        </div>

        <div className="glass-card p-5 border-amber-500/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total DBT Disbursed</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            ₹{(data?.totalDisbursedAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Directly credited into farmer accounts
          </div>
        </div>
      </div>

      {/* Distribution Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calamity & Disaster Distribution */}
        <div className="glass-card p-6 border-slate-800">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" /> Damage Distribution by Calamity Type
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Proportion of crop loss reports categorized across non-preventable natural risks.
          </p>

          {Object.keys(lossMap).length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No loss incidents recorded yet for breakdown.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(lossMap).map(([type, count]) => {
                const pct = ((count / totalLossReports) * 100).toFixed(1);
                return (
                  <div key={type} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="font-semibold flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${getLossColor(type)}`} />
                        {type}
                      </span>
                      <span className="font-mono text-slate-400">
                        {count} reports ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${getLossColor(type)} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subsidy Allocation Breakdown */}
        <div className="glass-card p-6 border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" /> Statutory Premium Sharing Architecture
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Statutory cap ensures farmers pay only nominal rates while governments absorb the actuarial balance.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Farmer Net Contribution</div>
                  <div className="text-[11px] text-slate-400">Kharif: 2.0% • Rabi: 1.5% • Zaid: 5.0%</div>
                </div>
                <span className="text-emerald-400 font-mono font-bold text-sm">Direct Paid</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">Central Government Share</div>
                  <div className="text-[11px] text-slate-400">50% of Balance Actuarial Premium</div>
                </div>
                <span className="text-teal-400 font-mono font-bold text-sm">Centre Subsidized</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">State Government Share</div>
                  <div className="text-[11px] text-slate-400">50% of Balance Actuarial Premium</div>
                </div>
                <span className="text-teal-400 font-mono font-bold text-sm">State Subsidized</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Audited against Ministry of Agriculture PMFBY Operational Guidelines</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
