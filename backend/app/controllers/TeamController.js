const Team = require('../db/models/Team');
const Company = require('../db/models/Company');
const { defaultShift } = require('./ShiftController');
const { validateName } = require('../utils/validation');

const teamAdd = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Brak dostępu' });
    }

    let { name } = req.body;

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Nazwa teamu musi mieć co najmniej 3 znaki' });
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
    const teams = await Team.find({ company: req.user.company }).select('name');

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

    if (!validateName(name)) {
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

    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return res.status(404).json({ error: 'Team nie został znaleziony' });
    }

    await Company.findByIdAndUpdate(req.user.company, { $pull: { teams: teamId } });

    return res.status(200).json({ message: 'Team został usunięty' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = {
  teamAdd,
  getTeam,
  getTeams,
  editTeam,
  deleteTeam,
};
