import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { CheckSquare, UserPlus, Lock, Mail, User, GraduationCap, AlertCircle, Server } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    semester: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: formData.department.trim(),
        semester: formData.semester.trim(),
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
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
            'Failed to create account. Please check your details and try again.'
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
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '2rem 2rem 1.25rem',
            textAlign: 'center',
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
            Create Student Account
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginTop: '0.25rem',
            }}
          >
            Get started tracking your academic goals & assignments
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2.25rem' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
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
                id="name"
                name="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span style={{ color: '#ef4444' }}>*</span>
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
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Department & Semester in 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. CSE / IT"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="semester">
                Semester / Year
              </label>
              <input
                id="semester"
                name="semester"
                type="text"
                placeholder="e.g. Semester 6"
                value={formData.semester}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password (min 6 characters) <span style={{ color: '#ef4444' }}>*</span>
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
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password <span style={{ color: '#ef4444' }}>*</span>
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
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#ffffff' }}></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Student Account</span>
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Sign In
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

export default Register;
