import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store';
import { acceptInvite } from '../store/slices/workspaceSlice';

export const AcceptInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    dispatch(acceptInvite(token)).then((res: any) => {
      if (res.error) {
        setStatus('error');
        setMessage(res.payload || 'This invite link is invalid or has expired.');
      } else {
        const workspaceId = res.payload?.workspaceId;
        navigate(workspaceId ? `/workspaces/${workspaceId}/team` : '/workspaces');
      }
    });
  }, [token, dispatch, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {status === 'loading' ? (
        <p>Joining workspace...</p>
      ) : (
        <>
          <h2 style={{ color: '#ef4444' }}>Couldn't accept invite</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{message}</p>
        </>
      )}
    </div>
  );
};