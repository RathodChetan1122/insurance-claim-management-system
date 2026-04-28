import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { statusBadge, priorityBadge, formatCurrency, formatDate, claimTypeIcon } from '../utils/helpers';

const STATUSES = ['', 'Submitted', 'Under Review', 'Additional Info Required', 'Approved', 'Rejected'];
const TYPES = ['', 'Auto', 'Home', 'Health', 'Travel', 'Life', 'Commercial'];

export default function ClaimsList() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });

  const fetchClaims = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.type) params.type = filters.type;
    if (filters.search) params.search = filters.search;
    api.get('/claims/', { params }).then(r => setClaims(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClaims(); }, [filters.status, filters.type]);

  const set = k => e => setFilters(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Claims</h1>
          <p className="page-subtitle">{claims.length} claim{claims.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/submit" className="btn btn-primary">＋ New Claim</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">Search</label>
            <input className="form-input" placeholder="Claim number or description..."
              value={filters.search} onChange={set('search')}
              onKeyDown={e => e.key === 'Enter' && fetchClaims()} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Status</label>
            <select className="form-input" value={filters.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Type</label>
            <select className="form-input" value={filters.type} onChange={set('type')}>
              {TYPES.map(t => <option key={t} value={t}>{t || 'All types'}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchClaims}>Search</button>
          <button className="btn btn-secondary" onClick={() => setFilters({ status: '', type: '', search: '' })}>Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><span className="spinner" /></div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No claims found</h3>
            <p style={{ marginBottom: 16 }}>Try adjusting your filters or submit a new claim</p>
            <Link to="/submit" className="btn btn-primary">＋ Submit Claim</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Claim #</th><th>Type</th><th>Description</th>
                  <th>Amount</th><th>Priority</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{c.claim_number}</td>
                    <td>{claimTypeIcon(c.claim_type)} {c.claim_type}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{c.description}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{formatDate(c.created_at)}</td>
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
