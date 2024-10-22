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

const validateName = (name) => {
  name = xss(name);
  return name.length >= 3;
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

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateNIP,
  validateUserRole,
  validateTeamId,
  validateShiftHours,
};
