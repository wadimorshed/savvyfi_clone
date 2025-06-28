//External dependencies
const express = require("express");
const cors = require("cors");
const sqlite = require("sqlite3");

//Express
const app = express();

//Middleware
app.use(cors);
app.use(express.json({limit: '4mb'}));

