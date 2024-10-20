const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

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

connection();