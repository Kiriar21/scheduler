const xss = require('xss');
const mongoose = require('mongoose');

//Walidacja email
const validateEmail = (email) => {
  email = xss(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

//Walidacja hasła administratora
const validatePassword = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  return pwdRegex.test(password);
};

//Walidacja hasła pracownika i managera
const validatePasswordUser = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return pwdRegex.test(password);
};

//Walidacja nazwy firmy
const validateName = (name) => {
  name = xss(name);
  return name.length >= 3;
};

//Walidacja nazwy zespolu
const validateNameTeam = (name) => {
  name = xss(name);
  return name.length >= 2;
};

//Walidacja NIP'u firmy
const validateNIP = (nip) => {
  nip = xss(nip);
  const nipRegex = /^\d{10}$/;
  return nipRegex.test(nip);
};

//Walidacja roli dodawanego uzytkownika
const validateUserRole = (role) => {
  role = xss(role);
  return ['user', 'manager'].includes(role);
};

//Walidacja identyfikatora zespołu
const validateTeamId = (teamId) => {
  return teamId && teamId.match(/^[0-9a-fA-F]{24}$/);
};

//Walidacja przepracowanej ilości godzin
const validateShiftHours = (start_shift, end_shift) => {
  return end_shift - start_shift >= 8;
};

//Walidacja samego w sobie object id
const validateObjectId = (id) => {
  id = xss(id);
  return mongoose.Types.ObjectId.isValid(id);
};

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
