import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480 }}>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{user?.email}</div>
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: user?.role === 'admin' ? '#fef3c7' : '#dbeafe', color: user?.role === 'admin' ? '#92400e' : '#1e40af' }}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Claimant'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['Full Name', user?.name],
            ['Email Address', user?.email],
            ['Phone', user?.phone || 'Not provided'],
            ['Account Role', user?.role],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        <button onClick={() => { logout(); navigate('/login'); }} className="btn btn-danger" style={{ marginTop: 24, width: '100%' }}>
          ⎋ Sign out
        </button>
      </div>
    </div>
  );
}
