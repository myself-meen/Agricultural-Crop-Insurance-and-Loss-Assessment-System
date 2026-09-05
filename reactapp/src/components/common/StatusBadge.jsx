import React from 'react';

const STATUS_CONFIGS = {
  // Policies
  ENROLLED: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Enrolled' },
  APPROVED: { bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30', label: 'Approved' },
  REJECTED: { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'Rejected' },
  EXPIRED: { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: 'Expired' },

  // Loss Notifications & Surveys
  SUBMITTED: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Submitted' },
  ASSIGNED: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'Assigned' },
  SURVEYED: { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', label: 'Survey Completed' },

  // Claims
  CLAIM_INITIATED: { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', label: 'Claim Initiated' },
  LEVEL1_APPROVED: { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', label: 'L1 Approved' },
  SETTLED: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Settled (DBT Paid)' },
  PAID: { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Paid' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    bg: 'bg-slate-500/10 text-slate-300 border-slate-700',
    label: status || 'Unknown',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
};

export default StatusBadge;
