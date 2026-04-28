import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { statusBadge, priorityBadge, formatCurrency, formatDate, formatDateTime, claimTypeIcon } from '../utils/helpers';

const STATUSES = ['Submitted', 'Under Review', 'Additional Info Required', 'Approved', 'Rejected'];

export default function ClaimDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', admin_notes: '' });
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(location.state?.new ? '🎉 Claim submitted successfully!' : '');

  useEffect(() => {
    api.get(`/claims/${id}`).then(r => { setClaim(r.data); setStatusForm(p => ({ ...p, status: r.data.status, admin_notes: r.data.admin_notes || '' })); })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/claims/${id}/status`, statusForm);
      setClaim(data); setShowModal(false);
      setSuccess('Status updated successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    } finally { setUpdating(false); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><span className="spinner" /></div>;
  if (!claim) return <div className="empty-state"><h3>Claim not found</h3></div>;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{claimTypeIcon(claim.claim_type)} {claim.claim_type} Insurance Claim</h1>
            <span className={`badge ${statusBadge(claim.status)}`}>{claim.status}</span>
            <span className={`badge ${priorityBadge(claim.priority)}`}>{claim.priority}</span>
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4, fontFamily: 'monospace' }}>{claim.claim_number}</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>✏️ Update Status</button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Main info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Claim Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['Claim Number', <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{claim.claim_number}</span>],
                ['Claim Type', `${claimTypeIcon(claim.claim_type)} ${claim.claim_type}`],
                ['Claimed Amount', <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 16 }}>{formatCurrency(claim.amount)}</span>],
                ['Incident Date', formatDate(claim.incident_date)],
                ['Submitted On', formatDate(claim.created_at)],
                ['Last Updated', formatDate(claim.updated_at)],
                ['Submitted By', claim.user_name],
                ['Email', claim.user_email],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, background: 'var(--bg)', padding: 14, borderRadius: 8 }}>{claim.description}</p>
            </div>
            {claim.admin_notes && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Admin Notes</div>
                <p style={{ fontSize: 14, color: 'var(--text)', background: '#fffbeb', padding: 14, borderRadius: 8, border: '1px solid #fde68a' }}>{claim.admin_notes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Claim History</h3>
            <div className="timeline">
              {[...claim.history].reverse().map((h, i) => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: h.new_status === 'Approved' ? 'var(--success)' : h.new_status === 'Rejected' ? 'var(--danger)' : 'var(--primary)' }} />
                  <div className="timeline-content">
                    <div className="timeline-title">
                      {h.old_status ? `${h.old_status} → ${h.new_status}` : `Claim ${h.new_status}`}
                    </div>
                    <div className="timeline-meta">By {h.changed_by} · {formatDateTime(h.timestamp)}</div>
                    {h.note && <div className="timeline-note">{h.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar status card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>
              {claim.status === 'Approved' ? '✅' : claim.status === 'Rejected' ? '❌' : claim.status === 'Under Review' ? '🔍' : '📤'}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{claim.status}</div>
            <span className={`badge ${statusBadge(claim.status)}`} style={{ fontSize: 13 }}>{claim.status}</span>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              {claim.status === 'Submitted' && 'Your claim has been received and is waiting for an admin to begin review.'}
              {claim.status === 'Under Review' && 'Our team is actively reviewing your claim. You will be notified of any updates.'}
              {claim.status === 'Approved' && '🎉 Congratulations! Your claim has been approved. Settlement will be processed shortly.'}
              {claim.status === 'Rejected' && 'Your claim has been reviewed and unfortunately could not be approved. See admin notes for details.'}
              {claim.status === 'Additional Info Required' && 'Please contact support with additional documentation to proceed with your claim.'}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Claim Summary</div>
            {[
              ['Type', claim.claim_type],
              ['Amount', formatCurrency(claim.amount)],
              ['Priority', claim.priority],
              ['Incident', formatDate(claim.incident_date)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status update modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontWeight: 600, fontSize: 16 }}>Update Claim Status</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Status *</label>
                <select className="form-input" value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Notes (visible to claimant)</label>
                <textarea className="form-input" rows={3} placeholder="Reason for decision, instructions, or additional info needed…"
                  value={statusForm.admin_notes} onChange={e => setStatusForm(p => ({ ...p, admin_notes: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Internal Note (audit log)</label>
                <input className="form-input" placeholder="Brief internal note for audit trail…"
                  value={statusForm.note} onChange={e => setStatusForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateStatus} disabled={updating}>
                {updating ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Updating…</> : '✓ Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
