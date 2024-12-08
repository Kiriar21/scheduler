/**
 * Konfiguruje zmienne środowiskowe z pliku .env i eksportuje je.
 * @module config
 */

require('dotenv').config();

//Exportowanie zmiennych środowiskowych do aplikacji
module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    FRONTEND_URL: process.env.FRONTEND_URL,
    SESSION_KEY_SECRET: process.env.SESSION_KEY_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
}
