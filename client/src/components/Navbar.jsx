import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User, Plus, GraduationCap } from 'lucide-react';

const Navbar = ({ onOpenCreateModal }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.25rem',
      }}>
        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}>
            <CheckSquare size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Student Task Manager
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <GraduationCap size={13} color="var(--primary)" />
              <span>ICTAK MERN Project</span>
            </div>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          )}

          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              paddingLeft: '0.75rem',
              borderLeft: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div style={{ display: 'none', mdDisplay: 'block' }} className="user-info">
                <div style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.2 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user.department ? `${user.department} • ` : ''}
                  {user.semester || 'Student'}
                </div>
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="btn-icon"
                style={{ marginLeft: '0.25rem' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
