import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

import AdminClaims from './pages/AdminClaims';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import ClaimantDashboard from './pages/ClaimantDashboard';
import ClaimDetail from './pages/ClaimDetail';
import Login from './pages/Login';
import MyClaims from './pages/MyClaims';
import Profile from './pages/Profile';
import Register from './pages/Register';
import SubmitClaim from './pages/SubmitClaim';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Claimant routes */}
          <Route path="/dashboard" element={<PrivateRoute role="claimant"><ClaimantDashboard /></PrivateRoute>} />
          <Route path="/claims" element={<PrivateRoute><MyClaims /></PrivateRoute>} />
          <Route path="/claims/:id" element={<PrivateRoute><ClaimDetail /></PrivateRoute>} />
          <Route path="/submit" element={<PrivateRoute role="claimant"><SubmitClaim /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/claims" element={<PrivateRoute role="admin"><AdminClaims /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
