

const Scheduler = require('../db/models/Scheduler');
const User = require('../db/models/User');
const Team = require('../db/models/Team');
const DayInfoController = require('./DayInfoController');
const mongoose = require('mongoose');
const xss = require('xss');
const ExcelJS = require('exceljs');
const {
  validateMonthName,
  validateYear,
  validateObjectId,
} = require('../utils/validation');


//Tworzenie nowego grafiku
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

    if(team.users.length <= 0){
      return res.status(404).json({ error: 'Team nie posiada pracowników. Aby utworzyć scheduler potrzeba dodać minimum jednego pracownika do zespołu.' });
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

//Tworzenie mapy miesiąca dla danego grafiku
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

//Wypełnianie grafiku dla danego miesiąca 
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

//Usuwanie grafiku dla danego zespołu z określonym rokiem i miesiącem
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

//Pobieranie jednego grafiku dla danego zespołu
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

//Pobieranie wszystkich grafików dla danego zespołu
const getSchedulers = async (req, res) => {
  try {
    const user = req.user;

    // Sprawdzenie czy użytkownik jest przypisany do zespołu
    const teamId = user.team;
    if (!teamId) {
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do zespołu' });
    }

    // Pobieranie dostępnych grafików dla zespołu użytkownika
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

//Edycja danego dnia użytkownika
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

//Potwierdzenie dostępności przez pracownika
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

//Edycja dostępności przez pracownika
const updateAvailability = async (req, res) => {
  try {
    const user = req.user;
    let { month, year, updates } = req.body;

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

//Pobieranie statystyk z danego miesiąca 
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
      return res.status(400).json({ error: 'Użytkownik nie jest przypisany do zespołu' });
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
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    // Compute statistics
    const statistics = {};
    let totalTeamHours = 0;

    scheduler.map_month.forEach((dayInfo) => {
      dayInfo.employersHours.forEach((eh) => {
        if (eh.user) {
          const userId = eh.user._id.toString();
          const hoursWorked = eh.end_hour - eh.start_hour;

          if (!statistics[userId]) {
            statistics[userId] = {
              userId,
              name: eh.user.name,
              surname: eh.user.surname,
              totalHours: 0,
            };
          }
          statistics[userId].totalHours += hoursWorked;
          totalTeamHours += hoursWorked;
        }
      });
    });

    return res.status(200).json({
      currentUserId: user._id.toString(),
      statistics: Object.values(statistics),
      totalTeamHours,
    });
  } catch (error) {
    console.error('Error in getStatistic:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

//Pobieranie informacji jakie grafiki są stworzone dla danego zespołu
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

//Pobieranie miesięcznego raportu z grafiku 
const getUserMonthlyReport = async (req, res) => {
  try {
    const manager = req.user;

    if (manager.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { userId, month, year } = req.query;

    userId = xss(userId);
    month = xss(month);
    year = xss(year);

    if (!validateObjectId(userId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    // Check if the user is in the manager's team
    const user = await User.findOne({
      _id: userId,
      team: manager.team,
      company: manager.company,
    }).select('name surname');

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony w twoim zespole' });
    }

    const scheduler = await Scheduler.findOne({
      company: manager.company,
      team: manager.team,
      month,
      year,
    })
      .populate({
        path: 'map_month',
        populate: {
          path: 'employersHours',
          match: { user: userId },
        },
      })
      .lean();

    if (!scheduler) {
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    // Prepare report data
    const reportData = [];
    let totalHours = 0;

    scheduler.map_month.forEach((dayInfo) => {
      if (dayInfo.employersHours.length > 0) {
        const day = dayInfo.employersHours[0];
        const hoursWorked = day.end_hour - day.start_hour;
        totalHours += hoursWorked;
        reportData.push({
          dayOfMonth: dayInfo.dayOfMonth,
          nameDayOfWeek: dayInfo.nameDayOfWeek,
          start_hour: day.start_hour,
          end_hour: day.end_hour,
          hoursWorked,
          prefferedHours: day.prefferedHours,
          availability: day.availability,
        });
      }
    });

    return res.status(200).json({
      user: { name: user.name, surname: user.surname },
      reportData,
      totalHours,
    });
  } catch (error) {
    console.error('Error in getUserMonthlyReport:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

//Pobieranie pliku raportu z miesięcznego grafiku
const downloadUserMonthlyReport = async (req, res) => {
  try {
    const manager = req.user;

    if (manager.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { userId, month, year } = req.query;

    userId = xss(userId);
    month = xss(month);
    year = xss(year);

    if (!validateObjectId(userId)) {
      return res.status(400).json({ error: 'Niepoprawny identyfikator użytkownika' });
    }

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    // Check if the user is in the manager's team
    const user = await User.findOne({
      _id: userId,
      team: manager.team,
      company: manager.company,
    }).select('name surname');

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony w twoim zespole' });
    }

    const scheduler = await Scheduler.findOne({
      company: manager.company,
      team: manager.team,
      month,
      year,
    })
      .populate({
        path: 'map_month',
        populate: {
          path: 'employersHours',
          match: { user: userId },
        },
      })
      .lean();

    if (!scheduler) {
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    // Prepare report data
    const reportData = [];
    let totalHours = 0;

    scheduler.map_month.forEach((dayInfo) => {
      if (dayInfo.employersHours.length > 0) {
        const day = dayInfo.employersHours[0];
        const hoursWorked = day.end_hour - day.start_hour;
        totalHours += hoursWorked;
        reportData.push({
          dayOfMonth: dayInfo.dayOfMonth,
          nameDayOfWeek: dayInfo.nameDayOfWeek,
          start_hour: day.start_hour,
          end_hour: day.end_hour,
          hoursWorked,
          prefferedHours: day.prefferedHours,
          availability: day.availability,
        });
      }
    });

    const regularHours = totalHours > 160 ? 160 : totalHours;
    const overtimeHours = totalHours > 160 ? totalHours - 160 : 0;

    // Prepare Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Raport');

    // Add headers
    worksheet.columns = [
      { header: 'Dzień miesiąca', key: 'dayOfMonth', width: 15 },
      { header: 'Dzień tygodnia', key: 'nameDayOfWeek', width: 20 },
      { header: 'Godzina rozpoczęcia', key: 'start_hour', width: 20 },
      { header: 'Godzina zakończenia', key: 'end_hour', width: 20 },
      { header: 'Przepracowane godziny', key: 'hoursWorked', width: 20 },
      { header: 'Preferowane godziny', key: 'prefferedHours', width: 25 },
      { header: 'Dostępność', key: 'availability', width: 15 },
    ];

    // Add data
    reportData.forEach((data) => {
      worksheet.addRow(data);
    });

    // Add total hours at the end
    worksheet.addRow({});
    worksheet.addRow({ dayOfMonth: 'Regularne godziny:', hoursWorked: regularHours });
    worksheet.addRow({ dayOfMonth: 'Nadgodziny:', hoursWorked: overtimeHours });

    try {
      const sanitizedFileName = sanitizeFileName(`Raport_${user.name}_${user.surname}_${month}_${year}.xlsx`);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedFileName}"`
      );
    
      // Zapis pliku do odpowiedzi
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Błąd podczas generowania pliku Excel:', error);
      res.status(500).json({ error: 'Błąd serwera' });
    }
    
  } catch (error) {
    console.error('Error in downloadUserMonthlyReport:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

//Pobieranie informacji podsumowania miesiaca 
const getMonthlySummaryForAllUsers = async (req, res) => {
  try {
    const manager = req.user;

    if (manager.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { month, year } = req.query;

    month = xss(month);
    year = xss(year);

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    const scheduler = await Scheduler.findOne({
      company: manager.company,
      team: manager.team,
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
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    // Calculate total hours worked per user
    const userHoursMap = {};

    scheduler.map_month.forEach((dayInfo) => {
      dayInfo.employersHours.forEach((day) => {
        const userId = day.user._id.toString();
        const hoursWorked = day.end_hour - day.start_hour;

        if (!userHoursMap[userId]) {
          userHoursMap[userId] = {
            user: {
              _id: day.user._id,
              name: day.user.name,
              surname: day.user.surname,
            },
            totalHoursWorked: 0,
            overtimeHours: 0,
          };
        }
        userHoursMap[userId].totalHoursWorked += hoursWorked;
      });
    });

    Object.values(userHoursMap).forEach((data) => {
      if (data.totalHoursWorked > 160) {
        data.overtimeHours = data.totalHoursWorked - 160;
        data.totalHoursWorked = 160; 
      }
    });

    console.log("Kaszanka")
    console.log(userHoursMap)

    const summaryData = Object.values(userHoursMap);

    return res.status(200).json({
      month,
      year,
      summaryData,
    });
  } catch (error) {
    console.error('Error in getMonthlySummaryForAllUsers:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};



//Pobieranie pliku z podsumowaniem miesiąca 
const downloadMonthlySummaryForAllUsers = async (req, res) => {
  try {
    const manager = req.user;

    if (manager.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { month, year } = req.query;

    month = xss(month);
    year = xss(year);

    if (!validateMonthName(month)) {
      return res.status(400).json({ error: 'Niepoprawna nazwa miesiąca' });
    }

    if (!validateYear(year)) {
      return res.status(400).json({ error: 'Niepoprawny rok' });
    }

    const scheduler = await Scheduler.findOne({
      company: manager.company,
      team: manager.team,
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
      return res.status(404).json({ error: 'Grafik nie został znaleziony' });
    }

    // Calculate total hours worked per user
    const userHoursMap = {};

    scheduler.map_month.forEach((dayInfo) => {
      dayInfo.employersHours.forEach((day) => {
        const userId = day.user._id.toString();
        const hoursWorked = day.end_hour - day.start_hour;

        if (!userHoursMap[userId]) {
          userHoursMap[userId] = {
            name: day.user.name,
            surname: day.user.surname,
            totalHoursWorked: 0,
            overtimeHours: 0,
          };
        }
        userHoursMap[userId].totalHoursWorked += hoursWorked;
      });
    });

    Object.values(userHoursMap).forEach((data) => {
      if (data.totalHoursWorked > 160) {
        data.overtimeHours = data.totalHoursWorked - 160;
        data.totalHoursWorked = 160;
      }
    });

    const summaryData = Object.values(userHoursMap);

    // Generate Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Podsumowanie');

    // Add headers
    worksheet.columns = [
      { header: 'Imię', key: 'name', width: 20 },
      { header: 'Nazwisko', key: 'surname', width: 20 },
      { header: 'Ilość godzin', key: 'totalHoursWorked', width: 15 },
      { header: 'Nadgodziny', key: 'overtimeHours', width: 15 },
    ];

    // Add data
    summaryData.forEach((data) => {
      worksheet.addRow(data);
    });

    try {
      const sanitizedFileName = sanitizeFileName(`Podsumowanie_${month}_${year}.xlsx`);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedFileName}"`
      );
    
      // Zapis pliku do odpowiedzi
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Błąd podczas generowania pliku Excel:', error);
      res.status(500).json({ error: 'Błąd serwera' });
    }
    

  } catch (error) {
    console.error('Error in downloadMonthlySummaryForAllUsers:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD') // Normalizacja Unicode
    .replace(/[\u0300-\u036f]/g, '') // Usuń znaki diakrytyczne
    .replace(/[^a-zA-Z0-9-_]/g, '_'); // Zamień inne znaki na '_'
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
  updateAvailability,
  getUserMonthlyReport,
  downloadUserMonthlyReport,
  getMonthlySummaryForAllUsers,
  downloadMonthlySummaryForAllUsers,
};
