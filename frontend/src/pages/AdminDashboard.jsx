import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims/stats/summary').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>;

  const statusData = Object.entries(stats.by_status || {}).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(stats.by_type || {}).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Claims management overview</p>
        </div>
        <Link to="/admin/claims" className="btn btn-primary">📋 Manage Claims</Link>
      </div>

      {/* KPI cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Claims', value: stats.total_claims, icon: '📋' },
          { label: 'Total Users', value: stats.total_users, icon: '👥' },
          { label: 'Total Value', value: formatCurrency(stats.total_amount), icon: '💰' },
          { label: 'Approved Value', value: formatCurrency(stats.approved_amount), icon: '✅' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: typeof s.value === 'string' ? 18 : 32 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Status breakdown bar chart */}
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Claims by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} margin={{ top: 0, right: 10, bottom: 40, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type pie chart */}
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Claims by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick status cards */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Pending Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Submitted', count: stats.by_status?.Submitted || 0, color: '#3b82f6', urgent: true },
            { label: 'Under Review', count: stats.by_status?.['Under Review'] || 0, color: '#f59e0b' },
            { label: 'Info Required', count: stats.by_status?.['Additional Info Required'] || 0, color: '#8b5cf6' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
              border: `2px solid ${item.count > 0 && item.urgent ? item.color : 'var(--border)'}`,
              background: item.count > 0 && item.urgent ? `${item.color}10` : 'var(--bg2)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: item.count > 0 ? item.color : 'var(--text3)' }}>{item.count}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{item.label}</div>
              {item.count > 0 && <Link to="/admin/claims" style={{ fontSize: 11, color: item.color, fontWeight: 500 }}>Review →</Link>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
