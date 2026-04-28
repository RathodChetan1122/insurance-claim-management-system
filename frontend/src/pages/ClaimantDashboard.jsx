import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { statusBadge, formatCurrency, formatDate, claimTypeIcon } from '../utils/helpers';

const STATUS_ORDER = ['Submitted', 'Under Review', 'Additional Info Required', 'Approved', 'Rejected'];

export default function ClaimantDashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/claims/').then(r => setClaims(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = STATUS_ORDER.reduce((a, s) => ({ ...a, [s]: claims.filter(c => c.status === s).length }), {});
  const total = claims.reduce((s, c) => s + c.amount, 0);
  const approved = claims.filter(c => c.status === 'Approved').reduce((s, c) => s + c.amount, 0);
  const recent = [...claims].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's an overview of your insurance claims</p>
        </div>
        <Link to="/submit" className="btn btn-primary">＋ New Claim</Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Claims', value: claims.length, icon: '📋', sub: 'All time' },
          { label: 'Total Claimed', value: formatCurrency(total), icon: '💰', sub: 'Sum of all claims' },
          { label: 'Approved Amount', value: formatCurrency(approved), icon: '✅', sub: `${counts['Approved'] || 0} claims` },
          { label: 'Pending Review', value: (counts['Submitted'] || 0) + (counts['Under Review'] || 0), icon: '⏳', sub: 'Awaiting decision' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: typeof s.value === 'string' ? 20 : 32 }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Status pipeline */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Claim Status Pipeline</h3>
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
          {STATUS_ORDER.map((s, i) => (
            <div key={s} style={{ flex: 1, minWidth: 110, textAlign: 'center', position: 'relative' }}>
              {i < STATUS_ORDER.length - 1 && (
                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%) translateY(-8px)', color: 'var(--text3)', fontSize: 18, zIndex: 1 }}>›</div>
              )}
              <div style={{
                padding: '12px 6px', borderRadius: 10,
                background: counts[s] > 0 ? 'var(--primary)' : 'var(--bg2)',
                color: counts[s] > 0 ? '#fff' : 'var(--text3)',
                margin: '0 8px', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{counts[s] || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 500, marginTop: 4 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent claims */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>Recent Claims</h3>
          <Link to="/claims" className="btn btn-secondary btn-sm">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No claims yet</h3>
            <p style={{ marginBottom: 16 }}>Submit your first claim to get started</p>
            <Link to="/submit" className="btn btn-primary">Submit a claim</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim #</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.claim_number}</td>
                    <td>{claimTypeIcon(c.claim_type)} {c.claim_type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{formatDate(c.created_at)}</td>
                    <td><Link to={`/claims/${c.id}`} className="btn btn-secondary btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
