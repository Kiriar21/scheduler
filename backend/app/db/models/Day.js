const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start_hour: { type: Number, min: 0, max: 23 },
  end_hour: { type: Number, min: 0, max: 23 },
  hours: { type: Number, default: 0 },
  prefferedHours: { type: String, default: '' },
  availability: { type: String, default: '' },
  userSubmit: { type: Boolean, default: false },
  managerSubmit: { type: Boolean, default: false },
});

DaySchema.pre('save', function (next) {
  if (this.start_hour != null && this.end_hour != null) {
    this.hours = this.end_hour - this.start_hour;
  }
  next();
});

module.exports = mongoose.model('Day', DaySchema);
