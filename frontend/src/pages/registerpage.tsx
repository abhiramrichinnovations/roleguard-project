import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import '../styles/auth.css';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showStrength, setShowStrength] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Minimum 3 characters';
    else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username))
      newErrors.username = 'Only letters, numbers, _ and -';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Need uppercase letter';
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Need lowercase letter';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Need a digit';
    else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = 'Need special character';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPasswordStrength(calculateStrength(value));
      setShowStrength(value.length > 0);
    }
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await dispatch(register(formData)).unwrap();
      navigate('/dashboard');
    } catch {
      // Error handled by Redux
    }
  };

  const requirements = [
    { label: '8+ chars', met: formData.password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
    { label: 'Lowercase', met: /[a-z]/.test(formData.password) },
    { label: 'Number', met: /[0-9]/.test(formData.password) },
    { label: 'Special char', met: /[!@#$%^&*]/.test(formData.password) },
  ];

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'][passwordStrength - 1];

  return (
    <div className="auth-shell">
      {/* LEFT PANEL */}
      <div className="auth-brand-panel">
        <div className="brand-top">
          <div className="brand-logo">
            <div className="brand-logo-icon">R</div>
            <div className="brand-logo-text">RoleGuard</div>
          </div>
        </div>

        <div className="brand-content">
          <div className="brand-chart">
            <div className="chart-bar"></div>
            <div className="chart-bar"></div>
            <div className="chart-bar"></div>
            <div className="chart-bar"></div>
            <div className="chart-bar"></div>
          </div>
        </div>

        <div className="brand-footer">
          Security & Access Control Platform © 2026
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-eyebrow">Get Started</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Set up your account to access RoleGuard 
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}

              {showStrength && formData.password && (
                <div className="strength-meter">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`strength-bar ${i <= passwordStrength ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                  <div className={`strength-text ${strengthLabel?.toLowerCase() || ''}`}>
                    {strengthLabel || 'Very Weak'}
                  </div>

                  <ul className="requirements">
                    {requirements.map((req) => (
                      <li key={req.label} className={`requirement-item ${req.met ? 'met' : ''}`}>
                        <span>{req.met ? '✓' : '○'}</span>
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="form-divider">or</div>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};