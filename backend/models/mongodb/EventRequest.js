const mongoose = require("mongoose");

const eventRequestSchema = new mongoose.Schema({
  requestId: String,
  eventId: String,
  studentId: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  comments: String,
});

module.exports = mongoose.model("EventRequest", eventRequestSchema);
