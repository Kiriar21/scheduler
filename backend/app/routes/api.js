/**
 * Definicje tras API aplikacji.
 * @module routes/api
 */

const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware'); //Pobieranie middleware dla autentykacji
const UserController = require('../controllers/UserController'); 
const CompanyController = require('../controllers/CompanyController');
const TeamController = require('../controllers/TeamController');
const ShiftController = require('../controllers/ShiftController');
const SchedulerController = require('../controllers/SchedulerController');

// Trasy użytkownika
/**
 * Rejestracja administratora.
 * @name POST /register/admin
 * @param {object} req - Obiekt żądania zawierający email, pwd, name, surname, nip, companyName, confirmPwd
 * @param {object} res - Obiekt odpowiedzi.
 */

router.post('/register/admin', UserController.adminRegister); //Rejestracja admina

/**
 * Logowanie użytkownika.
 * @name POST /login
 * @param {object} req - Obiekt żądania zawierający email i pwd.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.post('/login', UserController.loginUser);  //Logowanie uzytkownikow


/**
 * Rejestracja użytkownika (managera/pracownika) - tylko dla admina.
 * @name POST /register/user
 * @param {object} req - Obiekt żądania zawierający dane użytkownika.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.post('/register/user', authenticateToken(['admin']), UserController.userRegister); //Rejestracja managera i pracownika

/**
 * Edycja danych użytkownika (imię, nazwisko) - dostęp dla user, manager, admin.
 * @name PUT /user/edit
 * @param {object} req - Obiekt żądania zawierający dane do edycji.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/user/edit', authenticateToken(['user', 'manager', 'admin']), UserController.editUser); //Edycja podstawowych danych uzytkownika

/**
 * Edycja hasła użytkownika.
 * @name PUT /user/password
 * @param {object} req - Obiekt żądania zawierający stare i nowe hasło.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/user/password', authenticateToken(['user', 'manager', 'admin']), UserController.editPassword); //Edycja hasła uzytkownika

/**
 * Modyfikacja użytkownika (rola, zespół) przez admina.
 * @name PUT /user/modify
 * @param {object} req - Obiekt żądania zawierający userId, role, teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/user/modify', authenticateToken(['admin']), UserController.modifyUser); //Edycja zespolu uzytkownika i managera przez admina

/**
 * Usuwanie użytkownika przez admina.
 * @name DELETE /user/delete/:userId
 * @param {object} req - Obiekt żądania z parametrem userId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.delete('/user/delete/:userId', authenticateToken(['admin']), UserController.deleteUser); //Usuwanie uzytkownika

/**
 * Pobieranie informacji o aktualnie zalogowanym użytkowniku.
 * @name GET /user
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/user', authenticateToken(['user', 'manager', 'admin']), UserController.getUser); //Pobieranie informacji o uzytkowniku

/**
 * Pobieranie listy użytkowników dla managera lub admina.
 * @name GET /users
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/users', authenticateToken(['manager', 'admin']), UserController.getUsers); //Pobieranie informacji o uzytkownikach w zespole

// Nowe trasy użytkownika

/**
 * Dodawanie nowego pracownika do zespołu (admin).
 * @name POST /user/addToTeam
 * @param {object} req - Obiekt żądania zawierający userId i teamName.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.post('/user/addToTeam', authenticateToken(['admin']), UserController.addUserToTeam); //Dodawanie nowego pracownika do zespolu

/**
 * Edycja zespołu pracownika (admin).
 * @name PUT /user/editTeam
 * @param {object} req - Obiekt żądania zawierający userId, newTeamName.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/user/editTeam', authenticateToken(['admin']), UserController.editUserTeam); //Edycja zespolu pracownika

// Trasy firmy

/**
 * Pobieranie informacji o firmie użytkownika.
 * @name GET /company/info
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/company/info', authenticateToken(['user', 'manager', 'admin']), CompanyController.getInfoCompany); //Pobieranie informacji o firmie uzytkownika

/**
 * Edycja danych firmy (admin).
 * @name PUT /company/edit
 * @param {object} req - Obiekt żądania zawierający nip i name firmy.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/company/edit', authenticateToken(['admin']), CompanyController.editInfoCompany); //Edycja danych firmy uzytkownika 

// Trasy teamu

/**
 * Pobieranie użytkowników zespołu (manager).
 * @name GET /team/users
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/team/users', authenticateToken(['manager']), TeamController.getTeamUsers); //Pobieranie wszystkich pracownikow i managerow danego teamu

/**
 * Dodawanie nowego zespołu (admin).
 * @name POST /team/add
 * @param {object} req - Obiekt żądania zawierający nazwę zespołu.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.post('/team/add', authenticateToken(['admin']), TeamController.teamAdd); //Dodawanie nowego teamu 

/**
 * Pobieranie informacji o wybranym zespole.
 * @name GET /team/:teamId
 * @param {object} req - Obiekt żądania z parametrem teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */

router.get('/team/:teamId', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeam); //Pobieranie informacji o wybranym zespole

/**
 * Pobieranie wszystkich zespołów.
 * @name GET /teams
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/teams', authenticateToken(['user', 'manager', 'admin']), TeamController.getTeams); //Pobieranie wszystkich zespolow


/**
 * Edycja zespołu (admin).
 * @name PUT /team/edit/:teamId
 * @param {object} req - Obiekt żądania z parametrem teamId i nową nazwą.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/team/edit/:teamId', authenticateToken(['admin']), TeamController.editTeam); //Edycja danego zespolu 

/**
 * Usuwanie zespołu (admin).
 * @name DELETE /team/delete/:teamId
 * @param {object} req - Obiekt żądania z parametrem teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.delete('/team/delete/:teamId', authenticateToken(['admin']), TeamController.deleteTeam); //Usuwanie danego zespolu 


// Trasy shiftu

/**
 * Pobieranie informacji o zmianie (shift).
 * @name GET /shift/:shiftId
 * @param {object} req - Obiekt żądania z parametrem shiftId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/shift/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.getInfoShift); //Pobieranie info o zmianie

/**
 * Edycja zmiany (shift).
 * @name PUT /shift/edit/:shiftId
 * @param {object} req - Obiekt żądania z parametrem shiftId i danymi do edycji.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/shift/edit/:shiftId', authenticateToken(['user', 'manager', 'admin']), ShiftController.editShift); //Edycja informacji w zmianie

// Trasy schedulerów

/**
 * Tworzenie nowego grafiku (manager, admin).
 * @name POST /scheduler/create
 * @param {object} req - Obiekt żądania z month, year, teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.post('/scheduler/create', authenticateToken(['manager', 'admin']), SchedulerController.createScheduler); //Tworzenie nowego grafiku

/**
 * Pobieranie miesięcznego raportu użytkownika (manager, admin).
 * @name GET /scheduler/userMonthlyReport
 * @param {object} req - Obiekt żądania z userId, month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler/userMonthlyReport', authenticateToken(['manager', 'admin']), SchedulerController.getUserMonthlyReport); //Pobieranie miesięcznego raportu z grafiku 

/**
 * Pobieranie pliku raportu miesięcznego użytkownika (manager, admin).
 * @name GET /scheduler/downloadUserMonthlyReport
 * @param {object} req - Obiekt żądania z userId, month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler/downloadUserMonthlyReport', authenticateToken(['manager', 'admin']), SchedulerController.downloadUserMonthlyReport); //Pobieranie pliku raportu z miesięcznego grafiku

/**
 * Pobieranie miesięcznego podsumowania wszystkich użytkowników w zespole (manager, admin).
 * @name GET /scheduler/monthlySummary
 * @param {object} req - Obiekt żądania z month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler/monthlySummary', authenticateToken(['manager', 'admin']), SchedulerController.getMonthlySummaryForAllUsers); //Pobieranie informacji podsumowania miesiaca     

/**
 * Pobieranie pliku z miesięcznym podsumowaniem (manager, admin).
 * @name GET /scheduler/downloadMonthlySummary
 * @param {object} req - Obiekt żądania z month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler/downloadMonthlySummary', authenticateToken(['manager', 'admin']), SchedulerController.downloadMonthlySummaryForAllUsers); //Pobieranie pliku z podsumowaniem miesiąca 


/**
 * Pobieranie dat dostępnych grafików dla zespołu (admin).
 * @name GET /schedulers/:teamId/dates
 * @param {object} req - Obiekt żądania z parametrem teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/schedulers/:teamId/dates', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getTeamSchedulerDates); //Pobieranie informacji jakie grafiki są stworzone dla danego zespołu

/**
 * Pobieranie wszystkich grafików dla zespołu (user, manager, admin).
 * @name GET /schedulers
 * @param {object} req - Obiekt żądania.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/schedulers', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getSchedulers); //Pobieranie wszystkich grafików dla danego zespołu

/**
 * Pobieranie jednego grafiku (user, manager, admin).
 * @name GET /scheduler
 * @param {object} req - Obiekt żądania z month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getScheduler); //Pobieranie jednego grafiku dla danego zespołu

/**
 * Usuwanie grafiku (admin).
 * @name DELETE /scheduler/delete
 * @param {object} req - Obiekt żądania z month, year, teamId.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.delete('/scheduler/delete', authenticateToken(['admin']), SchedulerController.deleteScheduler); //Usuwanie grafiku dla danego zespołu z określonym rokiem i miesiącem

/**
 * Edycja dnia w grafiku (user, manager, admin).
 * @name PUT /scheduler/editDay
 * @param {object} req - Obiekt żądania z dayOfMonth, targetUserId, updates.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/scheduler/editDay', authenticateToken(['user', 'manager', 'admin']), SchedulerController.editDayInScheduler); //Edycja danego dnia użytkownika

/**
 * Edycja dostępności (user, manager).
 * @name PUT /scheduler/updateAvailability
 * @param {object} req - Obiekt żądania z updates (dni i preferowane godziny).
 * @param {object} res - Obiekt odpowiedzi.
 */
router.put('/scheduler/updateAvailability', authenticateToken(['user', 'manager']), SchedulerController.updateAvailability); //Edycja dostępności przez pracownika

/**
 * Potwierdzenie dostępności przez managera lub admina.
 * @name POST /scheduler/confirmAvailability
 * @param {object} req - Obiekt żądania z month, year, targetUserId.
 * @param {object} res - Obiekt odpowiedzi.
 */

router.post('/scheduler/confirmAvailability', authenticateToken(['user', 'manager', 'admin']), SchedulerController.confirmAvailabilityUser); //Potwierdzenie dostępności przez pracownika

/**
 * Pobieranie statystyk z danego miesiąca (user, manager, admin).
 * @name GET /scheduler/statistics
 * @param {object} req - Obiekt żądania z month, year.
 * @param {object} res - Obiekt odpowiedzi.
 */
router.get('/scheduler/statistics', authenticateToken(['user', 'manager', 'admin']), SchedulerController.getStatistic); //Pobieranie statystyk z danego miesiąca 


module.exports = router;
