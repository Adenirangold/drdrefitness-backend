require("dotenv").config();
const express = require("express");

const connectDatabase = require("./config/database");

const app = express();

connectDatabase();
app.listen(process.env.PORT);
