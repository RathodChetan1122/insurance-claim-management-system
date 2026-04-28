import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { statusBadge, priorityBadge, formatCurrency, formatDate, claimTypeIcon } from '../utils/helpers';

const STATUSES = ['All', 'Submitted', 'Under Review', 'Additional Info Required', 'Approved', 'Rejected'];
const TYPES = ['All', 'Auto', 'Home', 'Health', 'Travel', 'Life', 'Commercial'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Normal', 'Low'];

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');
  const [quickStatus, setQuickStatus] = useState({});

  const fetchClaims = () => {
    setLoading(true);
    const params = {};
    if (status !== 'All') params.status = status;
    if (type !== 'All') params.type = type;
    if (search) params.search = search;
    api.get('/claims/', { params }).then(r => setClaims(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, [status, type, search]);

  const quickUpdate = async (claimId, newStatus) => {
    setQuickStatus(p => ({ ...p, [claimId]: true }));
    try {
      await api.patch(`/claims/${claimId}/status`, { status: newStatus, note: `Quick update by admin.` });
      fetchClaims();
    } catch (e) { alert('Failed to update.'); }
    finally { setQuickStatus(p => ({ ...p, [claimId]: false })); }
  };

  const pendingCount = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Claims</h1>
          <p className="page-subtitle">
            {claims.length} claim{claims.length !== 1 ? 's' : ''}
            {pendingCount > 0 && <span style={{ marginLeft: 8, color: 'var(--danger)', fontWeight: 600 }}>• {pendingCount} pending action</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" placeholder="🔍 Search claim # or description…"
            value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 180 }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-input" value={type} onChange={e => setType(e.target.value)} style={{ width: 140 }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {(status !== 'All' || type !== 'All' || search) &&
            <button className="btn btn-secondary btn-sm" onClick={() => { setStatus('All'); setType('All'); setSearch(''); }}>✕ Clear</button>}
        </div>

        {/* Quick filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'].map(s => (
            <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No claims found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim #</th><th>Claimant</th><th>Type</th>
                  <th>Amount</th><th>Priority</th><th>Status</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{c.claim_number}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.user_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.user_email}</div>
                    </td>
                    <td>{claimTypeIcon(c.claim_type)} {c.claim_type}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text2)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                        <Link to={`/claims/${c.id}`} className="btn btn-secondary btn-sm">View</Link>
                        {c.status === 'Submitted' && (
                          <button className="btn btn-sm" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                            onClick={() => quickUpdate(c.id, 'Under Review')} disabled={quickStatus[c.id]}>
                            {quickStatus[c.id] ? '…' : 'Review'}
                          </button>
                        )}
                        {c.status === 'Under Review' && (
                          <>
                            <button className="btn btn-sm" style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }}
                              onClick={() => quickUpdate(c.id, 'Approved')} disabled={quickStatus[c.id]}>✓</button>
                            <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}
                              onClick={() => quickUpdate(c.id, 'Rejected')} disabled={quickStatus[c.id]}>✕</button>
                          </>
                        )}
                      </div>
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
}
