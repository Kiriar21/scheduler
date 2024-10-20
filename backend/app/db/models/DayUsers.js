const mongoose = require('mongoose');

const dayUsersSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  nameOfDay: {
    type: String,
    enum: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
    required: true,
  }
}, { timestamps: true });

const DayUsers = mongoose.model('DayUsers', dayUsersSchema);

module.exports = DayUsers;
