const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  eventId: String,
  eventName: String,
  description: String,
  date: Date,
  location: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Completed"],
    default: "Pending",
  },
  createdBy: String, // studentId
  approvedBy: String, // hodId
  createdDate: {
    type: Date,
    default: Date.now,
  },
  comments: String,
});

module.exports = mongoose.model("Event", eventSchema);
