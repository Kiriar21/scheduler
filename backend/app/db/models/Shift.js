const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  start_shift: { type: Number, min: 0, max: 23 },
  end_shift: { type: Number, min: 0, max: 23 },
});

module.exports = mongoose.model('Shift', ShiftSchema);
