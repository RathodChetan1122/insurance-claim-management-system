import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { statusBadge, priorityBadge, formatCurrency, formatDate, claimTypeIcon } from '../utils/helpers';

const STATUSES = ['All', 'Submitted', 'Under Review', 'Additional Info Required', 'Approved', 'Rejected'];
const TYPES = ['All', 'Auto', 'Home', 'Health', 'Travel', 'Life', 'Commercial'];

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (status !== 'All') params.status = status;
    if (type !== 'All') params.type = type;
    if (search) params.search = search;
    api.get('/claims/', { params }).then(r => setClaims(r.data)).finally(() => setLoading(false));
  }, [status, type, search]);

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
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" placeholder="🔍 Search by claim # or description…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }} />
          <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ width: 160 }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-input" value={type} onChange={e => setType(e.target.value)} style={{ width: 140 }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          {(status !== 'All' || type !== 'All' || search) &&
            <button className="btn btn-secondary btn-sm" onClick={() => { setStatus('All'); setType('All'); setSearch(''); }}>
              ✕ Clear
            </button>}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>
        ) : claims.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No claims found</h3>
            <p style={{ marginBottom: 16 }}>Try adjusting your filters or submit a new claim</p>
            <Link to="/submit" className="btn btn-primary">Submit a claim</Link>
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
                    <td style={{ maxWidth: 220, color: 'var(--text2)' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.description}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.amount)}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text2)', whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                    <td><Link to={`/claims/${c.id}`} className="btn btn-secondary btn-sm">View →</Link></td>
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
