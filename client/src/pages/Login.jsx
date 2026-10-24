import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { CheckSquare, LogIn, Lock, Mail, AlertCircle, Zap } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      setFormData({
        email: 'najva225072@gmail.com',
        password: 'password123',
      });
      await login('najva225072@gmail.com', 'password123');
      navigate('/');
    } catch (err) {
      console.error('Demo login error:', err);
      setError(
        err.customMessage ||
          err.response?.data?.message ||
          'Failed to sign in. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      try {
        // Try direct login first
        await login(formData.email.trim(), formData.password);
      } catch (loginErr) {
        // If credentials invalid or user not registered yet, seamlessly auto-register them!
        if (
          loginErr.response?.status === 401 ||
          loginErr.response?.data?.message?.toLowerCase().includes('invalid')
        ) {
          const namePart = formData.email.split('@')[0].replace(/[._-]/g, ' ');
          const formattedName = namePart
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          await register({
            name: formattedName || 'Student',
            email: formData.email.trim(),
            password: formData.password,
            department: 'Computer Science & Engineering',
            semester: 'Semester 3',
          });
        } else {
          throw loginErr;
        }
      }
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.customMessage) {
        setError(err.customMessage);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (!err.response && (err.message?.includes('Network') || err.code === 'ERR_NETWORK')) {
        setError(
          'Cannot connect to backend server. The cloud backend is waking up or not yet deployed on Render. Please verify below.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to sign in. Please verify your credentials or server connection.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-page)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '2.5rem 2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
            }}
          >
            <CheckSquare size={30} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
            }}
          >
            Log in to manage your student tasks & assignments
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2.5rem' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* One-Click Instant Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Zap size={19} />
            <span>⚡ One-Click Demo Student Login</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 0 1.25rem',
              color: 'var(--text-subtle)',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              or sign in with any email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                }}
              />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                }}
              />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#ffffff' }}></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Switch to Register */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account yet?{' '}
            <Link
              to="/register"
              style={{ fontWeight: 600, color: 'var(--primary)' }}
            >
              Register here
            </Link>
          </div>

          {/* Server Connection Info */}
          <div
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '1rem',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>
              Connected Backend API:
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f8fafc',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  flexShrink: 0,
                }}
              ></span>
              <code
                style={{
                  fontSize: '0.72rem',
                  color: '#4f46e5',
                  wordBreak: 'break-all',
                }}
              >
                {getApiBaseUrl()}
              </code>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = getApiBaseUrl();
                const newUrl = window.prompt(
                  'Configure Backend API URL (e.g. from Render):\nLeave empty to reset to default.',
                  current
                );
                if (newUrl !== null) {
                  setApiBaseUrl(newUrl);
                }
              }}
              style={{
                display: 'block',
                margin: '0.4rem auto 0',
                fontSize: '0.7rem',
                color: '#6366f1',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Change API URL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
