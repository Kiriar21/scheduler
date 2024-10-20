const mongoose = require('mongoose');

const schedulerSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function (managerId) {
        const User = mongoose.model('User');
        const user = await User.findById(managerId);
        return user && user.role === 'Manager';
      },
      message: 'Użytkownik musi mieć rolę "Manager".'
    }
  },
  nip: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    enum: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    required: true,
  },
  year: {
    type: String,
    minlength: 4,
    maxlength: 4,
    required: true,
  }
}, { timestamps: true });

const Scheduler = mongoose.model('Scheduler', schedulerSchema);

module.exports = Scheduler;
