const xss = require('xss');

const validateEmail = (email) => {
  email = xss(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
  return pwdRegex.test(password);
};

const validatePasswordUser = (password) => {
  password = xss(password);
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return pwdRegex.test(password);
};


const validateName = (name) => {
  name = xss(name);
  return name.length >= 3;
};

const validateNameTeam = (name) => {
  name = xss(name);
  return name.length >= 2;
};

const validateNIP = (nip) => {
  nip = xss(nip);
  const nipRegex = /^\d{10}$/;
  return nipRegex.test(nip);
};

const validateUserRole = (role) => {
  role = xss(role);
  return ['user', 'manager'].includes(role);
};

const validateTeamId = (teamId) => {
  return teamId && teamId.match(/^[0-9a-fA-F]{24}$/);
};

const validateShiftHours = (start_shift, end_shift) => {
  return end_shift - start_shift >= 8;
};

const validateObjectId = (id) => {
  id = xss(id);
  return mongoose.Types.ObjectId.isValid(id);
};

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
