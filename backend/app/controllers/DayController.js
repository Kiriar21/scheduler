const Day = require('../db/models/Day');

const createDay = async (userId) => {
  try {
    const day = new Day({
      user: userId,
      start_hour: 0,
      end_hour: 0,
    });

    const savedDay = await day.save();

    return savedDay._id;
  } catch (error) {
    console.error('Error in createDay:', error);
    throw error;
  }
};

module.exports = {
  createDay,
};
