import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all claims and derive unique users
    api.get('/claims/').then(r => {
      const map = {};
      r.data.forEach(c => {
        if (!map[c.user_id]) map[c.user_id] = { id: c.user_id, name: c.user_name, email: c.user_email, claims: 0, total: 0 };
        map[c.user_id].claims++;
        map[c.user_id].total += c.amount;
      });
      setUsers(Object.values(map));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} claimant{users.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No claimants yet</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Total Claims</th><th>Total Value</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                    <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{u.claims}</span></td>
                    <td style={{ fontWeight: 600 }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(u.total)}
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
