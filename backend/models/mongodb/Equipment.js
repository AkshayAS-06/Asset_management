const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  equipmentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISPOSED'],
    default: 'AVAILABLE'
  },
  purchaseDate: {
    type: Date
  },
  value: {
    type: Number
  },
  location: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);