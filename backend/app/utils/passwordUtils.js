const bcrypt = require('bcrypt');

/**
 * Haszuje hasło użytkownika.
 * @async
 * @function hashPassword
 * @param {string} password - Hasło do zahashowania.
 * @returns {Promise<string>} Zwraca zahashowane hasło.
 */


//Hashowanie hasła 
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Porównuje hasło w formie jawnej z zahashowanym hasłem.
 * @async
 * @function comparePasswords
 * @param {string} password - Hasło w formie jawnej.
 * @param {string} hashedPassword - Zahashowane hasło do porównania.
 * @returns {Promise<boolean>} Zwraca true, jeśli hasła są zgodne.
 */


//Porównywanie hasła podczas zmiany hasła
const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePasswords,
};
