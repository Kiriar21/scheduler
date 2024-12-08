/**
 * Model Mongoose reprezentujący licznik ID użytkowników i firm.
 * @module db/models/Counter
 */

const mongoose = require('mongoose');

/**
 * Schemat Mongoose dla kolekcji licznika.
 * @type {object}
 */

//Schemat licznika do ID
const CounterSchema = new mongoose.Schema({
  user_id_count: { type: Number, default: 1 },
  company_id_count: { type: Number, default: 1 },
});

module.exports = mongoose.model('Counter', CounterSchema);
