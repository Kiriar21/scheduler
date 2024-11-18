const Day = require('../db/models/Day');

const createDay = async (userId) => {
  try {
    const day = new Day({
      user: userId, // Upewniamy się, że pole `user` jest ustawione
      start_hour: 0,
      end_hour: 0,
    });

    const savedDay = await day.save();
    return savedDay; // Zwracamy cały obiekt dnia zamiast tylko ID
  } catch (error) {
    console.error('Error in createDay:', error);
    throw error;
  }
};


module.exports = {
  createDay,
};
