/**
 * Kontroler obsługujący operacje na pojedynczych dniach (Day).
 * @module controllers/DayController
 */
const Day = require('../db/models/Day');

/**
 * Tworzy nowy obiekt Day dla danego użytkownika.
 * @async
 * @function createDay
 * @param {string} userId - ID użytkownika, dla którego tworzony jest dzień.
 * @returns {Promise<object>} Zwraca utworzony obiekt dnia.
 */
//Tworzenie nowego dnia danego użytkownika w grafiku
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
