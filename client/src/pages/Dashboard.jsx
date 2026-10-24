import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import {
  getTasksApi,
  getTaskStatsApi,
  createTaskApi,
  updateTaskApi,
  updateTaskStatusApi,
  deleteTaskApi,
} from '../services/api';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  Flame,
  Plus,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

const Dashboard = () => {
  // State for Tasks & Stats
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
    overdue: 0,
    subjects: [],
  });

  // Screen States (Section 7.3: Loading, Success, Empty, Error)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt-desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch tasks based on filters
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [sortField, sortOrder] = sortBy.split('-');

      const params = {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        subject: subjectFilter || undefined,
        sortBy: sortField,
        order: sortOrder,
      };

      const res = await getTasksApi(params);
      if (res.data && res.data.data) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(
        err.response?.data?.message ||
          'Unable to load your tasks right now. Please verify backend server and database connection.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, subjectFilter, sortBy]);

  // Fetch student stats
  const fetchStats = async () => {
    try {
      const res = await getTaskStatsApi();
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Load stats and tasks
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Debounce search input
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Create or Update task handler
  const handleSaveTask = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedTask) {
        // Update existing task
        await updateTaskApi(selectedTask._id, formData);
        showToast('Task updated successfully!');
      } else {
        // Create new task
        await createTaskApi(formData);
        showToast('Task created successfully!');
      }

      setIsModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Error saving task:', err);
      alert(err.response?.data?.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle quick completion status
  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );

      await updateTaskStatusApi(task._id, newStatus);
      fetchStats();
      showToast(
        newStatus === 'Completed' ? 'Task marked as completed! 🎉' : 'Task marked as pending.'
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      fetchTasks(); // Rollback on error
    }
  };

  // Delete task handler
  const handleConfirmDelete = async () => {
    if (!deleteTaskId) return;
    try {
      setIsDeleting(true);
      await deleteTaskApi(deleteTaskId);
      setDeleteTaskId(null);
      showToast('Task removed.');
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const isFiltered = Boolean(
    search || statusFilter || priorityFilter || subjectFilter || sortBy !== 'createdAt-desc'
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setSubjectFilter('');
    setSortBy('createdAt-desc');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      <main className="container" style={{ flex: 1, padding: '2rem 1.25rem' }}>
        {/* Toast notification */}
        {toastMessage && (
          <div
            className={`alert ${
              toastMessage.type === 'danger' ? 'alert-danger' : 'alert-success'
            }`}
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {toastMessage.msg}
          </div>
        )}

        {/* Dashboard Header Title */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.75rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              Academic Task Hub
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Organize assignments, lab records, projects, and track preparation deadlines.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatCard
            title="Total Tasks"
            count={stats.total}
            icon={ListTodo}
            color="#4f46e5"
            bg="#eef2ff"
            border="#c7d2fe"
            active={statusFilter === ''}
            onClick={() => setStatusFilter('')}
          />
          <StatCard
            title="Pending"
            count={stats.pending}
            icon={Clock}
            color="#475569"
            bg="#f1f5f9"
            border="#cbd5e1"
            active={statusFilter === 'Pending'}
            onClick={() => setStatusFilter('Pending')}
          />
          <StatCard
            title="In Progress"
            count={stats.inProgress}
            icon={RefreshCw}
            color="#2563eb"
            bg="#eff6ff"
            border="#bfdbfe"
            active={statusFilter === 'In Progress'}
            onClick={() => setStatusFilter('In Progress')}
          />
          <StatCard
            title="Completed"
            count={stats.completed}
            icon={CheckCircle2}
            color="#16a34a"
            bg="#f0fdf4"
            border="#bbf7d0"
            active={statusFilter === 'Completed'}
            onClick={() => setStatusFilter('Completed')}
          />
          <StatCard
            title="Overdue"
            count={stats.overdue}
            icon={AlertTriangle}
            color="#dc2626"
            bg="#fef2f2"
            border="#fecaca"
            subtitle="Needs attention"
          />
        </div>

        {/* Filter, Search & Sort Bar */}
        <TaskFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          subjects={stats.subjects || []}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* 4 STATES: LOADING, ERROR, EMPTY, SUCCESS */}

        {/* 1. Loading State */}
        {loading && (
          <div
            style={{
              padding: '4rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <div className="spinner"></div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Loading your tasks...
            </p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid #fecaca',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '0.5rem',
              }}
            >
              Unable to Load Tasks
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                maxWidth: '460px',
                margin: '0 auto 1.5rem',
              }}
            >
              {error}
            </p>
            <button onClick={fetchTasks} className="btn btn-primary btn-sm">
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && tasks.length === 0 && (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-color)',
              padding: '4rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <FolderOpen size={32} />
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '0.5rem',
              }}
            >
              {isFiltered ? 'No tasks match your filters' : 'No tasks created yet'}
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                maxWidth: '420px',
                margin: '0 auto 1.5rem',
                lineHeight: 1.5,
              }}
            >
              {isFiltered
                ? 'Try resetting your search query or changing your status/priority filters.'
                : 'Stay ahead of your coursework by adding your first study task, assignment, or project milestone.'}
            </p>

            {isFiltered ? (
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                Clear Filters
              </button>
            ) : (
              <button onClick={handleOpenCreateModal} className="btn btn-primary">
                <Plus size={16} />
                <span>Create Your First Task</span>
              </button>
            )}
          </div>
        )}

        {/* 4. Success State (Task Grid) */}
        {!loading && !error && tasks.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleOpenEditModal}
                onDelete={(id) => setDeleteTaskId(id)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        initialTask={selectedTask}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTaskId)}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
