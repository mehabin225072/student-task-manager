import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            {title || 'Delete Task?'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {message || 'Are you sure you want to delete this task? This action cannot be undone.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isDeleting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-danger"
              disabled={isDeleting}
              style={{ flex: 1 }}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
