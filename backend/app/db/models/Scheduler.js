const mongoose = require('mongoose');
const DayInfoSchema = require('./DayInfo').schema;

const SchedulerSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  month: {
    type: String,
    required: true,
    enum: [
      'styczeń',
      'luty',
      'marzec',
      'kwiecień',
      'maj',
      'czerwiec',
      'lipiec',
      'sierpień',
      'wrzesień',
      'październik',
      'listopad',
      'grudzień',
    ],
  },
  year: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  map_month: [DayInfoSchema],
});

module.exports = mongoose.model('Scheduler', SchedulerSchema);
