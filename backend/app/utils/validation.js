/**
 * Funkcje walidacyjne danych wejściowych.
 * @module validation
 */

const xss = require('xss');
const mongoose = require('mongoose');


/**
 * Waliduje poprawność adresu email.
 * @function validateEmail
 * @param {string} email - Adres email do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli email jest poprawny.
 */

//Walidacja email
const validateEmail = (email) => {
  email = xss(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Waliduje hasło administratora.
 * Musi zawierać co najmniej 10 znaków, w tym małe, duże litery, cyfry i znaki specjalne.
 * @function validatePassword
 * @param {string} password - Hasło do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli hasło spełnia wymagania.
 */
//Walidacja hasła administratora
const validatePassword = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  return pwdRegex.test(password);
};

/**
 * Waliduje hasło użytkownika (manager/pracownik).
 * Musi zawierać co najmniej 8 znaków, w tym małe, duże litery, cyfry i znaki specjalne.
 * @function validatePasswordUser
 * @param {string} password - Hasło do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli hasło spełnia wymagania.
 */
//Walidacja hasła pracownika i managera
const validatePasswordUser = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return pwdRegex.test(password);
};

/**
 * Waliduje nazwę firmy.
 * Musi mieć co najmniej 3 znaki.
 * @function validateName
 * @param {string} name - Nazwa do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli nazwa jest poprawna.
 */
//Walidacja nazwy firmy
const validateName = (name) => {
  name = xss(name);
  return name.length >= 3;
};

/**
 * Waliduje nazwę zespołu.
 * Musi mieć co najmniej 2 znaki.
 * @function validateNameTeam
 * @param {string} name - Nazwa zespołu.
 * @returns {boolean} Zwraca true, jeśli nazwa jest poprawna.
 */
//Walidacja nazwy zespolu
const validateNameTeam = (name) => {
  name = xss(name);
  return name.length >= 2;
};


/**
 * Waliduje format NIP (musi składać się z 10 cyfr).
 * @function validateNIP
 * @param {string} nip - Numer NIP.
 * @returns {boolean} Zwraca true, jeśli NIP jest poprawny.
 */
//Walidacja NIP'u firmy
const validateNIP = (nip) => {
  nip = xss(nip);
  const nipRegex = /^\d{10}$/;
  return nipRegex.test(nip);
};

/**
 * Waliduje rolę użytkownika.
 * Dostępne role: 'user', 'manager'.
 * @function validateUserRole
 * @param {string} role - Rola użytkownika.
 * @returns {boolean} Zwraca true, jeśli rola jest poprawna.
 */
//Walidacja roli dodawanego uzytkownika
const validateUserRole = (role) => {
  role = xss(role);
  return ['user', 'manager'].includes(role);
};

/**
 * Waliduje identyfikator zespołu.
 * Sprawdza czy ma format ObjectId (24-znakowy hex).
 * @function validateTeamId
 * @param {string} teamId - Identyfikator zespołu.
 * @returns {boolean} Zwraca true, jeśli identyfikator jest poprawny.
 */
//Walidacja identyfikatora zespołu
const validateTeamId = (teamId) => {
  return teamId && teamId.match(/^[0-9a-fA-F]{24}$/);
};

/**
 * Waliduje ilość przepracowanych godzin.
 * Wymagane minimum 8h (end_shift - start_shift >= 8).
 * @function validateShiftHours
 * @param {number} start_shift - Godzina rozpoczęcia.
 * @param {number} end_shift - Godzina zakończenia.
 * @returns {boolean} Zwraca true, jeśli warunek jest spełniony.
 */
//Walidacja przepracowanej ilości godzin
const validateShiftHours = (start_shift, end_shift) => {
  return end_shift - start_shift >= 8;
};

/**
 * Waliduje ObjectId z MongoDB.
 * @function validateObjectId
 * @param {string} id - Identyfikator do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli jest poprawnym ObjectId.
 */
//Walidacja samego w sobie object id
const validateObjectId = (id) => {
  id = xss(id);
  return mongoose.Types.ObjectId.isValid(id);
};


/**
 * Waliduje nazwę miesiąca (w języku polskim).
 * @function validateMonthName
 * @param {string} month - Nazwa miesiąca.
 * @returns {boolean} Zwraca true, jeśli jest poprawną nazwą.
 */
//Walidacja nazwy miesiąca
const validateMonthName = (month) => {
  month = xss(month).toLowerCase();
  const months = [
    'styczeń',
    'luty',
    'marzec',
    'kwiecień',
    'maj',
    'czerwiec',
    'lipiec',
    'sierpień',
    'wrzesień',
    'październik',
    'listopad',
    'grudzień',
  ];
  return months.includes(month);
};

/**
 * Waliduje rok (od 1900 do 2100).
 * @function validateYear
 * @param {string} year - Rok do sprawdzenia.
 * @returns {boolean} Zwraca true, jeśli rok mieści się w podanym zakresie.
 */
//Walidacja roku
const validateYear = (year) => {
  year = xss(year);
  const yearInt = parseInt(year, 10);
  return /^\d{4}$/.test(year) && yearInt >= 1900 && yearInt <= 2100;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateNIP,
  validateUserRole,
  validateTeamId,
  validateShiftHours,
  validateObjectId,
  validateMonthName,
  validateYear,
  validateNameTeam,
  validatePasswordUser,
};
