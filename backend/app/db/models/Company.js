const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  nip: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },
  teams: {
    type: [String], 
    validate: {
      validator: function (v) {
        return Array.isArray(v) && new Set(v).size === v.length; 
      },
      message: 'Nazwy zespołów muszą być unikalne.'
    }
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }],
  schedulers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheduler',
    required: false
  }]
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
