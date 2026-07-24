import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { changePassword, clearSuccessMessage, clearProfileError } from '../store/slices/profileSlice';
import { Layout } from '../components/Layout';
import '../styles/profile.css';
import '../styles/ChangePasswordPage.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
    <rect x="5" y="10.5" width="14" height="9" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({ label, name, value, onChange, error, placeholder }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="pw-input-wrap">
        <span className="pw-input-icon" aria-hidden="true">
          <LockIcon />
        </span>
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="form-input pw-input"
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          className="pw-toggle-btn"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

// Mirrors the backend's changePasswordSchema (Zod) rules exactly.
const requirementChecks = (pw: string) => [
  { label: 'At least 8 characters', met: pw.length >= 8 },
  { label: 'One uppercase letter', met: /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', met: /[a-z]/.test(pw) },
  { label: 'One digit', met: /[0-9]/.test(pw) },
  { label: 'One special character', met: /[!@#$%^&*]/.test(pw) },
];

const strengthLabel = (metCount: number, total: number) => {
  if (metCount === 0) return { label: '', className: '' };
  const ratio = metCount / total;
  if (ratio < 0.5) return { label: 'Weak', className: 'weak' };
  if (ratio < 1) return { label: 'Good', className: 'good' };
  return { label: 'Strong', className: 'strong' };
};

const strengthColor = (metCount: number, total: number) => {
  const ratio = metCount / total;
  if (metCount === 0) return '#3a3d4d';
  if (ratio < 0.5) return '#f87171';
  if (ratio < 1) return '#fbbf24';
  return '#4ade80';
};

interface ScoreRingProps {
  metCount: number;
  total: number;
}

const SecurityScoreRing: React.FC<ScoreRingProps> = ({ metCount, total }) => {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const progress = metCount / total;
  const color = strengthColor(metCount, total);

  return (
    <div className="score-ring" aria-label={`${metCount} of ${total} requirements met`}>
      <svg viewBox="0 0 40 40" width="40" height="40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
        />
      </svg>
      <span className="score-ring-count" style={{ color }}>
        {metCount}/{total}
      </span>
    </div>
  );
};

export const ChangePasswordPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isUpdating, error, successMessage } = useSelector((state: RootState) => state.profile);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const requirements = useMemo(() => requirementChecks(formData.newPassword), [formData.newPassword]);
  const metCount = requirements.filter((r) => r.met).length;
  const allMet = metCount === requirements.length;
  const strength = strengthLabel(metCount, requirements.length);
  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.newPassword === formData.confirmPassword;

  useEffect(() => {
    return () => {
      dispatch(clearProfileError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [successMessage]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.currentPassword) errors.currentPassword = 'Required';
    if (!allMet) errors.newPassword = 'Password does not meet all requirements';
    if (formData.newPassword !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(changePassword(formData));
  };

  return (
    <Layout title="Change Password">
      <div className="pw-page-head">
        <div className="pw-page-icon" aria-hidden="true">
          <LockIcon />
        </div>
        <p className="pw-page-subtitle">Keep your account secure by using a strong password.</p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="pw-layout">
        {/* Form */}
        <div className="settings-card pw-form-card">
          <form onSubmit={handleSubmit} className="profile-form">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={formErrors.currentPassword}
              placeholder="Enter your current password"
            />

            <div>
              <PasswordField
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                error={formErrors.newPassword}
                placeholder="Enter your new password"
              />

              {/* Strength is now shown live via the score ring in the sidebar */}
            </div>

            <div>
              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                placeholder="Confirm your new password"
              />
              {formData.confirmPassword.length > 0 && (
                <p className={`pw-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                  {passwordsMatch ? (
                    <>
                      <CheckIcon /> Passwords match
                    </>
                  ) : (
                    'Passwords do not match yet'
                  )}
                </p>
              )}
            </div>

            <button type="submit" className="btn-save full pw-submit" disabled={isUpdating}>
              <LockIcon /> {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="pw-sidebar">
          <div className="settings-card pw-side-card">
            <div className="pw-side-head pw-side-head-score">
              <p className="settings-eyebrow" style={{ margin: 0 }}>
                Password requirements
              </p>
              <SecurityScoreRing metCount={metCount} total={requirements.length} />
            </div>
            <ul className="pw-requirements">
              {requirements.map((req) => (
                <li key={req.label} className={req.met ? 'met' : ''}>
                  <span className="pw-req-check" aria-hidden="true">
                    {req.met ? <CheckIcon /> : <span className="pw-req-dot" />}
                  </span>
                  <span className="pw-req-label">{req.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="settings-card pw-side-card">
            <div className="pw-side-head">
              <span className="pw-side-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <p className="settings-eyebrow" style={{ margin: 0 }}>
                Security tip
              </p>
            </div>
            <p className="pw-tip-text">
              Avoid using personal information or common words in your password.
            </p>
          </div>

          <div className="settings-card pw-side-card">
            <div className="pw-side-head">
              <span className="pw-side-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <p className="settings-eyebrow" style={{ margin: 0 }}>
                Examples of a strong password
              </p>
            </div>
            <ul className="pw-examples">
              <li>
                <CheckIcon /> Tr@vel2025!Plan
              </li>
              <li>
                <CheckIcon /> Str0ng#Passw0rd9
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pw-footnote">
        <span className="pw-side-icon" aria-hidden="true">
          <LockIcon />
        </span>
        <p>
          We use industry-standard encryption to keep your data safe and secure. Your password is
          never stored in plain text.
        </p>
      </div>
    </Layout>
  );
};