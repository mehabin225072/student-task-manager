const mongoose = require('mongoose');
const Task = require('../models/Task');

// Helper to seed realistic academic tasks for any user who has 0 tasks
const seedDefaultTasksForUser = async (userId) => {
  const sampleTasks = [
    {
      user: userId,
      title: 'Complete ICTAK MERN Stack Project Submission',
      description:
        'Verify live deployment on GitHub Pages, Render cloud API backend, and MongoDB Atlas database connection.',
      subject: 'Web Development',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 2),
    },
    {
      user: userId,
      title: 'Data Structures Assignment: AVL Trees & Graph Traversal',
      description:
        'Implement BFS and DFS graph traversals and compare time complexity using adjacency list representation.',
      subject: 'Data Structures',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 4),
    },
    {
      user: userId,
      title: 'DBMS Lab: Normalize Tables to 3NF & BCNF',
      description:
        'Decompose student course registration schema into 3NF and verify loss-less join property.',
      subject: 'Database Systems',
      priority: 'Medium',
      status: 'Completed',
      dueDate: new Date(Date.now() - 86400000 * 1),
    },
    {
      user: userId,
      title: 'Java OOP Microproject: Library Management Module',
      description:
        'Implement inheritance, interface abstraction, and custom exception handling for book issue tracking.',
      subject: 'Object Oriented Programming',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 6),
    },
    {
      user: userId,
      title: 'Discrete Mathematics: Solve Recurrence Relations',
      description:
        'Solve homogeneous recurrence relations using characteristic equation roots and Master Theorem.',
      subject: 'Mathematics',
      priority: 'Low',
      status: 'Completed',
      dueDate: new Date(Date.now() - 86400000 * 2),
    },
    {
      user: userId,
      title: 'Operating Systems: CPU Scheduling Algorithms Simulation',
      description:
        'Calculate average waiting time and turnaround time for FCFS, SJF, and Round Robin scheduling.',
      subject: 'Operating Systems',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 7),
    },
    {
      user: userId,
      title: 'Prepare Presentation Slides for MERN Project Viva',
      description:
        'Create clean slides explaining MVC pattern, JWT authentication flow, and REST API CRUD endpoints.',
      subject: 'Web Development',
      priority: 'High',
      status: 'Pending',
      dueDate: new Date(Date.now() + 86400000 * 3),
    },
    {
      user: userId,
      title: 'Computer Organization: Cache Memory Mapping Study',
      description:
        'Compare Direct-mapped, Fully associative, and Set-associative cache placement techniques.',
      subject: 'Computer Architecture',
      priority: 'Low',
      status: 'Completed',
      dueDate: new Date(Date.now() - 86400000 * 3),
    },
  ];

  try {
    await Task.insertMany(sampleTasks);
  } catch (e) {
    console.error('Auto-seed default tasks error:', e.message);
  }
};

// @desc    Get all tasks for logged in student
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    // If the logged in student currently has 0 tasks, seed default tasks so they never see an empty screen
    const userTaskCount = await Task.countDocuments({ user: req.user._id });
    if (userTaskCount === 0) {
      await seedDefaultTasksForUser(req.user._id);
    }

    const {
      status,
      priority,
      subject,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    // Strictly enforce ownership: only fetch tasks belonging to the authenticated student
    const query = { user: req.user._id };

    // Status filter (case-resilient)
    if (status && status !== 'All' && status !== 'all') {
      const normalizedStatus =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      query.status = { $in: [normalizedStatus, status] };
    }

    // Priority filter (case-resilient)
    if (priority && priority !== 'All' && priority !== 'all') {
      const normalizedPriority =
        priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
      query.priority = { $in: [normalizedPriority, priority] };
    }

    // Subject filter
    if (subject && subject.trim() !== '' && subject !== 'All') {
      query.subject = { $regex: subject.trim(), $options: 'i' };
    }

    // Search keyword in title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Build sort
    const sort = {};
    const sortOrder = order === 'asc' ? 1 : -1;

    if (sortBy === 'dueDate') {
      sort.dueDate = sortOrder;
    } else if (sortBy === 'priority') {
      sort.priority = sortOrder;
    } else {
      sort.createdAt = sortOrder;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const totalTasks = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        total: totalTasks,
        page: pageNum,
        pages: Math.ceil(totalTasks / limitNum) || 1,
        limit: limitNum,
      },
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics for logged in student
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // If student has 0 tasks, auto-seed default academic tasks
    const count = await Task.countDocuments({ user: userId });
    if (count === 0) {
      await seedDefaultTasksForUser(userId);
    }

    const now = new Date();

    const [total, pending, completed, highPriority, overdue] =
      await Promise.all([
        Task.countDocuments({ user: userId }),
        Task.countDocuments({ user: userId, status: 'Pending' }),
        Task.countDocuments({ user: userId, status: 'Completed' }),
        Task.countDocuments({
          user: userId,
          priority: 'High',
          status: { $ne: 'Completed' },
        }),
        Task.countDocuments({
          user: userId,
          status: { $ne: 'Completed' },
          dueDate: { $lt: now, $ne: null },
        }),
      ]);

    const subjects = await Task.distinct('subject', { user: userId });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        completed,
        highPriority,
        overdue,
        subjects: subjects.filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, subject, priority, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    // NEVER trust a user ID supplied by client body - strictly bind to req.user._id from JWT
    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      subject: subject.trim(),
      priority: priority || 'Medium',
      status: status || 'Pending',
      dueDate: dueDate || null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const { title, description, subject, priority, status, dueDate } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty',
        });
      }
      task.title = title.trim();
    }

    if (subject !== undefined) {
      if (!subject.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Subject cannot be empty',
        });
      }
      task.subject = subject.trim();
    }

    if (description !== undefined) task.description = description.trim();
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change pending/completed status quickly
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status value is required',
      });
    }

    const validStatuses = ['Pending', 'Completed', 'pending', 'completed', 'In Progress', 'in progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Pending or Completed',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    task.status = status;
    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Verify ownership
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
