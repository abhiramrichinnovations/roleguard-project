import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { Layout } from '../components/Layout';
import {
  fetchWorkspace,
  fetchMembers,
  fetchInvites,
  inviteMember,
  revokeInvite,
  updateMemberRole,
  removeMember,
  clearWorkspaceError,
  clearWorkspaceSuccess,
} from '../store/slices/workspaceSlice';
import '../styles/profile.css';

export const TeamManagementPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentWorkspace, members, invites, isLoading, isMutating, error, successMessage } = useSelector(
    (state: RootState) => state.workspace
  );

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteError, setInviteError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) return;
    dispatch(fetchWorkspace(workspaceId));
    dispatch(fetchMembers(workspaceId));
    dispatch(fetchInvites(workspaceId));
    return () => {
      dispatch(clearWorkspaceError());
      dispatch(clearWorkspaceSuccess());
    };
  }, [dispatch, workspaceId]);

  // Auto-dismiss the success alert after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearWorkspaceSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Auto-dismiss the error alert after a few seconds too
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearWorkspaceError());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const myRole = currentWorkspace?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    if (!inviteEmail.includes('@')) {
      setInviteError('Enter a valid email address');
      return;
    }
    setInviteError('');
    dispatch(inviteMember({ workspaceId, email: inviteEmail.trim(), role: inviteRole })).then((res: any) => {
      if (!res.error) setInviteEmail('');
    });
  };

  const handleRoleChange = (userId: string, role: 'admin' | 'member') => {
    if (!workspaceId) return;
    dispatch(updateMemberRole({ workspaceId, userId, role }));
  };

  const handleRemove = (userId: string) => {
    if (!workspaceId) return;
    dispatch(removeMember({ workspaceId, userId }));
    setConfirmRemove(null);
  };

  const handleRevokeInvite = (inviteId: string) => {
    if (!workspaceId) return;
    dispatch(revokeInvite({ workspaceId, inviteId }));
  };

  if (!workspaceId) return null;

  return (
    <Layout title={currentWorkspace ? `${currentWorkspace.name} — Team` : 'Team'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Link
          to={`/workspaces/${workspaceId}/settings`}
          style={{
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.5)',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          ⚙️ Workspace Settings
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {canManage && (
        <div className="profile-card narrow" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>Invite a member</h2>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '2 1 220px', margin: 0 }}>
              <input
                type="email"
                className="form-input"
                placeholder="teammate@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              {inviteError && <span className="error-text">{inviteError}</span>}
            </div>
            <select
              className="form-input"
              style={{ flex: '1 1 120px', color: '#fff', background: '#1e1b3a' }}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
            >
              <option value="member" style={{ color: '#fff', background: '#1e1b3a' }}>Member</option>
              <option value="admin" style={{ color: '#fff', background: '#1e1b3a' }}>Admin</option>
            </select>
            <button type="submit" className="btn-save" disabled={isMutating} style={{ flex: '0 0 auto' }}>
              {isMutating ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      {canManage && invites.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.8)' }}>Pending Invites</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {invites.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div>
                  <div style={{ color: '#fff' }}>{inv.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    Invited as {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeInvite(inv.id)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(239,68,68,0.5)',
                    color: '#ef4444',
                    borderRadius: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ color: 'rgba(255,255,255,0.8)' }}>Members</h3>
      {isLoading ? (
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading members...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map((m) => {
            const isMe = m.user_id === user?.id;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ color: '#fff' }}>
                    {m.username} {isMe && <span style={{ color: 'rgba(255,255,255,0.4)' }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{m.email}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {myRole === 'owner' && m.role !== 'owner' ? (
                    <select
                      className="form-input"
                      style={{ padding: '0.35rem 0.5rem', width: 'auto', color: '#fff', background: '#1e1b3a' }}
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.user_id, e.target.value as 'admin' | 'member')}
                    >
                      <option value="member" style={{ color: '#fff', background: '#1e1b3a' }}>Member</option>
                      <option value="admin" style={{ color: '#fff', background: '#1e1b3a' }}>Admin</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                    >
                      {m.role}
                    </span>
                  )}

                  {canManage && m.role !== 'owner' && !isMe && (
                    confirmRemove === m.user_id ? (
                      <>
                        <button
                          onClick={() => handleRemove(m.user_id)}
                          style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.4rem', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmRemove(null)}
                          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '0.4rem', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmRemove(m.user_id)}
                        style={{ background: 'none', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', borderRadius: '0.4rem', padding: '0.35rem 0.6rem', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};