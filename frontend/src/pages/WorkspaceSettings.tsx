import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { Layout } from '../components/Layout';
import { Alert } from '../components/Alert';
import {
  fetchWorkspace,
  fetchMembers,
  updateWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  transferOwnership,
  clearWorkspaceError,
  clearWorkspaceSuccess,
} from '../store/slices/workspaceSlice';
import '../styles/profile.css';

export const WorkspaceSettings: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentWorkspace, members, isMutating, error, successMessage } = useSelector(
    (state: RootState) => state.workspace
  );

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    dispatch(fetchWorkspace(workspaceId));
    dispatch(fetchMembers(workspaceId));
    return () => {
      dispatch(clearWorkspaceError());
      dispatch(clearWorkspaceSuccess());
    };
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (currentWorkspace) {
      setFormData({ name: currentWorkspace.name, description: currentWorkspace.description || '' });
    }
  }, [currentWorkspace]);

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

  if (!workspaceId || !currentWorkspace) {
    return (
      <Layout title="Workspace Settings">
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</p>
      </Layout>
    );
  }

  const myRole = currentWorkspace.role;
  const canEdit = myRole === 'owner' || myRole === 'admin';
  const isOwner = myRole === 'owner';
  const otherMembers = members.filter((m) => m.role !== 'owner');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateWorkspace({ workspaceId, data: formData }));
  };

  const handleDelete = () => {
    if (deleteConfirm !== 'DELETE') return;
    dispatch(deleteWorkspace(workspaceId)).then((res: any) => {
      if (!res.error) navigate('/workspaces');
    });
  };

  const handleLeave = () => {
    dispatch(leaveWorkspace(workspaceId)).then((res: any) => {
      if (!res.error) navigate('/workspaces');
    });
  };

  const handleTransfer = () => {
    if (!transferTargetId) return;
    dispatch(transferOwnership({ workspaceId, newOwnerId: transferTargetId })).then((res: any) => {
      if (!res.error) {
        setShowTransferModal(false);
        dispatch(fetchWorkspace(workspaceId));
      }
    });
  };

  return (
    <Layout title={`${currentWorkspace.name} — Settings`}>
      {error && <Alert type="error">{error}</Alert>}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <div className="profile-card narrow" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>General</h2>
        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              disabled={!canEdit}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={formData.description}
              disabled={!canEdit}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          {canEdit && (
            <button type="submit" className="btn-save full" disabled={isMutating}>
              {isMutating ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </div>

      {isOwner && otherMembers.length > 0 && (
        <div className="profile-card narrow" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0 }}>Transfer Ownership</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Hand off ownership of this workspace to another member. You'll become an admin.
          </p>
          {!showTransferModal ? (
            <button
              onClick={() => setShowTransferModal(true)}
              style={{ background: 'none', border: '1px solid rgba(124,58,237,0.6)', color: '#a78bfa', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Transfer Ownership
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-input"
                style={{ width: 'auto', color: '#fff', background: '#1e1b3a' }}
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
              >
                <option value="" style={{ color: '#fff', background: '#1e1b3a' }}>Select a member...</option>
                {otherMembers.map((m) => (
                  <option key={m.user_id} value={m.user_id} style={{ color: '#fff', background: '#1e1b3a' }}>
                    {m.username} ({m.email})
                  </option>
                ))}
              </select>
              <button className="btn-save" disabled={!transferTargetId || isMutating} onClick={handleTransfer}>
                Confirm Transfer
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className="profile-card narrow"
        style={{ borderColor: 'rgba(239,68,68,0.4)' }}
      >
        <h2 style={{ marginTop: 0, color: '#ef4444' }}>Danger Zone</h2>

        {isOwner ? (
          <>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              Permanently delete this workspace and remove all members. This cannot be undone.
            </p>
            {!showDeleteModal ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
              >
                Delete Workspace
              </button>
            ) : (
              <div>
                <div className="form-group">
                  <label>Type DELETE to confirm</label>
                  <input
                    type="text"
                    className="form-input"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    disabled={deleteConfirm !== 'DELETE' || isMutating}
                    onClick={handleDelete}
                    style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', opacity: deleteConfirm !== 'DELETE' ? 0.5 : 1 }}
                  >
                    Permanently Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              Leaving removes your access to this workspace. You can be invited back later.
            </p>
            <button
              onClick={handleLeave}
              style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Leave Workspace
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};