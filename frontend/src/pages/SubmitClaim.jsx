import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const TYPES = ['Auto', 'Home', 'Health', 'Travel', 'Life', 'Commercial'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];
const ICONS = { Auto: '🚗', Home: '🏠', Health: '🏥', Travel: '✈️', Life: '💼', Commercial: '🏢' };

export default function SubmitClaim() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ claim_type: '', description: '', amount: '', incident_date: '', priority: 'Normal' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await api.post('/claims/', { ...form, amount: parseFloat(form.amount) });
      navigate('/claims/' + data.id, { state: { new: true } });
    } catch (err) { setError(err.response?.data?.error || 'Failed to submit claim.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Submit New Claim</h1><p className="page-subtitle">Fill in all required fields. Our team will review within 2-3 business days.</p></div>
      </div>
      <div style={{ maxWidth: 680 }}>
        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Claim Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {TYPES.map(t => (
                  <button type="button" key={t} onClick={() => setForm(p => ({ ...p, claim_type: t }))}
                    style={{ padding: '14px 10px', borderRadius: 10, border: '2px solid', borderColor: form.claim_type === t ? 'var(--primary)' : 'var(--border)', background: form.claim_type === t ? '#eff6ff' : 'var(--surface)', color: form.claim_type === t ? 'var(--primary)' : 'var(--text)', fontWeight: 500, fontSize: 13, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{ICONS[t]}</div>{t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Claim Amount (₹) *</label>
                <input className="form-input" type="number" min="1" placeholder="e.g. 50000" value={form.amount} onChange={set('amount')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Incident Date *</label>
                <input className="form-input" type="date" value={form.incident_date} onChange={set('incident_date')} max={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {PRIORITIES.map(p => (
                  <button type="button" key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                    style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: '2px solid', borderColor: form.priority === p ? 'var(--primary)' : 'var(--border)', background: form.priority === p ? '#eff6ff' : 'var(--surface)', color: form.priority === p ? 'var(--primary)' : 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>{p}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" rows={4} placeholder="Describe what happened, when it occurred, and the extent of damage or loss. Be as specific as possible." value={form.description} onChange={set('description')} required minLength={20} />
              <span style={{ fontSize: 11, color: form.description.length >= 20 ? 'var(--success)' : 'var(--text3)' }}>{form.description.length} / 20 min characters {form.description.length >= 20 ? '✓' : ''}</span>
            </div>
            {form.claim_type && form.amount && (
              <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase' }}>Claim Summary</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="tag">{ICONS[form.claim_type]} {form.claim_type}</span>
                  <span className="tag">₹{Number(form.amount).toLocaleString('en-IN')}</span>
                  <span className="tag">📌 {form.priority}</span>
                  {form.incident_date && <span className="tag">📅 {form.incident_date}</span>}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || !form.claim_type} style={{ flex: 1 }}>
                {loading ? '⏳ Submitting...' : '✓ Submit Claim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
