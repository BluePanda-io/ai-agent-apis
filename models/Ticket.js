const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    match: [/^DG-\d{1,5}$/, 'Identifier must be in the format DG-XXX where X is 1-5 digits']
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema); 