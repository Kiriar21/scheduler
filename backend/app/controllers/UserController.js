const User = require('../db/models/User');
const Company = require('../db/models/Company');
const Team = require('../db/models/Team');
const jwt = require('jsonwebtoken');
const CompanyController = require('./CompanyController');
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const {
  validateEmail,
  validatePassword,
  validateName,
  validateUserRole,
  validateTeamId,
} = require('../utils/validation');

const adminRegister = async (req, res) => {
  try {
    let { email, pwd, name, surname, nip, companyName, confirmPwd } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Niepoprawny format email' });
    }

    if (!validatePassword(pwd)) {
      return res.status(400).json({ error: 'Hasło nie spełnia wymagań bezpieczeństwa' });
    }

    if (pwd !== confirmPwd) {
      return res.status(400).json({ error: 'Hasła nie są identyczne' });
    }

    if (!validateName(name) || !validateName(surname)) {
      return res.status(400).json({ error: 'Imię i nazwisko muszą mieć co najmniej 3 znaki' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email jest już zarejestrowany' });
    }

    const hashedPassword = await hashPassword(pwd);

    const newUser = new User({
      email,
      pwd: hashedPassword,
      name,
      surname,
      role: 'admin',
    });

    const savedUser = await newUser.save();

    const companyData = {
      nip,
      name: companyName,
      admin: savedUser._id,
    };

    const savedCompany = await CompanyController.registerCompany(companyData);

    savedUser.company = savedCompany._id;
    await savedUser.save();

    return res.status(201).json({ message: 'Administrator i firma zostali pomyślnie utworzeni' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const userRegister = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { email, pwd, name, surname, role, teamId } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Niepoprawny format email' });
    }

    if (!validatePassword(pwd)) {
      return res.status(400).json({ error: 'Hasło nie spełnia wymagań bezpieczeństwa' });
    }

    if (!validateName(name) || !validateName(surname)) {
      return res.status(400).json({ error: 'Imię i nazwisko muszą mieć co najmniej 3 znaki' });
    }

    if (!validateUserRole(role)) {
      return res.status(400).json({ error: 'Niepoprawna rola użytkownika' });
    }

    if (!validateTeamId(teamId)) {
      return res.status(400).json({ error: 'Nieprawidłowy identyfikator teamu' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email jest już zarejestrowany' });
    }

    const team = await Team.findById(teamId);
    if (!team || team.company.toString() !== req.user.company.toString()) {
      return res.status(400).json({ error: 'Nieprawidłowy team' });
    }

    const hashedPassword = await hashPassword(pwd);

    const newUser = new User({
      email,
      pwd: hashedPassword,
      name,
      surname,
      role,
      team: teamId,
      company: req.user.company,
    });

    const savedUser = await newUser.save();

    await Company.findByIdAndUpdate(req.user.company, { $push: { users: savedUser._id } });
    await Team.findByIdAndUpdate(teamId, { $push: { users: savedUser._id } });

    return res.status(201).json({ message: 'Użytkownik został pomyślnie zarejestrowany' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, pwd } = req.body;

    if (!validateEmail(email) || !pwd) {
      return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
    }


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
    }


    const validPassword = await comparePasswords(pwd, user.pwd);
    if (!validPassword) {
      return res.status(400).json({ error: 'Nieprawidłowy email lub hasło' });
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const editUser = async (req, res) => {
  try {
    const userId = req.user._id;
    let { name, surname, email } = req.body;


    if (!validateName(name) || !validateName(surname)) {
      return res.status(400).json({ error: 'Imię i nazwisko muszą mieć co najmniej 3 znaki' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Niepoprawny format email' });
    }


    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email jest już zarejestrowany' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, surname, email },
      { new: true }
    );

    return res.status(200).json({ message: 'Dane zostały zaktualizowane', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const editPassword = async (req, res) => {
  try {
    const userId = req.user._id;
    let { oldPassword, newPassword } = req.body;


    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Nowe hasło nie spełnia wymagań' });
    }

    const user = await User.findById(userId);


    const validPassword = await comparePasswords(oldPassword, user.pwd);
    if (!validPassword) {
      return res.status(400).json({ error: 'Stare hasło jest nieprawidłowe' });
    }


    user.pwd = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ message: 'Hasło zostało zmienione' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const modifyUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { userId, role, teamId } = req.body;


    if (!validateUserRole(role)) {
      return res.status(400).json({ error: 'Niepoprawna rola użytkownika' });
    }

    if (!validateTeamId(teamId)) {
      return res.status(400).json({ error: 'Nieprawidłowy identyfikator teamu' });
    }


    const user = await User.findById(userId);
    if (!user || user.company.toString() !== req.user.company.toString()) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }


    const team = await Team.findById(teamId);
    if (!team || team.company.toString() !== req.user.company.toString()) {
      return res.status(400).json({ error: 'Nieprawidłowy team' });
    }


    user.role = role;
    user.team = teamId;
    await user.save();

    return res.status(200).json({ message: 'Użytkownik został zmodyfikowany', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const userId = req.params.userId;


    const user = await User.findById(userId);
    if (!user || user.company.toString() !== req.user.company.toString()) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    await User.findByIdAndDelete(userId);


    await Company.findByIdAndUpdate(req.user.company, { $pull: { users: userId } });
    if (user.team) {
      await Team.findByIdAndUpdate(user.team, { $pull: { users: userId } });
    }

    return res.status(200).json({ message: 'Użytkownik został usunięty' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate('company', 'name nip')
      .populate('team', 'name')
      .select('-pwd');

    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getUsers = async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const users = await User.find({ company: req.user.company }).select('-pwd');

    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  adminRegister,
  userRegister,
  loginUser,
  editUser,
  editPassword,
  modifyUser,
  deleteUser,
  getUser,
  getUsers,
};
