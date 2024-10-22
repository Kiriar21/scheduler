const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const UserController = require('../controllers/UserController');
const CompanyController = require('../controllers/CompanyController');
const TeamController = require('../controllers/TeamController');
const ShiftController = require('../controllers/ShiftController');

// Trasy użytkownika
router.post('/register/admin', UserController.adminRegister);
router.post('/login', UserController.loginUser);
router.post('/register/user', authenticateToken, UserController.userRegister);
router.put('/user/edit', authenticateToken, UserController.editUser);
router.put('/user/password', authenticateToken, UserController.editPassword);
router.put('/user/modify', authenticateToken, UserController.modifyUser);
router.delete('/user/delete/:userId', authenticateToken, UserController.deleteUser);
router.get('/user', authenticateToken, UserController.getUser);
router.get('/users', authenticateToken, UserController.getUsers);

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

module.exports = router;
