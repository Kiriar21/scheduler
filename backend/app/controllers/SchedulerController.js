

const Scheduler = require('../db/models/Scheduler');
const User = require('../db/models/User');
const Team = require('../db/models/Team');
const DayInfoController = require('./DayInfoController');
const mongoose = require('mongoose');
const xss = require('xss');
const {
  validateMonthName,
  validateYear,
  validateObjectId,
} = require('../utils/validation');

const createScheduler = async (req, res) => {
  try {
    const user = req.user;
    let { month, year, teamId } = req.body;


    month = xss(month);
    year = parseInt(xss(year), 10);
    teamId = xss(teamId);


    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    if (!validateObjectId(teamId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator teamu' });
    }

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
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const providedMonthIndex = months.indexOf(month.toLowerCase());


    if (providedMonthIndex === -1) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (
      year < currentYear || 
      (year === currentYear && providedMonthIndex < currentMonthIndex)
    ) {
      return res.status(400).json({
        error: 'Grafiki mogą być tworzone tylko dla bieżącego lub przyszłego miesiąca.',
      });
    }

    const team = await Team.findOne({ _id: teamId, company: user.company });
    if (!team) {
      return res.status(404).json({ error: 'Team nie został znaleziony' });
    }


    const existingScheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    });

    if (existingScheduler) {
      return res
        .status(400)
        .json({ error: 'Scheduler dla podanego miesiąca i teamu już istnieje' });
    }


    const newScheduler = new Scheduler({
      company: user.company,
      team: teamId,
      month,
      year,
      map_month: [],
    });

    const savedScheduler = await newScheduler.save();


    const mapMonth = await createMapMonth(month, year);


    await fillEmployersHours(savedScheduler._id, mapMonth, teamId);

    return res.status(201).json({
      message: 'Scheduler został pomyślnie utworzony',
    });
  } catch (error) {
    console.error('Error in createScheduler:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const createMapMonth = async (month, year) => {
  try {
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
    const monthIndex = months.indexOf(month.toLowerCase());

    if (monthIndex === -1) {
      throw new Error('Niepoprawna nazwa miesiąca');
    }

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const mapMonth = [];
    let weekNumber = 1;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay();
      const dayNames = [
        'niedziela',
        'poniedziałek',
        'wtorek',
        'środa',
        'czwartek',
        'piątek',
        'sobota',
      ];
      const nameDayOfWeek = dayNames[dayOfWeek];

    
      if (dayOfWeek === 1 && day !== 1) {
        weekNumber++;
      }

      mapMonth.push({
        dayOfMonth: day,
        nameDayOfWeek,
        numberOfWeek: weekNumber,
        employersHours: [],
      });
    }

    return mapMonth;
  } catch (error) {
    console.error('Error in createMapMonth:', error);
    throw error;
  }
};

const fillEmployersHours = async (schedulerId, mapMonth, teamId) => {
  try {
    const team = await Team.findById(teamId).populate('users');
    if (!team || !team.users.length) {
      throw new Error('Zespół nie został znaleziony lub nie zawiera użytkowników');
    }

    const users = team.users;

    for (const dayInfoData of mapMonth) {
      const dayInfoId = await DayInfoController.createDayInfo(dayInfoData, users);
      await Scheduler.findByIdAndUpdate(
        schedulerId,
        { $push: { map_month: dayInfoId } },
        { new: true }
      );
    }
  } catch (error) {
    console.error('Error in fillEmployersHours:', error);
    throw error;
  }
};


const deleteScheduler = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { month, year, teamId } = req.body;


    month = xss(month);
    year = xss(year);
    teamId = xss(teamId);


    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    if (!validateObjectId(teamId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator teamu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    });

    if (!scheduler) {
      return res.status(404).json({ error: 'Scheduler nie został znaleziony' });
    }

    await Scheduler.deleteOne({ _id: scheduler._id });

    return res.status(200).json({ message: 'Scheduler został usunięty' });
  } catch (error) {
    console.error('Error in deleteScheduler:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getScheduler = async (req, res) => {
  try {
    const user = req.user;
    let { month, year } = req.query;


    month = xss(month);
    year = xss(year);


    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do teamu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    })
      .populate({
        path: 'map_month',
        populate: {
          path: 'employersHours',
          populate: {
            path: 'user',
            select: 'name surname',
          },
        },
      })
      .lean();

    if (!scheduler) {
      return res.status(404).json({ error: 'Scheduler nie został znaleziony' });
    }

    return res.status(200).json({ scheduler });
  } catch (error) {
    console.error('Error in getScheduler:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getSchedulers = async (req, res) => {
  try {
    const user = req.user;

    // Sprawdzenie czy użytkownik jest przypisany do zespołu
    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do zespołu' });
    }

    // Pobierz dostępne grafiki dla zespołu użytkownika
    const schedulers = await Scheduler.find({
      company: user.company,
      team: teamId,
    }).select('month year').lean();

    if (!schedulers.length) {
      return res.status(404).json({ error: 'Brak schedulerów dla tego zespołu' });
    }

    return res.status(200).json({ schedulers });
  } catch (error) {
    console.error('Error in getSchedulers:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};


const editDayInScheduler = async (req, res) => {
  try {
    const user = req.user;
    let { month, year, dayOfMonth, targetUserId, updates } = req.body;


    month = xss(month);
    year = xss(year);
    dayOfMonth = parseInt(xss(dayOfMonth));
    targetUserId = xss(targetUserId);


    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return res.status(400).json({ error: 'Niepoprawny dzień miesiąca' });
    }

    if (!validateObjectId(targetUserId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do teamu' });
    }


    if (user.role === 'user' && targetUserId !== user._id.toString()) {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    }).populate({
      path: 'map_month',
      populate: {
        path: 'employersHours',
      },
    });

    if (!scheduler) {
      return res.status(404).json({ error: 'Scheduler nie został znaleziony' });
    }

    const dayInfo = scheduler.map_month.find((day) => day.dayOfMonth === dayOfMonth);

    if (!dayInfo) {
      return res.status(404).json({ error: 'DayInfo nie został znaleziony' });
    }

    const day = dayInfo.employersHours.find(
      (d) => d.user.toString() === targetUserId
    );

    if (!day) {
      return res.status(404).json({ error: 'Day nie został znaleziony' });
    }


    const allowedUpdates = ['start_hour', 'end_hour', 'prefferedHours', 'availability'];
    for (let key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        day[key] = updates[key];
      }
    }

    await day.save();

    return res.status(200).json({ message: 'Day został zaktualizowany', day });
  } catch (error) {
    console.error('Error in editDayInScheduler:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const confirmAvailabilityUser = async (req, res) => {
  try {
    const user = req.user;
    let { month, year, targetUserId } = req.body;

    month = xss(month);
    year = parseInt(xss(year));
    targetUserId = xss(targetUserId);

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    if (user.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    if (!validateObjectId(targetUserId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do zespołu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    }).populate({
      path: 'map_month',
      populate: {
        path: 'employersHours',
      },
    });

    if (!scheduler) {
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    for (let dayInfo of scheduler.map_month) {
      const day = dayInfo.employersHours.find(
        (d) => d.user.toString() === targetUserId
      );
      if (day) {
        day.managerSubmit = true;
        await day.save();
      }
    }

    return res.status(200).json({ message: 'Dostępność użytkownika została zatwierdzona' });
  } catch (error) {
    console.error('Error in confirmAvailabilityUser:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};



// controllers/SchedulerController.js
const updateAvailability = async (req, res) => {
  try {
    const user = req.user;
    let { month, year, updates } = req.body;

    // Walidacja danych
    month = xss(month);
    year = parseInt(xss(year));

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do zespołu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    }).populate({
      path: 'map_month',
      populate: {
        path: 'employersHours',
      },
    });

    if (!scheduler) {
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    for (let update of updates) {
      const { dayOfMonth, prefferedHours, availability } = update;
      const dayInfo = scheduler.map_month.find((day) => day.dayOfMonth === dayOfMonth);

      if (!dayInfo) {
        continue;
      }

      const day = dayInfo.employersHours.find(
        (d) => d.user.toString() === user._id.toString()
      );

      if (day) {
        day.prefferedHours = prefferedHours;
        day.availability = availability;
        day.userSubmit = true;
        if (user.role === 'manager') {
          day.managerSubmit = true;
        } else {
          day.managerSubmit = false; 
        } 
        await day.save();
      }
    }

    return res.status(200).json({ message: 'Dostępność została zaktualizowana' });
  } catch (error) {
    console.error('Error in updateAvailability:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};


const getStatistic = async (req, res) => {
  try {
    const user = req.user;
    let { month, year } = req.query;


    month = xss(month);
    year = xss(year);


    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do teamu' });
    }

    const scheduler = await Scheduler.findOne({
      company: user.company,
      team: teamId,
      month,
      year,
    })
      .populate({
        path: 'map_month',
        populate: {
          path: 'employersHours',
          populate: {
            path: 'user',
            select: 'name surname',
          },
        },
      })
      .lean();

    if (!scheduler) {
      return res.status(404).json({ error: 'Scheduler nie został znaleziony' });
    }


    return res.status(200).json({ scheduler });
  } catch (error) {
    console.error('Error in getStatistic:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getTeamSchedulerDates = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const { teamId } = req.params;

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator zespołu' });
    }

    const schedulers = await Scheduler.find({ team: teamId, company: req.user.company }).select(
      'month year'
    );

    if (!schedulers.length) {
      return res.status(404).json({ error: 'Brak schedulerów dla podanego zespołu' });
    }

    const result = schedulers.map((scheduler) => ({
      month: scheduler.month,
      year: scheduler.year,
    }));

    return res.status(200).json({ dates: result });
  } catch (error) {
    console.error('Error in getTeamSchedulerDates:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};


module.exports = {
  createScheduler,
  getScheduler,
  deleteScheduler,
  editDayInScheduler,
  confirmAvailabilityUser,
  getStatistic,
  getSchedulers,
  getTeamSchedulerDates,
  updateAvailability
};
