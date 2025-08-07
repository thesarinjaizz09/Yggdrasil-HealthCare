const dotenv = require('dotenv');
const mongoose = require('mongoose');
const generateConnectionUrl = require("../utils/connection-url-generator")

dotenv.config()

const mongoURI = process.env.YGG_DATABASE_URI;
const connection_string = generateConnectionUrl(58)


const connectToMongoDB = async () => {
    mongoose
        .connect(mongoURI)
        .then(() => {
            console.log("X--- YGG database connected succesfully ---X")
            console.log(`X--- YGG database connection url: ${connection_string} ---X`)
        })
        .catch(err => console.log(err));
}


// Exporting the function to be used by other modules

module.exports = connectToMongoDB; // exporting the connectToMongoDB function

// Db server codebase completed