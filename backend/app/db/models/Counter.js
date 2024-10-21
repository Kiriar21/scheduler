const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  user_id_count: { type: Number, default: 1 },
  company_id_count: { type: Number, default: 1 },
});

module.exports = mongoose.model('Counter', CounterSchema);
