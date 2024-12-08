/**
 * Model Mongoose reprezentujący użytkownika systemu.
 * @module db/models/User
 */
const mongoose = require('mongoose');
const Counter = require('./Counter');
/**
 * Schemat Mongoose dla kolekcji użytkowników.
 * @type {object}
 */
//Schemat użytkownika
const UserSchema = new mongoose.Schema({
  id_user: { type: Number, unique: true },
  email: { type: String, minlength: 5 },
  pwd: { type: String, required: true, minlength: 10 },
  name: { type: String, required: true, minlength: 3 },
  surname: { type: String, required: true, minlength: 3 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  role: { type: String, required: true, enum: ['user', 'manager', 'admin'], default: 'user' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
});

UserSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      {},
      { $inc: { user_id_count: 1 } },
      { new: true, upsert: true }
    );
    this.id_user = counter.user_id_count;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
