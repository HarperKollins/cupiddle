import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, AlertTriangle, FileText, Activity, CheckCircle, Search, LogOut } from 'lucide-react';

interface Metrics {
  total_users: number;
  active_users: number;
  suspended_users: number;
  active_matches: number;
  sparks_sent: number;
  sparks_accepted: number;
  acceptance_rate: number;
  messages_volume: number;
  pending_reports: number;
  communities_count: number;
}

interface UserRow {
  id: string;
  email: string;
  role: string;
  status: string;
  display_name: string;
  city: string;
  age: number;
  is_verified: boolean;
  verification_badge: string;
  created_at: string;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_id: string;
  reported_name: string;
  reported_city: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

interface AuditLogRow {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cupiddle_admin_token'));
  const [email, setEmail] = useState('admin@cupiddle.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'moderation' | 'audit'>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>([]);

  // Selected report resolution state
  const [selectedReport, setSelectedReport] = useState<ReportRow | null>(null);
  const [actionTaken, setActionTaken] = useState('warning');
  const [modNotes, setModNotes] = useState('');

  useEffect(() => {
    if (token) {
      loadMetrics();
      loadUsers();
      loadReports();
      loadAuditLogs();
    }
  }, [token]);

  const adminFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    };
    const res = await fetch(`/api${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin request failed');
    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'admin' && data.user.role !== 'moderator') {
        throw new Error('Access denied: Staff role required.');
      }
      localStorage.setItem('cupiddle_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cupiddle_admin_token');
    setToken(null);
  };

  const loadMetrics = async () => {
    try {
      const data = await adminFetch('/admin/metrics');
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminFetch(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    try {
      const data = await adminFetch('/admin/reports');
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await adminFetch('/admin/audit-logs');
      setAuditLogs(data.audit_logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await adminFetch(`/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, reason: 'Staff administrative action' }),
      });
      loadUsers();
      loadMetrics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerification = async (userId: string, currentVerified: boolean) => {
    try {
      await adminFetch(`/admin/users/${userId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ is_verified: !currentVerified, badge: !currentVerified ? 'Curious Pioneer' : '' }),
      });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await adminFetch(`/admin/reports/${selectedReport.id}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'resolved',
          action_taken: actionTaken,
          moderator_notes: modNotes,
        }),
      });

      if (actionTaken === 'permanent_ban') {
        await handleUpdateUserStatus(selectedReport.reported_id, 'banned');
      } else if (actionTaken === 'suspend_7_days') {
        await handleUpdateUserStatus(selectedReport.reported_id, 'suspended');
      }

      setSelectedReport(null);
      setModNotes('');
      loadReports();
      loadMetrics();
      loadAuditLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Login Screen (Sunlit Honey Editorial Light Theme)
  if (!token) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f3f3f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#202020',
        }}
      >
        <div
          style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #202020',
            padding: '40px',
            boxShadow: '0 20px 48px rgba(32, 32, 32, 0.14)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '1000px',
                backgroundColor: '#ffdb5b',
                color: '#202020',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.02em',
                marginBottom: '16px',
                border: '1px solid #202020',
              }}
            >
              <ShieldCheck size={14} />
              Cupiddle Staff Portal
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', color: '#202020' }}>
              Administration Console
            </h1>
            <p style={{ fontSize: '14px', color: '#575656', marginTop: '6px' }}>
              Trust, Safety & Moderation Operations
            </p>
          </div>

          {authError && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fff1f2',
                border: '1.5px solid #f43f5e',
                borderRadius: '16px',
                color: '#9f1239',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#202020', marginBottom: '6px', fontWeight: 700 }}>
                Staff Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #202020',
                  color: '#202020',
                  borderRadius: '16px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#202020', marginBottom: '6px', fontWeight: 700 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #202020',
                  color: '#202020',
                  borderRadius: '16px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '10px',
                padding: '14px',
                backgroundColor: '#202020',
                color: '#ffffff',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                transition: 'transform 0.15s ease',
              }}
            >
              Sign In to Staff Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#202020',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Top Navbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 36px',
          backgroundColor: '#ffffff',
          borderBottom: '1.5px solid #202020',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: '#ffdb5b',
              border: '1.5px solid #202020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} color="#202020" />
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#202020' }}>Cupiddle Console</span>
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#fff386',
                border: '1px solid #202020',
                color: '#202020',
                padding: '2px 8px',
                borderRadius: '1000px',
                fontWeight: 800,
                marginLeft: '8px',
              }}
            >
              Staff & Moderation
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 18px',
              borderRadius: '1000px',
              backgroundColor: activeTab === 'overview' ? '#202020' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : '#202020',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Activity size={15} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 18px',
              borderRadius: '1000px',
              backgroundColor: activeTab === 'users' ? '#202020' : 'transparent',
              color: activeTab === 'users' ? '#ffffff' : '#202020',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={15} /> User Directory
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            style={{
              padding: '8px 18px',
              borderRadius: '1000px',
              backgroundColor: activeTab === 'moderation' ? '#202020' : 'transparent',
              color: activeTab === 'moderation' ? '#ffffff' : '#202020',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertTriangle size={15} /> Moderation
            {metrics && metrics.pending_reports > 0 && (
              <span
                style={{
                  marginLeft: '4px',
                  backgroundColor: '#ffdb5b',
                  color: '#202020',
                  border: '1px solid #202020',
                  borderRadius: '1000px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {metrics.pending_reports}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 18px',
              borderRadius: '1000px',
              backgroundColor: activeTab === 'audit' ? '#202020' : 'transparent',
              color: activeTab === 'audit' ? '#ffffff' : '#202020',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={15} /> Audit Trail
          </button>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            borderRadius: '16px',
            backgroundColor: '#f3f3f3',
            border: '1.5px solid #202020',
            color: '#202020',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && metrics && (
          <div>
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '1000px',
                  backgroundColor: '#ffdb5b',
                  border: '1px solid #202020',
                  color: '#202020',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                Operational Health
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: '#202020' }}>
                System Metrics & Operations
              </h2>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#575656', fontWeight: 700 }}>Total Users</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#202020' }}>{metrics.total_users}</p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#575656', fontWeight: 700 }}>Active Matches</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#202020' }}>{metrics.active_matches}</p>
              </div>

              <div style={{ backgroundColor: '#fff386', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#202020', fontWeight: 800 }}>Sparks Sent</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#202020' }}>{metrics.sparks_sent}</p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#575656', fontWeight: 700 }}>Spark Acceptance Rate</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#16a34a' }}>
                  {metrics.acceptance_rate.toFixed(1)}%
                </p>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#575656', fontWeight: 700 }}>Messages Exchanged</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#202020' }}>{metrics.messages_volume}</p>
              </div>

              <div style={{ backgroundColor: metrics.pending_reports > 0 ? '#ffdb5b' : '#f3f3f3', padding: '24px', borderRadius: '24px', border: '1.5px solid #202020', boxShadow: '0 1px 8px rgba(32,32,32,0.1)' }}>
                <span style={{ fontSize: '13px', color: '#202020', fontWeight: 800 }}>Pending Reports</span>
                <p style={{ fontSize: '36px', fontWeight: 800, marginTop: '8px', color: '#202020' }}>
                  {metrics.pending_reports}
                </p>
              </div>
            </div>

            {/* Architecture Banner */}
            <div
              style={{
                padding: '28px 32px',
                backgroundColor: '#fff386',
                borderRadius: '24px',
                border: '1.5px solid #202020',
              }}
            >
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#202020', marginBottom: '8px' }}>
                Operational Architecture: 100% Free Nationwide Platform
              </h3>
              <p style={{ fontSize: '15px', color: '#3b3b3b', lineHeight: 1.6 }}>
                In accordance with the product directive, all paywalls, subscription tiers, and paid locks have been eliminated. The platform delivers full discovery across all 36 Nigerian states and Abuja, unlimited sparks, rabbit holes communities, and real-time messaging to all verified adults without fee.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#202020', letterSpacing: '-0.02em' }}>
                  User Directory & Safety Controls
                </h2>
                <p style={{ fontSize: '14px', color: '#575656', marginTop: '4px' }}>
                  Manage account status, verify authentic members, and inspect profiles across Nigeria.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadUsers();
                  }}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #202020',
                    color: '#202020',
                    borderRadius: '16px',
                    fontSize: '14px',
                    outline: 'none',
                    width: '260px',
                  }}
                />
                <button
                  onClick={loadUsers}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#202020',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Search size={15} /> Search
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #202020',
                overflow: 'hidden',
                boxShadow: '0 1px 8px rgba(32,32,32,0.1)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #202020', backgroundColor: '#f3f3f3', color: '#202020' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>User</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Email</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Location</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Status</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Verified</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#202020' }}>
                        {u.display_name || 'No profile'} {u.age > 0 ? `(${u.age})` : ''}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#575656' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px', color: '#3b3b3b' }}>{u.city || 'Nigeria'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '1000px',
                            backgroundColor: u.role === 'admin' ? '#ffdb5b' : '#f3f3f3',
                            border: '1px solid #202020',
                            color: '#202020',
                            fontWeight: 800,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            color: u.status === 'active' ? '#16a34a' : '#e11d48',
                            fontWeight: 700,
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleToggleVerification(u.id, u.is_verified)}
                          style={{
                            backgroundColor: u.is_verified ? '#fff386' : 'transparent',
                            border: '1px solid #202020',
                            borderRadius: '1000px',
                            padding: '4px 10px',
                            color: '#202020',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {u.is_verified ? '✓ Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {u.status === 'active' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'suspended')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                border: '1px solid #d97706',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '12px',
                              }}
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'banned')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                border: '1px solid #dc2626',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '12px',
                              }}
                            >
                              Ban
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u.id, 'active')}
                            style={{
                              padding: '6px 14px',
                              backgroundColor: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #16a34a',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            Reinstate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#202020', letterSpacing: '-0.02em' }}>
                Pending Moderation Cases ({reports.length})
              </h2>
              <p style={{ fontSize: '14px', color: '#575656', marginTop: '4px' }}>
                Review reports submitted by users and take corrective safety actions.
              </p>
            </div>

            {reports.length === 0 ? (
              <div
                style={{
                  padding: '56px 24px',
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  border: '1.5px solid #202020',
                  textAlign: 'center',
                }}
              >
                <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#202020', marginBottom: '6px' }}>
                  Safety Queue Clear
                </h3>
                <p style={{ fontSize: '14px', color: '#575656' }}>
                  All user reports have been resolved! No pending cases require moderation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '24px',
                      border: '1.5px solid #202020',
                      padding: '28px',
                      boxShadow: '0 1px 8px rgba(32,32,32,0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #dc2626',
                          borderRadius: '1000px',
                          fontWeight: 800,
                          fontSize: '12px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Violation: {rep.reason}
                      </span>
                      <span style={{ fontSize: '13px', color: '#575656' }}>
                        Filed by: <strong>{rep.reporter_name}</strong>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#202020', margin: '8px 0' }}>
                      Reported Account: {rep.reported_name} ({rep.reported_city || 'Nigeria'})
                    </h4>
                    <p style={{ fontSize: '15px', color: '#3b3b3b', marginBottom: '20px', lineHeight: 1.5 }}>
                      Evidence / Incident Details: "{rep.details}"
                    </p>

                    <button
                      onClick={() => setSelectedReport(rep)}
                      style={{
                        padding: '10px 22px',
                        backgroundColor: '#202020',
                        color: '#ffffff',
                        borderRadius: '16px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Resolve Case
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Resolve Case Modal */}
            {selectedReport && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(32, 32, 32, 0.55)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 100,
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '24px',
                    border: '1.5px solid #202020',
                    maxWidth: '520px',
                    width: '100%',
                    padding: '36px',
                    boxShadow: '0 20px 48px rgba(32, 32, 32, 0.18)',
                  }}
                >
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#202020', marginBottom: '16px' }}>
                    Resolve Safety Case: {selectedReport.reported_name}
                  </h3>

                  <form onSubmit={handleResolveReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '6px' }}>
                        Action Decision
                      </label>
                      <select
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #202020',
                          color: '#202020',
                          borderRadius: '16px',
                          fontWeight: 600,
                        }}
                      >
                        <option value="warning">Issue Official Warning</option>
                        <option value="suspend_7_days">Suspend Account for 7 Days</option>
                        <option value="permanent_ban">Permanent Ban (Severe Safety Threat)</option>
                        <option value="no_violation">Dismiss - No Violation Found</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '6px' }}>
                        Moderator Notes (Audit Log)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={modNotes}
                        onChange={(e) => setModNotes(e.target.value)}
                        placeholder="Document findings and action rationale..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #202020',
                          color: '#202020',
                          borderRadius: '16px',
                          fontSize: '14px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(null)}
                        style={{ padding: '10px 18px', color: '#575656', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#202020',
                          color: '#ffffff',
                          borderRadius: '16px',
                          fontWeight: 800,
                          fontSize: '14px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Submit Resolution
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Audit Trail */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#202020', letterSpacing: '-0.02em' }}>
                Immutable Moderation Audit Trail
              </h2>
              <p style={{ fontSize: '14px', color: '#575656', marginTop: '4px' }}>
                Every staff action and moderation decision is timestamped and preserved for accountability.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #202020',
                overflow: 'hidden',
                boxShadow: '0 1px 8px rgba(32,32,32,0.1)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #202020', backgroundColor: '#f3f3f3', color: '#202020' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Timestamp</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Action</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Target</th>
                    <th style={{ padding: '14px 20px', fontWeight: 800 }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '14px 20px', color: '#575656', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#202020' }}>{log.action}</td>
                      <td style={{ padding: '14px 20px', color: '#3b3b3b' }}>
                        {log.target_type} ({log.target_id.slice(0, 10)}...)
                      </td>
                      <td style={{ padding: '14px 20px', color: '#575656' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
