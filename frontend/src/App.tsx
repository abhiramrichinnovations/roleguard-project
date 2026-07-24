import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { WorkspaceDashboard } from './pages/WorkspaceDashboard';
import { WorkspaceSettings } from './pages/WorkspaceSettings';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { fetchCurrentUser } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store';

const Unauthorized = () => (
  <div
    style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <h1>403 - Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
  </div>
);

const NotFound = () => (
  <div
    style={{
      padding: '2rem',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

const FullScreenLoader = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.6)',
    }}
  >
    Loading...
  </div>
);

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Reads the session from the httpOnly cookie automatically —
    // no token needs to be manually restored on the client.
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // On first load we haven't checked the cookie-based session yet.
  // Wait for that check before deciding to show login vs. protected content,
  // otherwise a logged-in user briefly flashes the login page on refresh.
  if (!isInitialized) {
    return <FullScreenLoader />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <WorkspaceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces/:workspaceId/team"
          element={
            <ProtectedRoute>
              <TeamManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces/:workspaceId/settings"
          element={
            <ProtectedRoute>
              <WorkspaceSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invites/:token/accept"
          element={
            <ProtectedRoute>
              <AcceptInvitePage />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;