'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { apiRequest, formatDateTime } from '../../../lib/api';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/activity-logs?limit=50');
      if (res.success) setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Security & Activity Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit logs tracking stock adjustments, order modifications, pricing updates, and staff sessions
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-600 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User / Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4 font-mono text-slate-500">{formatDateTime(log.createdAt)}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{log.user?.fullName || 'System Automated'}</p>
                    <p className="text-[10px] text-blue-600 font-mono">{log.user?.email || 'SYSTEM'}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{log.action}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                      {log.entity}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 max-w-md">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
