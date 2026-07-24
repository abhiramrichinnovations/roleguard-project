import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { Layout } from '../components/Layout';
import { fetchWorkspaces } from '../store/slices/workspaceSlice';
import '../styles/dashboard.css';

const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

const WorkspaceIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 4v16" />
  </svg>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
  </svg>
);

const StackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const PulseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const quickActions = [
  {
    to: '/profile',
    title: 'Manage Profile',
    description: 'Update your name, bio, and contact details',
    Icon: ProfileIcon,
    accent: '#3b82f6',
  },
  {
    to: '/workspaces',
    title: 'Workspaces',
    description: 'Create teams and manage collaborators',
    Icon: WorkspaceIcon,
    accent: '#7c3aed',
  },
  {
    to: '/change-password',
    title: 'Security',
    description: 'Change your password to stay protected',
    Icon: LockIcon,
    accent: '#06b6d4',
  },
];

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { workspaces } = useSelector((state: RootState) => state.workspace);

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const ownedCount = workspaces.filter((w) => w.role === 'owner').length;

  const stats = [
    { label: 'Workspaces', value: workspaces.length, Icon: StackIcon, accent: '#7c3aed' },
    { label: 'You Own', value: ownedCount, Icon: ShieldIcon, accent: '#3b82f6' },
    { label: 'Account Status', value: 'Active', Icon: PulseIcon, accent: '#22c55e' },
  ];

  return (
    <Layout title="Dashboard">
      <div className="welcome-card fade-in">
        <div className="welcome-content">
          <h2 className="welcome-title">
            Welcome back, <span style={{ color: '#93c5fd' }}>{user?.username}</span>
          </h2>
          <p className="welcome-subtitle">
            You're logged in and have full access to the RoleGuard management console.
          </p>

          <div className="user-info">
            <div className="user-avatar">{getInitials(user?.username)}</div>
            <div className="user-details">
              <h3>{user?.username}</h3>
              <p>{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, Icon, accent }, i) => (
          <div
            key={label}
            className="stat-card fade-in"
            style={{ animationDelay: `${0.05 + i * 0.05}s`, ['--accent' as any]: accent }}
          >
            <div className="stat-icon">
              <Icon />
            </div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-label fade-in" style={{ animationDelay: '0.2s' }}>
        Quick Actions
      </div>

      <div className="quick-actions-grid">
        {quickActions.map(({ to, title, description, Icon, accent }, i) => (
          <Link
            key={to}
            to={to}
            className="quick-action-card fade-in"
            style={{ animationDelay: `${0.25 + i * 0.05}s`, ['--accent' as any]: accent }}
          >
            <div className="quick-action-icon">
              <Icon />
            </div>
            <div>
              <h4>{title}</h4>
              <p>{description}</p>
            </div>
            <span className="quick-action-arrow">→</span>
          </Link>
        ))}
      </div>
    </Layout>
  );
};