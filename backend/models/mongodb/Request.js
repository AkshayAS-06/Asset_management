const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true
  },
  equipmentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  requiredFrom: {
    type: Date,
    required: true
  },
  requiredUntil: {
    type: Date,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String
  },
  approvalDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  comments: {
    type: String
  }
});

module.exports = mongoose.model('Request', RequestSchema);