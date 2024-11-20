const mongoose = require('mongoose');
const Counter = require('./Counter');

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

UserSchema.post('findOneAndDelete', async function (doc, next) {
  if (doc) {
    const userId = doc._id;
    const companyId = doc.company;
    const teamId = doc.team;

    // Znajdź wszystkie Scheduler związane z firmą i zespołem
    const schedulers = await Scheduler.find({ company: companyId, team: teamId });

    await Promise.all(
      schedulers.map(async (scheduler) => {
        const dayInfos = await DayInfo.find({ _id: { $in: scheduler.map_month } });

        await Promise.all(
          dayInfos.map(async (dayInfo) => {
            // Znajdź Day powiązane z użytkownikiem
            const userDayIds = await Day.find({ user: userId, _id: { $in: dayInfo.employersHours } })
              .select('_id')
              .then((days) => days.map((day) => day._id));

            if (userDayIds.length > 0) {
              // Usuń Day
              await Day.deleteMany({ _id: { $in: userDayIds } });

              // Usuń referencje z employersHours
              dayInfo.employersHours = dayInfo.employersHours.filter(
                (dayId) => !userDayIds.includes(dayId.toString())
              );
              await dayInfo.save();
            }
          })
        );
      })
    );
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
