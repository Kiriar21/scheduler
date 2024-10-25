const User = require('../db/models/User');
const Company = require('../db/models/Company');
const Team = require('../db/models/Team');
const Scheduler = require('../db/models/Scheduler');
const DayInfo = require('../db/models/DayInfo');
const Day = require('../db/models/Day');
const jwt = require('jsonwebtoken');
const CompanyController = require('./CompanyController');
const { hashPassword, comparePasswords } = require('../utils/passwordUtils');
const {
  validateEmail,
  validatePassword,
  validateName,
  validateUserRole,
  validateTeamId,
  validateObjectId,
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

const addUserToTeam = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { userId, teamName } = req.body;

  
    userId = xss(userId);
    teamName = xss(teamName);

  
    if (!validateObjectId(userId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    if (!teamName || teamName.length < 3) {
      return res.status(400).json({ error: 'Niepoprawna nazwa teamu' });
    }

  
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.company.toString() !== user.company.toString()) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

  
    const team = await Team.findOne({ name: teamName, company: user.company });
    if (!team) {
      return res.status(404).json({ error: 'Team nie został znaleziony' });
    }

  
    if (targetUser.team && targetUser.team.toString() === team._id.toString()) {
      return res.status(400).json({ error: 'Użytkownik już należy do tego teamu' });
    }

  
    targetUser.team = team._id;
    await targetUser.save();

    await Team.findByIdAndUpdate(team._id, { $addToSet: { users: targetUser._id } });

  
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthNameToIndex = {
      'styczeń': 0,
      'luty': 1,
      'marzec': 2,
      'kwiecień': 3,
      'maj': 4,
      'czerwiec': 5,
      'lipiec': 6,
      'sierpień': 7,
      'wrzesień': 8,
      'październik': 9,
      'listopad': 10,
      'grudzień': 11,
    };

  
    const schedulers = await Scheduler.find({
      company: user.company,
      team: team._id,
    });

    for (const scheduler of schedulers) {
      const schedulerMonthIndex = monthNameToIndex[scheduler.month.toLowerCase()];
      const schedulerYear = scheduler.year;

      if (
        schedulerYear > currentYear ||
        (schedulerYear === currentYear && schedulerMonthIndex >= currentMonthIndex)
      ) {
      
        for (const dayInfoId of scheduler.map_month) {
          const dayInfo = await DayInfo.findById(dayInfoId);

          if (dayInfo) {
          
            const day = new Day({
              user: targetUser._id,
              start_hour: 0,
              end_hour: 0,
            
            });

            const savedDay = await day.save();

          
            dayInfo.employersHours.push(savedDay._id);
            await dayInfo.save();
          }
        }
      }
    }

    return res.status(200).json({ message: 'Użytkownik został dodany do teamu i schedulerów' });
  } catch (error) {
    console.error('Error in addUserToTeam:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const editUserTeam = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { userId, newTeamName } = req.body;

  
    userId = xss(userId);
    newTeamName = xss(newTeamName);

  
    if (!validateObjectId(userId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    if (!newTeamName || newTeamName.length < 3) {
      return res.status(400).json({ error: 'Niepoprawna nazwa nowego teamu' });
    }

  
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.company.toString() !== user.company.toString()) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    const oldTeamId = targetUser.team;

  
    const newTeam = await Team.findOne({ name: newTeamName, company: user.company });
    if (!newTeam) {
      return res.status(404).json({ error: 'Nowy team nie został znaleziony' });
    }

  
    if (oldTeamId && oldTeamId.toString() === newTeam._id.toString()) {
      return res.status(400).json({ error: 'Użytkownik już należy do tego teamu' });
    }

  
    targetUser.team = newTeam._id;
    await targetUser.save();

  
    if (oldTeamId) {
      await Team.findByIdAndUpdate(oldTeamId, { $pull: { users: targetUser._id } });
    }
    await Team.findByIdAndUpdate(newTeam._id, { $addToSet: { users: targetUser._id } });

  
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthNameToIndex = {
      'styczeń': 0,
      'luty': 1,
      'marzec': 2,
      'kwiecień': 3,
      'maj': 4,
      'czerwiec': 5,
      'lipiec': 6,
      'sierpień': 7,
      'wrzesień': 8,
      'październik': 9,
      'listopad': 10,
      'grudzień': 11,
    };

  
    const oldSchedulers = await Scheduler.find({
      company: user.company,
      team: oldTeamId,
    });

  
    const newSchedulers = await Scheduler.find({
      company: user.company,
      team: newTeam._id,
    });

  
    const newSchedulersMap = {};
    for (const scheduler of newSchedulers) {
      newSchedulersMap[`${scheduler.year}-${scheduler.month}`] = scheduler;
    }

  
    for (const oldScheduler of oldSchedulers) {
      const schedulerMonthIndex = monthNameToIndex[oldScheduler.month.toLowerCase()];
      const schedulerYear = oldScheduler.year;

      if (
        schedulerYear > currentYear ||
        (schedulerYear === currentYear && schedulerMonthIndex >= currentMonthIndex)
      ) {
      
        let newScheduler = newSchedulersMap[`${schedulerYear}-${oldScheduler.month}`];

        if (!newScheduler) {
          newScheduler = new Scheduler({
            company: user.company,
            team: newTeam._id,
            month: oldScheduler.month,
            year: oldScheduler.year,
            map_month: [],
          });
          await newScheduler.save();
          newSchedulersMap[`${schedulerYear}-${oldScheduler.month}`] = newScheduler;

        
          for (const oldDayInfoId of oldScheduler.map_month) {
            const oldDayInfo = await DayInfo.findById(oldDayInfoId).lean();

            const newDayInfo = new DayInfo({
              dayOfMonth: oldDayInfo.dayOfMonth,
              nameDayOfWeek: oldDayInfo.nameDayOfWeek,
              numberOfWeek: oldDayInfo.numberOfWeek,
              employersHours: [],
            });
            await newDayInfo.save();

            newScheduler.map_month.push(newDayInfo._id);
          }
          await newScheduler.save();
        }

      
        const oldDayInfos = await DayInfo.find({ _id: { $in: oldScheduler.map_month } });
        const newDayInfos = await DayInfo.find({ _id: { $in: newScheduler.map_month } });

        const newDayInfosMap = {};
        for (const newDayInfo of newDayInfos) {
          newDayInfosMap[newDayInfo.dayOfMonth] = newDayInfo;
        }

        for (const oldDayInfo of oldDayInfos) {
          const newDayInfo = newDayInfosMap[oldDayInfo.dayOfMonth];

        
          const dayIndex = oldDayInfo.employersHours.findIndex((dayId) => {
            return Day.findById(dayId).then((day) => {
              return day && day.user.toString() === targetUser._id.toString();
            });
          });

          if (dayIndex !== -1) {
          
            const dayId = oldDayInfo.employersHours[dayIndex];
            const day = await Day.findById(dayId);

          
            oldDayInfo.employersHours.splice(dayIndex, 1);
            await oldDayInfo.save();

          
            newDayInfo.employersHours.push(day._id);
            await newDayInfo.save();
          }
        }
      }
    }

    return res.status(200).json({ message: 'Team użytkownika został zmieniony i dane przeniesione' });
  } catch (error) {
    console.error('Error in editUserTeam:', error);
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
  addUserToTeam,
  editUserTeam,
};
