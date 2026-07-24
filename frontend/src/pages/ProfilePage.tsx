import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchProfile, updateProfile, clearSuccessMessage } from '../store/slices/profileSlice';
import { Layout } from '../components/Layout';
import '../styles/profile.css';
import '../styles/profile-dashboard.css';

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <rect x="4" y="5.5" width="16" height="15" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 10h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const IdCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="9" cy="11.2" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.5 15.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2M14 10h4M14 13h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
    <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <path
      d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 11v5.5M12 8v.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
    <path
      d="M12 3.5 19 6v5.5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-2.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const formatLastLogin = (iso?: string) => {
  if (!iso) return '—';
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return isToday ? `Today, ${time}` : `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`;
};

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading, isUpdating, error, successMessage } = useSelector(
    (state: RootState) => state.profile
  );

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    bio: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        fullName: profile.full_name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (successMessage) {
      setIsEditing(false);
      const timer = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  const handleCopyId = () => {
    if (!profile?.username) return;
    navigator.clipboard.writeText(profile.username).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (isLoading && !profile) {
    return (
      <Layout title="Profile">
        <div className="profile-loading">Loading profile...</div>
      </Layout>
    );
  }

  const role = (profile?.role || 'user').toLowerCase();
  const displayName = profile?.full_name || profile?.username || 'Unnamed';
  const initial = (profile?.full_name || profile?.username || 'U').charAt(0).toUpperCase();
  const memberSince = formatDate(profile?.created_at);
  const lastLogin = formatLastLogin(profile?.last_login);
  const isActive = profile?.is_active !== false;

  return (
    <Layout title="Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ID header card */}
        <div className="id-card" data-tier={role}>
          <div className="id-card-stripe" />
          <div className="id-card-texture" />
          <div className="id-card-sheen" />

          <div className="id-card-top">
            <div className="id-card-avatar-wrap">
              <div className="id-card-chip" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="id-card-avatar">{initial}</div>
            </div>

            <div className="id-card-identity">
              <p className="id-card-eyebrow">RoleGuard Access ID</p>
              <div className="id-card-name-row">
                <h1>{displayName}</h1>
                <span className="clearance-tag">
                  <span className="clearance-dot" />
                  {role}
                </span>
              </div>
              <p className="id-card-handle">
                @{profile?.username} <span className="id-card-dot">&middot;</span> {profile?.email}
              </p>
            </div>

            {!isEditing && (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <EditIcon /> Edit Profile
              </button>
            )}
          </div>

          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="id-card-divider" />

          {!isEditing && (
            <div className="id-stat-row">
              <div className="id-stat">
                <span className="id-stat-label">Access ID</span>
                <span className="id-stat-value mono">
                  {profile?.username}
                  <button className="copy-btn" onClick={handleCopyId} aria-label="Copy access ID" type="button">
                    {copied ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </span>
              </div>
              <div className="id-stat">
                <span className="id-stat-label">Account status</span>
                <span className={`id-stat-value ${isActive ? 'good' : 'muted'}`}>
                  <DotIcon /> {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="id-stat">
                <span className="id-stat-label">Member since</span>
                <span className="id-stat-value">
                  <CalendarIcon /> {memberSince}
                </span>
              </div>
              <div className="id-stat">
                <span className="id-stat-label">Last login</span>
                <span className="id-stat-value">
                  <ClockIcon /> {lastLogin}
                </span>
              </div>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input name="username" value={formData.username} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Not set"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Not provided"
                  />
                </div>
                <div className="form-group full">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-input"
                    rows={3}
                    placeholder="Say something about yourself"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {!isEditing && (
          <div className="dash-grid">
            {/* Personal Information */}
            <div className="settings-card dash-card">
              <div className="settings-head-left">
                <div className="settings-icon settings-icon-account" aria-hidden="true">
                  <UserIcon />
                </div>
                <h3>Personal Information</h3>
              </div>

              <div className="dash-rows">
                <div className="dash-row">
                  <span className="dash-row-icon"><UserIcon /></span>
                  <span className="dash-row-label">Username</span>
                  <span className="dash-row-value">{profile?.username}</span>
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon"><IdCardIcon /></span>
                  <span className="dash-row-label">Full Name</span>
                  <span className={`dash-row-value ${!profile?.full_name ? 'empty' : ''}`}>
                    {profile?.full_name || 'Not set'}
                  </span>
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon"><MailIcon /></span>
                  <span className="dash-row-label">Email</span>
                  <span className="dash-row-value">{profile?.email}</span>
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon"><PhoneIcon /></span>
                  <span className="dash-row-label">Phone</span>
                  <span className={`dash-row-value ${!profile?.phone ? 'empty' : ''}`}>
                    {profile?.phone || 'Not provided'}
                  </span>
                </div>
                <div className="dash-row last">
                  <span className="dash-row-icon"><InfoIcon /></span>
                  <span className="dash-row-label">Bio</span>
                  <span className={`dash-row-value ${!profile?.bio ? 'empty' : ''}`}>
                    {profile?.bio || 'No bio added yet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Overview */}
            <div className="settings-card dash-card">
              <div className="settings-head-left">
                <div className="settings-icon settings-icon-account" aria-hidden="true">
                  <ShieldIcon />
                </div>
                <h3>Account Overview</h3>
              </div>

              <div className="dash-rows">
                <div className="dash-row">
                  <span className="dash-row-icon"><UserIcon /></span>
                  <span className="dash-row-label">Role</span>
                  <span className="dash-row-value">
                    <span className="role-chip">{role}</span>
                  </span>
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon"><DotIcon /></span>
                  <span className="dash-row-label">Account Status</span>
                  <span className="dash-row-value">
                    <span className={`role-chip ${isActive ? 'good' : ''}`}>{isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>
                <div className="dash-row">
                  <span className="dash-row-icon"><CalendarIcon /></span>
                  <span className="dash-row-label">Member Since</span>
                  <span className="dash-row-value">{memberSince}</span>
                </div>
                <div className="dash-row last">
                  <span className="dash-row-icon"><ClockIcon /></span>
                  <span className="dash-row-label">Last Login</span>
                  <span className="dash-row-value">{lastLogin}</span>
                </div>
              </div>

              <a href="/settings" className="dash-settings-link">
                Manage security settings <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};