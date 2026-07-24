import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchPendingInvitations, fetchWorkspaces, acceptInvite, declineInvite } from '../store/slices/workspaceSlice';
import '../styles/Invitations.css';

export const PendingInvitations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingInvitations, isLoading, error } = useSelector((state: RootState) => state.workspace);

  useEffect(() => {
    dispatch(fetchPendingInvitations());
  }, [dispatch]);

  const handleAccept = (inviteId: string) => {
    dispatch(acceptInvite(inviteId)).then((res: any) => {
      if (!res.error) {
        dispatch(fetchWorkspaces());
      }
    });
  };

  const handleDecline = (inviteId: string) => {
    dispatch(declineInvite(inviteId));
  };

  if (isLoading && pendingInvitations.length === 0) {
    return <div className="invitations-loading">Loading invitations...</div>;
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="invitations-container">
      <div className="invitations-header">
        <h2>Pending Workspace Invitations</h2>
        <p className="invitations-count">
          {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="invitations-list">
        {pendingInvitations.map((invite) => (
          <div key={invite.id} className="invitation-card">
            <div className="invitation-content">
              <h3 className="invitation-workspace">{invite.workspace_name}</h3>
              {invite.workspace_description && (
                <p className="invitation-description">{invite.workspace_description}</p>
              )}
              <div className="invitation-details">
                <span className="invitation-role">
                  Role: <strong>{invite.role}</strong>
                </span>
                <span className="invitation-expires">
                  Expires: {new Date(invite.expires_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="invitation-actions">
              <button className="btn-accept" onClick={() => handleAccept(invite.id)}>
                Accept
              </button>
              <button className="btn-decline" onClick={() => handleDecline(invite.id)}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};