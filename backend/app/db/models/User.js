const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    minlength: 6,
    match: /.+@.+\..+/,
    required: false,
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
  },
  pwd: {
    type: String,
    required: true,
    minlength: 10,
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  surname: {
    type: String,
    required: true,
    minlength: 3,
  },
  nip: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },
  role: {
    type: String,
    enum: ['User', 'Manager', 'Administrator'],
    default: 'User',
    required: true,
  },
  team: {
    type: String,
    required: false,
  },
  schedulers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheduler',
    required: false
  }],
  workHours: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
