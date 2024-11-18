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
router.post('/register/user', authenticateToken(['admin']), UserController.userRegister);
router.put('/user/edit', authenticateToken(['user', 'manager', 'admin']), UserController.editUser);
router.put('/user/password', authenticateToken(['user', 'manager', 'admin']), UserController.editPassword);
router.put('/user/modify', authenticateToken(['admin']), UserController.modifyUser);
router.delete('/user/delete/:userId', authenticateToken(['admin']), UserController.deleteUser);
router.get('/user', authenticateToken(['user', 'manager', 'admin']), UserController.getUser);
router.get('/users', authenticateToken(['manager', 'admin']), UserController.getUsers);

// Nowe trasy użytkownika
router.post('/user/addToTeam', authenticateToken(['admin']), UserController.addUserToTeam);
router.put('/user/editTeam', authenticateToken(['admin']), UserController.editUserTeam);

// Trasy firmy
router.get('/company', authenticateToken(['user', 'manager', 'admin']), CompanyController.getInfoCompany);
router.put('/company/edit', authenticateToken(['admin']), CompanyController.editInfoCompany);

// Trasy teamu
router.post('/team/add', authenticateToken(['admin']), TeamController.teamAdd);
router.get('/team/:teamId', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeam);
router.get('/teams', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeams);
router.put('/team/edit/:teamId', authenticateToken(['admin']), TeamController.editTeam);
router.delete('/team/delete/:teamId', authenticateToken(['admin']), TeamController.deleteTeam);

// Trasy shiftu
router.get('/shift/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.getInfoShift);
router.put('/shift/edit/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.editShift);

// Trasy schedulerów
router.post('/scheduler/create', authenticateToken(['manager', 'admin']), SchedulerController.createScheduler);
router.get('/schedulers', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getSchedulers);
router.get('/scheduler', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getScheduler);
router.delete('/scheduler/delete', authenticateToken(['admin']), SchedulerController.deleteScheduler);
router.put('/scheduler/editDay', authenticateToken(['user', 'manager', 'admin']), SchedulerController.editDayInScheduler);
router.post('/scheduler/confirmAvailability', authenticateToken(['user', 'manager', 'admin']), SchedulerController.confirmAvailabilityUser);
router.get('/scheduler/statistics', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getStatistic);

module.exports = router;
