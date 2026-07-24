import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { Layout } from '../components/Layout';
import { PendingInvitations } from './PendingInvitations';
import {
  fetchWorkspaces,
  fetchPendingInvitations,
  createWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  setCurrentWorkspace,
  clearWorkspaceError,
  clearWorkspaceSuccess,
  Workspace,
} from '../store/slices/workspaceSlice';
import '../styles/profile.css';
import '../styles/workspace-dashboard.css';

type FilterTab = 'all' | 'owned' | 'shared' | 'invited';

// Deterministic icon + gradient per workspace — auto-assigned for visual
// variety, not a user-chosen setting (no icon field exists in the schema).
const iconSet = [
  { icon: '🚀', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { icon: '⚙️', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { icon: '🎨', gradient: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { icon: '🛡️', gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { icon: '📣', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { icon: '💰', gradient: 'linear-gradient(135deg, #4ade80, #16a34a)' },
  { icon: '👥', gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
];

const iconFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return iconSet[Math.abs(hash) % iconSet.length];
};

const relativeTime = (iso?: string) => {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const roleStyles: Record<string, { color: string; label: string }> = {
  owner: { color: '#f59e0b', label: 'Owner' },
  admin: { color: '#a78bfa', label: 'Admin' },
  member: { color: '#60a5fa', label: 'Member' },
};

const CardMenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <circle cx="12" cy="5.5" r="1.4" fill="currentColor" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1.4" fill="currentColor" />
  </svg>
);

const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
    <path d="M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.7" />
    <path d="M2.5 19c0-2.5 2.4-4.3 5.5-4.3s5.5 1.8 5.5 4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M15 8a2.5 2.5 0 1 0 0-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M17 14.3c2.2.4 3.8 1.8 3.8 3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

interface CardMenuProps {
  workspace: Workspace;
  onOpen: () => void;
  onSettings: () => void;
  onLeaveOrDelete: () => void;
}

const CardMenu: React.FC<CardMenuProps> = ({ workspace, onOpen, onSettings, onLeaveOrDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isOwner = workspace.role === 'owner';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="card-menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button className="card-menu-trigger" onClick={() => setOpen((v) => !v)} aria-label="Workspace options">
        <CardMenuIcon />
      </button>
      {open && (
        <div className="card-menu-dropdown">
          <button
            onClick={() => {
              setOpen(false);
              onOpen();
            }}
          >
            Open workspace
          </button>
          {(workspace.role === 'owner' || workspace.role === 'admin') && (
            <button
              onClick={() => {
                setOpen(false);
                onSettings();
              }}
            >
              Workspace settings
            </button>
          )}
          <button
            className="card-menu-danger"
            onClick={() => {
              setOpen(false);
              onLeaveOrDelete();
            }}
          >
            {isOwner ? 'Delete workspace' : 'Leave workspace'}
          </button>
        </div>
      )}
    </div>
  );
};

export const WorkspaceDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { workspaces, isLoading, isMutating, error, successMessage, pendingInvitations } = useSelector(
    (state: RootState) => state.workspace
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  useEffect(() => {
    dispatch(fetchWorkspaces());
    dispatch(fetchPendingInvitations());
    return () => {
      dispatch(clearWorkspaceError());
      dispatch(clearWorkspaceSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage && showCreateForm) {
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
    }
  }, [successMessage, showCreateForm]);

  const ownedCount = workspaces.filter((w) => w.role === 'owner').length;
  const sharedCount = workspaces.filter((w) => w.role !== 'owner').length;
  const invitedCount = pendingInvitations.length;

  const visibleWorkspaces = useMemo(() => {
    if (activeTab === 'owned') return workspaces.filter((w) => w.role === 'owner');
    if (activeTab === 'shared') return workspaces.filter((w) => w.role !== 'owner');
    return workspaces;
  }, [workspaces, activeTab]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim().length < 3) {
      setFormError('Name must be at least 3 characters');
      return;
    }
    setFormError('');
    dispatch(createWorkspace({ name: formData.name.trim(), description: formData.description.trim() || undefined }));
  };

  const openWorkspace = (workspace: Workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    navigate(`/workspaces/${workspace.id}/team`);
  };

  const openSettings = (workspace: Workspace) => {
    dispatch(setCurrentWorkspace(workspace));
    navigate(`/workspaces/${workspace.id}/settings`);
  };

  const handleLeaveOrDelete = (workspace: Workspace) => {
    if (workspace.role === 'owner') {
      if (window.confirm(`Permanently delete "${workspace.name}"? This cannot be undone.`)) {
        dispatch(deleteWorkspace(workspace.id));
      }
    } else {
      if (window.confirm(`Leave "${workspace.name}"?`)) {
        dispatch(leaveWorkspace(workspace.id));
      }
    }
  };

  return (
    <Layout title="Workspaces">
      <div className="ws-page-head">
        <div className="ws-page-icon" aria-hidden="true">
          <PeopleIcon />
        </div>
        <p className="ws-page-subtitle">Manage and collaborate in your workspaces.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && !showCreateForm && <div className="alert alert-success">{successMessage}</div>}

      <div className="ws-header-row">
        <div />
        <div className="ws-header-actions">
          <div className="ws-total-chip">
            <span>Total Workspaces</span>
            <strong>{workspaces.length}</strong>
          </div>
          <button className="btn-save" onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? 'Cancel' : '+ New Workspace'}
          </button>
        </div>
      </div>

      <div className="ws-tabs">
        {(
          [
            ['all', 'All', workspaces.length],
            ['owned', 'Owned', ownedCount],
            ['shared', 'Shared', sharedCount],
            ['invited', 'Invited', invitedCount],
          ] as [FilterTab, string, number][]
        ).map(([key, label, count]) => (
          <button
            key={key}
            className={`ws-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label} <span className="ws-tab-count">{count}</span>
          </button>
        ))}
      </div>

      {showCreateForm && (
        <div className="profile-card narrow" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>Create Workspace</h2>
          <form onSubmit={handleCreate} className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Product Team"
              />
              {formError && <span className="error-text">{formError}</span>}
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What is this workspace for?"
                rows={3}
              />
            </div>
            <button type="submit" className="btn-save full" disabled={isMutating}>
              {isMutating ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        </div>
      )}

      <div className="ws-layout">
        <div>
          {activeTab === 'invited' ? (
            <PendingInvitations />
          ) : isLoading ? (
                <div className="ws-grid">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="ws-card ws-card-skeleton" />
                  ))}
                </div>
              ) : visibleWorkspaces.length === 0 ? (
                <div className="ws-empty">
                  <div className="ws-empty-icon">＋</div>
                  <h3>No workspaces here</h3>
                  <p>
                    {activeTab === 'all'
                      ? 'Create your first workspace to start collaborating with your team.'
                      : `You don't have any ${activeTab} workspaces yet.`}
                  </p>
                </div>
              ) : (
                <div className="ws-grid">
                  {visibleWorkspaces.map((ws) => {
                    const role = roleStyles[ws.role] || roleStyles.member;
                    const { icon, gradient } = iconFor(ws.name);
                    const updated = relativeTime(ws.updated_at);
                    return (
                      <div
                        key={ws.id}
                        className="ws-card"
                        style={{ '--accent': role.color } as React.CSSProperties}
                        onClick={() => openWorkspace(ws)}
                      >
                        <div className="ws-card-top">
                          <div className="ws-avatar" style={{ background: gradient }}>
                            {icon}
                          </div>
                          <CardMenu
                            workspace={ws}
                            onOpen={() => openWorkspace(ws)}
                            onSettings={() => openSettings(ws)}
                            onLeaveOrDelete={() => handleLeaveOrDelete(ws)}
                          />
                        </div>

                        <div className="ws-name-row">
                          <h3 className="ws-name">{ws.name}</h3>
                          <span className="ws-role-badge" style={{ '--role-color': role.color } as React.CSSProperties}>
                            {role.label}
                          </span>
                        </div>

                        <p className={`ws-description ${!ws.description ? 'ws-description-empty' : ''}`}>
                          {ws.description || 'No description added'}
                        </p>

                        <div className="ws-card-footer">
                          <span className="ws-member-count">
                            <PeopleIcon /> {ws.member_count} member{ws.member_count === 1 ? '' : 's'}
                          </span>
                          {updated && <span className="ws-updated">Updated {updated}</span>}
                        </div>
                      </div>
                    );
                  })}

                  <button className="ws-card ws-create-tile" onClick={() => setShowCreateForm(true)}>
                    <span className="ws-create-icon">+</span>
                    <strong>Create New Workspace</strong>
                    <span>Start collaborating with your team.</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="ws-sidebar">
              <div className="settings-card ws-side-card">
                <p className="settings-eyebrow">Quick stats</p>
                <div className="ws-stat-row">
                  <span>Total Workspaces</span>
                  <strong>{workspaces.length}</strong>
                </div>
                <div className="ws-stat-row">
                  <span>Owned</span>
                  <strong className="accent-owner">{ownedCount}</strong>
                </div>
                <div className="ws-stat-row">
                  <span>Shared</span>
                  <strong className="accent-shared">{sharedCount}</strong>
                </div>
                <div className="ws-stat-row">
                  <span>Invited</span>
                  <strong className="accent-invited">{invitedCount}</strong>
                </div>
              </div>

              <div className="settings-card ws-side-card coming-soon-card">
                <p className="settings-eyebrow">
                  Recent activity <span className="coming-soon-tag">Coming soon</span>
                </p>
                <p className="ws-activity-placeholder">
                  A live feed of invites, membership changes, and workspace updates will appear here.
                </p>
              </div>
            </div>
          </div>
    </Layout>
  );
};