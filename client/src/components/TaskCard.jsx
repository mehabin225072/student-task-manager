import React from 'react';
import { Calendar, BookOpen, Edit2, Trash2, Check, Clock, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const isCompleted = task.status === 'Completed';

  // Format Due Date and detect overdue
  const getDueDateInfo = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    // Reset time for accurate date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    const formatted = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    if (diffDays < 0 && !isCompleted) {
      return { text: `Overdue (${formatted})`, isOverdue: true, formatted };
    }
    if (diffDays === 0) {
      return { text: `Due Today`, isToday: true, formatted };
    }
    if (diffDays === 1) {
      return { text: `Due Tomorrow`, isSoon: true, formatted };
    }
    return { text: formatted, isNormal: true, formatted };
  };

  const dueInfo = getDueDateInfo(task.dueDate);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-high';
      case 'Medium':
        return 'badge-medium';
      case 'Low':
        return 'badge-low';
      default:
        return 'badge-medium';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'badge-completed';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Pending':
      default:
        return 'badge-pending';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        transition: 'all 0.15s ease',
        opacity: isCompleted ? 0.75 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--primary-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      {/* Top Header: Checkbox + Title + Actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
            {/* Completion Toggle */}
            <button
              onClick={() => onToggleStatus(task)}
              title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              style={{
                width: '1.35rem',
                height: '1.35rem',
                minWidth: '1.35rem',
                borderRadius: '6px',
                border: isCompleted ? '2px solid #10b981' : '2px solid var(--border-color)',
                backgroundColor: isCompleted ? '#10b981' : '#ffffff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: '0.2rem',
                transition: 'all 0.15s',
              }}
            >
              {isCompleted && <Check size={14} strokeWidth={3} />}
            </button>

            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  lineHeight: 1.35,
                }}
              >
                {task.title}
              </h3>
            </div>
          </div>

          {/* Quick Actions: Edit, Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="btn-icon"
              style={{ padding: '0.35rem' }}
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              title="Delete Task"
              className="btn-icon danger"
              style={{ padding: '0.35rem' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Task Description */}
        {task.description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginTop: '0.5rem',
              marginLeft: '2.1rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Metadata: Subject, Priority, Status, Due Date */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
          marginTop: '0.25rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
          {/* Subject tag */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#f1f5f9',
              color: '#334155',
            }}
          >
            <BookOpen size={12} />
            {task.subject || 'General'}
          </span>

          {/* Priority badge */}
          <span className={`badge ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>

          {/* Status badge */}
          <span className={`badge ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
        </div>

        {/* Due Date Indicator */}
        {dueInfo && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: dueInfo.isOverdue
                ? '#dc2626'
                : dueInfo.isToday
                ? '#d97706'
                : 'var(--text-muted)',
              backgroundColor: dueInfo.isOverdue ? '#fef2f2' : 'transparent',
              padding: dueInfo.isOverdue ? '0.2rem 0.45rem' : '0',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {dueInfo.isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
            <span>{dueInfo.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
