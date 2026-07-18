import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import '../styles/auth.css';

interface FormErrors {
  email?: string;
  password?: string;
}

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await dispatch(login(formData)).unwrap();
      navigate('/dashboard');
    } catch {
      // Error handled by Redux
    }
  };

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
          RoleGuard © 2026
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-eyebrow">Welcome Back</div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">
    
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
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '*' : '*'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="form-divider">or continue with</div>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </p>

          <a href="#" className="forgot-link">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};