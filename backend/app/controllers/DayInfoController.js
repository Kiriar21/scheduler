const DayInfo = require('../db/models/DayInfo');
const DayController = require('./DayController');

const createDayInfo = async (dayInfoData, users) => {
  try {
    const employersHours = [];

    for (const user of users) {
      const day = await DayController.createDay(user._id); // Pobieramy cały obiekt dnia
      employersHours.push(day); // Dodajemy cały obiekt do `employersHours`
    }

    const dayInfo = new DayInfo({
      dayOfMonth: dayInfoData.dayOfMonth,
      nameDayOfWeek: dayInfoData.nameDayOfWeek,
      numberOfWeek: dayInfoData.numberOfWeek,
      employersHours, // Przypisujemy poprawioną tablicę z obiektami dni
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
