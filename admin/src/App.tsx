import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

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
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      if (data.user.role !== 'admin' && data.user.role !== 'moderator') {
        throw new Error('Access denied: User is not authorized as staff/admin');
      }
      setToken(data.token);
      localStorage.setItem('cupiddle_admin_token', data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('cupiddle_admin_token');
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

      // If banned or suspended, update user status as well
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

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0512',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: '#160c24',
          borderRadius: '16px',
          border: '1px solid #2d1f45',
          padding: '36px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #f43f5e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Cupiddle Staff Portal</h2>
            <p style={{ fontSize: '13px', color: '#a78bfa', marginTop: '4px' }}>
              Administration, Trust & Safety Console
            </p>
          </div>

          {authError && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(244,63,94,0.15)',
              border: '1px solid #f43f5e',
              borderRadius: '8px',
              color: '#fda4af',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c4b5fd', marginBottom: '4px', fontWeight: 600 }}>
                Staff Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#201236',
                  border: '1px solid #2d1f45',
                  color: '#ffffff',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c4b5fd', marginBottom: '4px', fontWeight: 600 }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#201236',
                  border: '1px solid #2d1f45',
                  color: '#ffffff',
                  borderRadius: '8px',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '10px',
                padding: '12px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                borderRadius: '9999px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0512',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        backgroundColor: '#160c24',
        borderBottom: '1px solid #2d1f45',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} color="#7c3aed" />
          <span style={{ fontSize: '18px', fontWeight: 800 }}>Cupiddle Console</span>
          <span style={{
            fontSize: '11px',
            backgroundColor: 'rgba(124,58,237,0.2)',
            color: '#a78bfa',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: 700,
          }}>
            Staff / Moderation
          </span>
        </div>

        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: activeTab === 'overview' ? '#4c1d95' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: activeTab === 'users' ? '#4c1d95' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            User Directory
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: activeTab === 'moderation' ? '#4c1d95' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            Moderation Queue
            {metrics && metrics.pending_reports > 0 && (
              <span style={{
                marginLeft: '6px',
                backgroundColor: '#f43f5e',
                color: '#ffffff',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '11px',
              }}>
                {metrics.pending_reports}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: activeTab === 'audit' ? '#4c1d95' : 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Audit Trail
          </button>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            border: '1px solid #2d1f45',
            color: '#c4b5fd',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px' }}>
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && metrics && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
              System Health & Operational Metrics
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>Total Users</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{metrics.total_users}</p>
              </div>

              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>Active Matches</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{metrics.active_matches}</p>
              </div>

              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>Sparks Sent</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{metrics.sparks_sent}</p>
              </div>

              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>Spark Acceptance Rate</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: '#34d399' }}>
                  {metrics.acceptance_rate.toFixed(1)}%
                </p>
              </div>

              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#a78bfa', fontWeight: 600 }}>Messages Exchanged</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{metrics.messages_volume}</p>
              </div>

              <div style={{ backgroundColor: '#160c24', padding: '20px', borderRadius: '12px', border: '1px solid #2d1f45' }}>
                <span style={{ fontSize: '13px', color: '#f43f5e', fontWeight: 600 }}>Pending Reports</span>
                <p style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: '#fb7185' }}>
                  {metrics.pending_reports}
                </p>
              </div>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: '#160c24',
              borderRadius: '16px',
              border: '1px solid #2d1f45',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '10px' }}>
                Operational Status: 100% Free Architecture
              </h3>
              <p style={{ fontSize: '14px', color: '#c4b5fd', lineHeight: 1.6 }}>
                In accordance with the directive, all commercial paywalls, subscription requirements, and paid gatekeeper locks have been removed. The platform delivers full discovery, unlimited sparks, and real-time messaging to all verified adults without fee.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>User Directory & Safety Controls</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') loadUsers(); }}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#160c24',
                    border: '1px solid #2d1f45',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
                <button
                  onClick={loadUsers}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Search
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: '#160c24',
              borderRadius: '12px',
              border: '1px solid #2d1f45',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d1f45', backgroundColor: '#1c1030', color: '#a78bfa' }}>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Location</th>
                    <th style={{ padding: '12px 16px' }}>Role</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Verified</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #2d1f45' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                        {u.display_name || 'No profile'} {u.age > 0 ? `(${u.age})` : ''}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#c4b5fd' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>{u.city || 'Nigeria'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: u.role === 'admin' ? 'rgba(244,63,94,0.2)' : 'rgba(124,58,237,0.2)',
                          color: u.role === 'admin' ? '#fb7185' : '#a78bfa',
                          fontWeight: 700,
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          color: u.status === 'active' ? '#4ade80' : '#f43f5e',
                          fontWeight: 600,
                        }}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleVerification(u.id, u.is_verified)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: u.is_verified ? '#34d399' : '#6b7280',
                            cursor: 'pointer',
                          }}
                        >
                          {u.is_verified ? '✓ Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {u.status === 'active' ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'suspended')}
                              style={{ padding: '4px 8px', backgroundColor: '#d97706', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, 'banned')}
                              style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Ban
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u.id, 'active')}
                            style={{ padding: '4px 10px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
              Pending Moderation Cases ({reports.length})
            </h2>

            {reports.length === 0 ? (
              <div style={{ padding: '40px', backgroundColor: '#160c24', borderRadius: '12px', textAlign: 'center', color: '#a78bfa' }}>
                All safety reports resolved! No pending cases in queue.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    style={{
                      backgroundColor: '#160c24',
                      borderRadius: '12px',
                      border: '1px solid #2d1f45',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: 'rgba(244,63,94,0.2)',
                        color: '#fb7185',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                      }}>
                        Violation: {rep.reason}
                      </span>
                      <span style={{ fontSize: '12px', color: '#a78bfa' }}>
                        Filed by: {rep.reporter_name}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0' }}>
                      Reported Account: {rep.reported_name} ({rep.reported_city})
                    </h4>
                    <p style={{ fontSize: '14px', color: '#c4b5fd', marginBottom: '16px', lineHeight: 1.5 }}>
                      Evidence / Details: "{rep.details}"
                    </p>

                    <button
                      onClick={() => setSelectedReport(rep)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#7c3aed',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
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
              <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '20px',
              }}>
                <div style={{
                  backgroundColor: '#160c24',
                  borderRadius: '16px',
                  border: '1px solid #2d1f45',
                  maxWidth: '480px',
                  width: '100%',
                  padding: '28px',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '14px' }}>
                    Resolve Safety Case: {selectedReport.reported_name}
                  </h3>

                  <form onSubmit={handleResolveReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#c4b5fd', marginBottom: '4px' }}>
                        Action Decision
                      </label>
                      <select
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#201236',
                          border: '1px solid #2d1f45',
                          color: '#ffffff',
                          borderRadius: '8px',
                        }}
                      >
                        <option value="warning">Issue Official Warning</option>
                        <option value="suspend_7_days">Suspend Account for 7 Days</option>
                        <option value="permanent_ban">Permanent Ban (Severe Safety Threat)</option>
                        <option value="no_violation">Dismiss - No Violation Found</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#c4b5fd', marginBottom: '4px' }}>
                        Moderator Notes (Audit Trail)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={modNotes}
                        onChange={(e) => setModNotes(e.target.value)}
                        placeholder="Document your findings and rationale..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#201236',
                          border: '1px solid #2d1f45',
                          color: '#ffffff',
                          borderRadius: '8px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(null)}
                        style={{ padding: '8px 16px', color: '#c4b5fd', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 20px',
                          backgroundColor: '#7c3aed',
                          color: '#ffffff',
                          borderRadius: '6px',
                          fontWeight: 700,
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
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px' }}>
              Immutable System & Moderation Audit Trail
            </h2>

            <div style={{ backgroundColor: '#160c24', borderRadius: '12px', border: '1px solid #2d1f45', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2d1f45', backgroundColor: '#1c1030', color: '#a78bfa' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>Target</th>
                    <th style={{ padding: '12px 16px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #2d1f45' }}>
                      <td style={{ padding: '12px 16px', color: '#a78bfa' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{log.action}</td>
                      <td style={{ padding: '12px 16px' }}>{log.target_type} ({log.target_id.slice(0, 10)}...)</td>
                      <td style={{ padding: '12px 16px', color: '#c4b5fd' }}>{log.details}</td>
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
