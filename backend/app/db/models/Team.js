const mongoose = require('mongoose');
const ShiftSchema = require('./Shift').schema;

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  shift: ShiftSchema,
});

module.exports = mongoose.model('Team', TeamSchema);
