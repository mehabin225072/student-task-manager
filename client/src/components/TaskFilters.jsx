import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

const TaskFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  subjectFilter,
  setSubjectFilter,
  sortBy,
  setSortBy,
  subjects = [],
  onClearFilters,
  isFiltered,
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      {/* Top Row: Search and Status Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
        }}>
          <Search
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
            type="text"
            placeholder="Search tasks by title or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Pill Tabs */}
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          gap: '0.25rem',
          flexWrap: 'wrap',
        }}>
          {[
            { id: '', label: 'All Tasks' },
            { id: 'Pending', label: 'Pending' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? '#ffffff' : 'transparent',
                color: statusFilter === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: statusFilter === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Row: Additional Dropdowns (Priority, Subject, Sort) & Clear */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f5f9',
      }}>
        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Priority:
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Subject Filter */}
        {subjects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Subject:
            </span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="dueDate-desc">Due Date (Latest)</option>
          </select>
        </div>

        {/* Reset / Clear Button */}
        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="btn btn-secondary btn-sm"
            style={{ color: '#ef4444' }}
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
