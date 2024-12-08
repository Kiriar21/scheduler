/**
 * Połączenie z bazą MongoDB.
 * @module db/mongoose_connection
 * @async
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

//Połączenie z bazą danych 
async function connection() {
    try{
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }).then(() => {
            console.log('Połączono z MongoDB');
          }).catch(err => {
            console.error('Błąd połączenia z MongoDB:', err.message);
          });   
    } catch(err) {
        console.log("Błąd z połączeniem bazy danych.");
        console.log("Błąd: ", e);
    }
}
/**
 * Nawiązuje połączenie z bazą danych MongoDB.
 * @async
 * @function connection
 * @returns {Promise<void>}
 */

connection();