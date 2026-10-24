const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [60, 'Subject cannot exceed 60 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High', 'low', 'medium', 'high'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
      set: (val) => {
        if (!val) return 'Medium';
        const str = String(val).trim();
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'pending', 'completed', 'In Progress', 'in progress'],
        message: 'Status must be Pending or Completed',
      },
      default: 'Pending',
      set: (val) => {
        if (!val) return 'Pending';
        const str = String(val).trim();
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      },
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal queries by user & status
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
