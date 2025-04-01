const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['STUDENT', 'HOD', 'STAFF'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});
// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });


module.exports = mongoose.model('User', UserSchema);