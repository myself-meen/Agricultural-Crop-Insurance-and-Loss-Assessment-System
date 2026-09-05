import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import Toast from '../components/common/Toast';
import { FileText, Search, ShieldCheck, Clock, User, HardDrive } from 'lucide-react';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.getAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch immutable audit logs.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actorEmail && log.actorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Immutable Audit Trail & System Event Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail of all policy enrollments, actuarial approvals, and DBT payouts.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search action, actor email, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input pl-9 text-xs"
          />
        </div>
      </div>

      <div className="glass-card border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Querying audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-emerald-400 font-bold">#{log.id}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {log.entityName} #{log.entityId}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="font-sans font-medium text-white">{log.actorEmail || 'System'}</div>
                      <div className="text-[10px] text-slate-500">{log.actorRole || 'SYSTEM'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate" title={log.details}>
                      {log.details || 'System event recorded.'}
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

export default AuditLogViewer;
