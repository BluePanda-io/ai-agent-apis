const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: false,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  linear_id: {
    type: String,
    trim: true
  },
  comments: [commentSchema],
  contextualChange: {
    type: String,
    default: 'Initial ticket creation'
  }
}, {
  timestamps: true,
  strict: false,
  strictQuery: false
});

module.exports = mongoose.model('Ticket', ticketSchema); 