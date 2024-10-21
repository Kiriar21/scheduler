const mongoose = require('mongoose');
const Counter = require('./Counter');

const CompanySchema = new mongoose.Schema({
  id_company: { type: Number, unique: true },
  nip: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedulers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scheduler' }],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
});

CompanySchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      {},
      { $inc: { company_id_count: 1 } },
      { new: true, upsert: true }
    );
    this.id_company = counter.company_id_count;
  }
  next();
});

module.exports = mongoose.model('Company', CompanySchema);
