import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import '../styles/dashboard.css';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="logo-section">
          <div className="logo-icon">R</div>
          <span className="logo-text">RoleGuard</span>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Main</div>
          <a href="#" className="nav-item active">
            📊 Dashboard
          </a>
          
        
        </nav>


        <div className="user-card">
          <div className="user-name">{user?.username || 'User'}</div>
          <div className="user-email">{user?.email || 'No email'}</div>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Dashboard</h1>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>

        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">
              Welcome back, <span style={{ color: '#7c3aed' }}>{user?.username}</span>
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

      </main>
    </div>
  );
};