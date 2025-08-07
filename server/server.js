const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const connectToDatabase = require("./db/connect-to-database");
const generateConnectionUrl = require("./utils/connection-url-generator");

dotenv.config();
connectToDatabase();
const app = express();
const port = process.env.PORT || 1337;
const connection_string = generateConnectionUrl(60);

app.use(express.json({ limit: "50mb", extended: true })); // Specifying the server to use the json function of the EXPRESS framework
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cors()); // Specifying the server to use the cors module
app.use(helmet()); // Specifying the server to use the helmet module
app.use(morgan("dev")); // Specifying the server to use the morgan module

const server = http.createServer(app);

server.listen(port, () => {
    console.log("X--- YGG server succesfully running ---X");
    console.log(`X--- YGG server connection key: ${connection_string} ---X`);
    console.log(`X--- YGG server connection port: ${port} ---X`);
});