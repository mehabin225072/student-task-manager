import React from 'react';

const StatCard = ({ title, count, icon: Icon, color, bg, border, subtitle, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        border: active ? `2px solid ${color}` : '1px solid var(--border-color)',
        boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
          {count ?? 0}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{
        width: '3rem',
        height: '3rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border || 'transparent'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
