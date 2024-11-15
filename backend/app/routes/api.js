const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/UserController');
const CompanyController = require('../controllers/CompanyController');
const TeamController = require('../controllers/TeamController');
const ShiftController = require('../controllers/ShiftController');
const SchedulerController = require('../controllers/SchedulerController');

// Trasy użytkownika
router.post('/register/admin', UserController.adminRegister); // use
router.post('/login', UserController.loginUser); // use
router.post('/register/user', authenticateToken, UserController.userRegister);
router.put('/user/edit', authenticateToken, UserController.editUser);
router.put('/user/password', authenticateToken, UserController.editPassword);
router.put('/user/modify', authenticateToken, UserController.modifyUser);
router.delete('/user/delete/:userId', authenticateToken, UserController.deleteUser);
router.get('/user', authenticateToken, UserController.getUser);
router.get('/users', authenticateToken, UserController.getUsers);

// Nowe trasy użytkownika
router.post('/user/addToTeam', authenticateToken, UserController.addUserToTeam);
router.put('/user/editTeam', authenticateToken, UserController.editUserTeam);

// Trasy firmy
router.get('/company', authenticateToken, CompanyController.getInfoCompany);
router.put('/company/edit', authenticateToken, CompanyController.editInfoCompany);

// Trasy teamu
router.post('/team/add', authenticateToken, TeamController.teamAdd);
router.get('/team/:teamId', authenticateToken, TeamController.getTeam);
router.get('/teams', authenticateToken, TeamController.getTeams);
router.put('/team/edit/:teamId', authenticateToken, TeamController.editTeam);
router.delete('/team/delete/:teamId', authenticateToken, TeamController.deleteTeam);

// Trasy shiftu
router.get('/shift/:shiftId', authenticateToken, ShiftController.getInfoShift);
router.put('/shift/edit/:shiftId', authenticateToken, ShiftController.editShift);

// Trasy schedulerów
router.post('/scheduler/create', authenticateToken, SchedulerController.createScheduler);
router.get('/schedulers', authenticateToken, SchedulerController.getSchedulers);
router.get('/scheduler', authenticateToken, SchedulerController.getScheduler);
router.delete('/scheduler/delete', authenticateToken, SchedulerController.deleteScheduler);
router.put('/scheduler/editDay', authenticateToken, SchedulerController.editDayInScheduler);
router.post('/scheduler/confirmAvailability', authenticateToken, SchedulerController.confirmAvailabilityUser);
router.get('/scheduler/statistics', authenticateToken, SchedulerController.getStatistic);

module.exports = router;
