const mongoose = require('mongoose');

const ticketVersionSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  field: {
    type: String,
    required: true,
    enum: ['title', 'description'] // Add other text fields as needed
  },
  oldValue: {
    type: String,
    required: true
  },
  newValue: {
    type: String,
    required: true
  },
  diff: {
    type: String,
    required: true
  },
  changedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TicketVersion', ticketVersionSchema); 