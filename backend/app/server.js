/**
 * Inicjuje aplikację Express, ustawia middleware, trasy oraz uruchamia serwer.
 * @file
 */

//Główny kod serwera backendu
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');
const session = require('express-session');
const connection = require('./db/mongoose_connection');
const dotenv = require('dotenv');
const { PORT, FRONTEND_URL, SESSION_KEY_SECRET } = require('./config'); // Pobieranie zmiennych z configu
const morgan = require('morgan');

/**
 * Aplikacja Express obsługująca backend systemu.
 * @type {object}
 */

const app = express();

/**
 * Opcje CORS dla połączenia z frontendem.
 * @type {object}
 */

const corsOptions = {
  origin: FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"]
      }
  }
}));

//Sesja ustawiona na rok działania

app.use(session({
  secret: SESSION_KEY_SECRET,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 }, 
  resave: false,
}));

app.use(morgan('tiny'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Zbyt wiele zapytań z tego IP, spróbuj ponownie za 15 minut',
});

app.use(limiter);

app.use(xssClean());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

//Wywołanie endpointów
app.use(apiRoutes);


/**
 * Uruchamia serwer i nasłuchuje na określonym porcie.
 * @param {number} PORT - Port, na którym serwer będzie nasłuchiwał.
 */

//Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
