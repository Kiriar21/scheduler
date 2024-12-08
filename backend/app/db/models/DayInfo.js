/**
 * Model Mongoose reprezentujący dane dnia (DayInfo) w grafiku.
 * @module db/models/DayInfo
 */

const mongoose = require('mongoose');
const DaySchema = require('./Day').schema;
/**
 * Schemat Mongoose dla kolekcji informacji o danym dniu.
 * @type {object}
 */
//Schemat Dnia Info - czyli mamy wszystkie dni kazdego użytkownika w zespole
const DayInfoSchema = new mongoose.Schema({
  dayOfMonth: { type: Number, required: true, min: 1, max: 31 },
  nameDayOfWeek: {
    type: String,
    enum: ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'],
  },
  numberOfWeek: { type: Number, required: true, min: 1, max: 6 },
  employersHours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }],
});

module.exports = mongoose.model('DayInfo', DayInfoSchema);
