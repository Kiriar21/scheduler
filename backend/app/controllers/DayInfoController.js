const DayInfo = require('../db/models/DayInfo');
const DayController = require('./DayController');

const createDayInfo = async (dayInfoData, users) => {
  try {
    const employersHours = [];

    for (const user of users) {
      const dayId = await DayController.createDay(user._id);
      employersHours.push(dayId);
    }

    const dayInfo = new DayInfo({
      dayOfMonth: dayInfoData.dayOfMonth,
      nameDayOfWeek: dayInfoData.nameDayOfWeek,
      numberOfWeek: dayInfoData.numberOfWeek,
      employersHours,
    });

    const savedDayInfo = await dayInfo.save();

    return savedDayInfo._id;
  } catch (error) {
    console.error('Error in createDayInfo:', error);
    throw error;
  }
};

module.exports = {
  createDayInfo,
};
