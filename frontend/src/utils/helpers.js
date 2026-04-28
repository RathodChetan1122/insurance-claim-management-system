export const statusBadge = (status) => {
  const map = {
    'Submitted': 'badge-submitted',
    'Under Review': 'badge-review',
    'Approved': 'badge-approved',
    'Rejected': 'badge-rejected',
    'Additional Info Required': 'badge-info-req',
  };
  return map[status] || 'badge-submitted';
};

export const priorityBadge = (p) => {
  const map = { 'Low': 'badge-low', 'Normal': 'badge-normal', 'High': 'badge-high', 'Urgent': 'badge-urgent' };
  return map[p] || 'badge-normal';
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const claimTypeIcon = (type) => {
  const m = { Auto: '🚗', Home: '🏠', Health: '🏥', Travel: '✈️', Life: '💼', Commercial: '🏢' };
  return m[type] || '📋';
};
