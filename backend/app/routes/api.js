const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware'); //Pobieranie middleware dla autentykacji
const UserController = require('../controllers/UserController'); 
const CompanyController = require('../controllers/CompanyController');
const TeamController = require('../controllers/TeamController');
const ShiftController = require('../controllers/ShiftController');
const SchedulerController = require('../controllers/SchedulerController');

// Trasy użytkownika
router.post('/register/admin', UserController.adminRegister); //Rejestracja admina
router.post('/login', UserController.loginUser);  //Logowanie uzytkownikow
router.post('/register/user', authenticateToken(['admin']), UserController.userRegister); //Rejestracja managera i pracownika
router.put('/user/edit', authenticateToken(['user', 'manager', 'admin']), UserController.editUser); //Edycja podstawowych danych uzytkownika
router.put('/user/password', authenticateToken(['user', 'manager', 'admin']), UserController.editPassword); //Edycja hasła uzytkownika
router.put('/user/modify', authenticateToken(['admin']), UserController.modifyUser); //Edycja zespolu uzytkownika i managera przez admina
router.delete('/user/delete/:userId', authenticateToken(['admin']), UserController.deleteUser); //Usuwanie uzytkownika
router.get('/user', authenticateToken(['user', 'manager', 'admin']), UserController.getUser); //Pobieranie informacji o uzytkowniku
router.get('/users', authenticateToken(['manager', 'admin']), UserController.getUsers); //Pobieranie informacji o uzytkownikach w zespole

// Nowe trasy użytkownika
router.post('/user/addToTeam', authenticateToken(['admin']), UserController.addUserToTeam); //Dodawanie nowego pracownika do zespolu
router.put('/user/editTeam', authenticateToken(['admin']), UserController.editUserTeam); //Edycja zespolu pracownika

// Trasy firmy
router.get('/company/info', authenticateToken(['user', 'manager', 'admin']), CompanyController.getInfoCompany); //Pobieranie informacji o firmie uzytkownika
router.put('/company/edit', authenticateToken(['admin']), CompanyController.editInfoCompany); //Edycja danych firmy uzytkownika 

// Trasy teamu
router.get('/team/users', authenticateToken(['manager']), TeamController.getTeamUsers); //Pobieranie wszystkich pracownikow i managerow danego teamu
router.post('/team/add', authenticateToken(['admin']), TeamController.teamAdd); //Dodawanie nowego teamu 
router.get('/team/:teamId', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeam); //Pobieranie informacji o wybranym zespole
router.get('/teams', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeams); //Pobieranie wszystkich zespolow
router.put('/team/edit/:teamId', authenticateToken(['admin']), TeamController.editTeam); //Edycja danego zespolu 
router.delete('/team/delete/:teamId', authenticateToken(['admin']), TeamController.deleteTeam); //Usuwanie danego zespolu 


// Trasy shiftu
router.get('/shift/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.getInfoShift); //Pobieranie info o zmianie
router.put('/shift/edit/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.editShift); //Edycja informacji w zmianie

// Trasy schedulerów
router.post('/scheduler/create', authenticateToken(['manager', 'admin']), SchedulerController.createScheduler); //Tworzenie nowego grafiku

router.get('/scheduler/userMonthlyReport', authenticateToken(['manager', 'admin']), SchedulerController.getUserMonthlyReport); //Pobieranie miesięcznego raportu z grafiku 
router.get('/scheduler/downloadUserMonthlyReport', authenticateToken(['manager', 'admin']), SchedulerController.downloadUserMonthlyReport); //Pobieranie pliku raportu z miesięcznego grafiku
router.get('/scheduler/monthlySummary', authenticateToken(['manager', 'admin']), SchedulerController.getMonthlySummaryForAllUsers); //Pobieranie informacji podsumowania miesiaca     
router.get('/scheduler/downloadMonthlySummary', authenticateToken(['manager', 'admin']), SchedulerController.downloadMonthlySummaryForAllUsers); //Pobieranie pliku z podsumowaniem miesiąca 

router.get('/schedulers/:teamId/dates', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getTeamSchedulerDates); //Pobieranie informacji jakie grafiki są stworzone dla danego zespołu
router.get('/schedulers', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getSchedulers); //Pobieranie wszystkich grafików dla danego zespołu
router.get('/scheduler', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getScheduler); //Pobieranie jednego grafiku dla danego zespołu
router.delete('/scheduler/delete', authenticateToken(['admin']), SchedulerController.deleteScheduler); //Usuwanie grafiku dla danego zespołu z określonym rokiem i miesiącem
router.put('/scheduler/editDay', authenticateToken(['user', 'manager', 'admin']), SchedulerController.editDayInScheduler); //Edycja danego dnia użytkownika
router.put('/scheduler/updateAvailability', authenticateToken(['user', 'manager']), SchedulerController.updateAvailability); //Edycja dostępności przez pracownika
router.post('/scheduler/confirmAvailability', authenticateToken(['user', 'manager', 'admin']), SchedulerController.confirmAvailabilityUser); //Potwierdzenie dostępności przez pracownika
router.get('/scheduler/statistics', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getStatistic); //Pobieranie statystyk z danego miesiąca 


module.exports = router;
