/**
 * Model Mongoose reprezentujący zespół.
 * @module db/models/Team
 */
const mongoose = require('mongoose');
const ShiftSchema = require('./Shift').schema;
/**
 * Schemat Mongoose dla kolekcji zespołów.
 * @type {object}
 */
//Schemat zespołu
const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  shift: ShiftSchema,
});

module.exports = mongoose.model('Team', TeamSchema);
