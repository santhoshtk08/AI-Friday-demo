import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Forms.css';
import '../styles/Cards.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-icon">💰</div>
          <h1 className="brand-name">FD Manager</h1>
          <p className="brand-tagline">Fixed Deposit Management System</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <div className="demo-credentials">
              <div className="demo-header">
                <span className="demo-icon">🔑</span>
                <span className="demo-title">Demo Credentials</span>
              </div>
              <div className="demo-users">
                <div className="demo-user">
                  <div className="demo-role supervisor">Supervisor</div>
                  <div className="demo-creds">admin / admin123</div>
                </div>
                <div className="demo-user">
                  <div className="demo-role officer">Officer</div>
                  <div className="demo-creds">officer1 / officer123</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-page-footer">
          <p>Secure • Reliable • Professional</p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: var(--space-4);
        }

        .bg-shapes {
          display: none;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
        }

        /* Brand Header */
        .brand-header {
          text-align: center;
          margin-bottom: var(--space-5);
        }

        .brand-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-2);
        }

        .brand-name {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .brand-tagline {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin: 0;
        }

        /* Login Card */
        .login-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-light);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-5);
        }

        .login-title {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .login-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
        }

        /* Form Styling */
        .login-form {
          margin-bottom: var(--space-4);
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .label-icon {
          font-size: var(--text-base);
        }

        .login-input {
          transition: all var(--transition-base);
          border: 2px solid var(--border-medium);
        }

        .login-input:focus {
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Login Button */
        .btn-login {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: white;
          background: var(--primary-600);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
        }

        .btn-login:hover:not(:disabled) {
          background: var(--primary-700);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          font-size: var(--text-lg);
          transition: transform var(--transition-base);
        }

        .btn-login:hover .btn-arrow {
          transform: translateX(4px);
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        /* Alert */
        .alert {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-3);
          font-size: var(--text-sm);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .alert-error {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--error-600);
          border: 1px solid var(--error-500);
        }

        .alert-icon {
          font-size: var(--text-base);
        }

        /* Demo Credentials */
        .login-footer {
          padding-top: var(--space-4);
          border-top: 1px solid var(--border-light);
        }

        .demo-credentials {
          text-align: center;
        }

        .demo-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .demo-icon {
          font-size: var(--text-base);
        }

        .demo-title {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
        }

        .demo-users {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
        }

        .demo-user {
          padding: var(--space-2);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .demo-user:hover {
          background: var(--bg-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .demo-role {
          font-size: 10px;
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-1);
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          display: inline-block;
        }

        .demo-role.supervisor {
          background: var(--info-50);
          color: var(--info-700);
        }

        .demo-role.officer {
          background: var(--secondary-100);
          color: var(--secondary-700);
        }

        .demo-creds {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          font-weight: var(--font-medium);
        }

        /* Page Footer */
        .login-page-footer {
          text-align: center;
          margin-top: var(--space-4);
          color: var(--text-tertiary);
          font-size: 11px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .login-card {
            padding: var(--space-5);
          }

          .brand-icon {
            font-size: 2rem;
          }

          .brand-name {
            font-size: var(--text-xl);
          }

          .demo-users {
            grid-template-columns: 1fr;
          }
        }

        @media (max-height: 700px) {
          .brand-header {
            margin-bottom: var(--space-3);
          }

          .brand-icon {
            font-size: 2rem;
            margin-bottom: var(--space-1);
          }

          .login-card {
            padding: var(--space-4);
          }

          .login-header {
            margin-bottom: var(--space-3);
          }

          .login-footer {
            padding-top: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
