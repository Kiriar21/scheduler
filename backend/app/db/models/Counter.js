const mongoose = require('mongoose');

//Schemat licznika do ID
const CounterSchema = new mongoose.Schema({
  user_id_count: { type: Number, default: 1 },
  company_id_count: { type: Number, default: 1 },
});

module.exports = mongoose.model('Counter', CounterSchema);
