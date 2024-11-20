const Team = require('../db/models/Team');
const Company = require('../db/models/Company');
const Scheduler = require('../db/models/Scheduler');
const { defaultShift } = require('./ShiftController');
const { validateNameTeam } = require('../utils/validation');

const teamAdd = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { name } = req.body;



    if (!validateNameTeam(name)) {
      return res.status(400).json({ error: 'Nazwa teamu musi mieć co najmniej 2 znaki' });
    }

    const existingTeam = await Team.findOne({ name, company: req.user.company });
    if (existingTeam) {
      return res.status(404).json({ error: 'Nazwa teamu jest już zajęta' });
    }


    const shift = defaultShift();

    const newTeam = new Team({
      name,
      company: req.user.company,
      shift,
    });

    const savedTeam = await newTeam.save();

    await Company.findByIdAndUpdate(req.user.company, { $push: { teams: savedTeam._id } });

    return res.status(201).json({ message: 'Team został dodany', team: savedTeam });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId).select('name');

    if (!team || team.company.toString() !== req.user.company.toString()) {
      return res.status(404).json({ error: 'Team nie został znaleziony' });
    }

    return res.status(200).json({ team });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ company: req.user.company })
      .populate('users', 'name surname email role') 
      .select('name users'); 


    return res.status(200).json({ teams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const editTeam = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const teamId = req.params.teamId;
    let { name } = req.body;

    if (!validateNameTeam(name)) {
      return res.status(400).json({ error: 'Nazwa teamu musi mieć co najmniej 3 znaki' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(teamId, { name }, { new: true });

    return res.status(200).json({ message: 'Team został zaktualizowany', team: updatedTeam });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const teamId = req.params.teamId;

    // Znajdź zespół, aby sprawdzić jego powiązania
    const teamToDelete = await Team.findById(teamId);

    if (!teamToDelete) {
      return res.status(404).json({ error: 'Team nie został znaleziony' });
    }

    // Sprawdź, czy zespół jest przypisany do administratora firmy
    const company = await Company.findById(req.user.company).populate('admin');

    if (company.admin && company.admin.team && company.admin.team.toString() === teamId) {
      return res.status(400).json({
        error: 'Nie można usunąć zespołu administratora firmy.',
      });
    }

    // Usuń zespół
    const deletedTeam = await Team.findByIdAndDelete(teamId);

    // Usuń team z listy zespołów firmy
    await Company.findByIdAndUpdate(req.user.company, { $pull: { teams: teamId } });

    // Usuń wszystkie grafiki powiązane z tym zespołem
    const deletedSchedulers = await Scheduler.deleteMany({ team: teamId, company: req.user.company });

    return res.status(200).json({
      message: `Team został usunięty, a powiązane ${deletedSchedulers.deletedCount} grafik(i) zostały również usunięte.`,
    });
  } catch (error) {
    console.error('Error in deleteTeam:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};


const getAllTeamNames = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const teams = await Team.find({ company: req.user.company }).select('name');

    return res.status(200).json({ teams });
  } catch (error) {
    console.error('Error in getAllTeamNames:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};
const getTeamUsers = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== 'manager') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    const team = await Team.findById(user.team).populate('users', 'name surname _id');

    if (!team) {
      return res.status(404).json({ error: 'Zespół nie został znaleziony' });
    }

    return res.status(200).json({ users: team.users });
  } catch (error) {
    console.error('Error in getTeamUsers:', error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};


module.exports = {
  teamAdd,
  getTeam,
  getTeams,
  editTeam,
  deleteTeam,
  getAllTeamNames,
  getTeamUsers,
};
