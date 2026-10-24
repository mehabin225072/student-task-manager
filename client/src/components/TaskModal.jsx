import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSubmit, initialTask = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        subject: initialTask.subject || '',
        priority: initialTask.priority || 'Medium',
        status: initialTask.status || 'Pending',
        dueDate: initialTask.dueDate ? initialTask.dueDate.substring(0, 10) : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        subject: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
      });
    }
    setValidationError('');
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if ((name === 'title' || name === 'subject') && value.trim()) {
      setValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }
    if (!formData.subject.trim()) {
      setValidationError('Please enter a subject (e.g. Mathematics, Computer Science)');
      return;
    }
    onSubmit({
      ...formData,
      title: formData.title.trim(),
      subject: formData.subject.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {initialTask ? 'Edit Task' : 'Create New Student Task'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="task-title"
              name="title"
              type="text"
              placeholder="e.g. Complete Database Assignment 3"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              autoFocus
            />
            {validationError && <div className="form-error">{validationError}</div>}
          </div>

          {/* Subject & Due Date in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-subject">
                Subject / Course <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="task-subject"
                name="subject"
                type="text"
                placeholder="e.g. DBMS, React, Math"
                value={formData.subject}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-dueDate">
                Due Date
              </label>
              <input
                id="task-dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Priority & Status in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description / Notes (Optional)
            </label>
            <textarea
              id="task-desc"
              name="description"
              rows="3"
              placeholder="Add key instructions, references, or submission links..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderTopColor: '#ffffff' }}></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{initialTask ? 'Save Changes' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
