const mongoose = require('mongoose');
const DaySchema = require('./Day').schema;

const DayInfoSchema = new mongoose.Schema({
  dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
  nameDayOfWeek: {
    type: String,
    enum: ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'],
  },
  numberOfWeek: { type: Number, required: true, min: 1, max: 6 },
  employersHours: [DaySchema],
});

module.exports = mongoose.model('DayInfo', DayInfoSchema);
