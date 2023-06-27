const express = require("express");
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const cors = require("cors");
require('dotenv').config();

// const FormData = require('form-data');
// const fs = require('fs');
// const fetch = require('node-fetch');

const app = express();

const { Api,TelegramClient, utils } = require("telegram");
const { StringSession,StoreSession } = require("telegram/sessions");

// const apiId = process.env.API_ID;
// const apiHash = process.env.API_HASH;
// const stringSession = new StringSession(process.env.SESSION_ID); // fill this later with the value from session.save()


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

require("./app/routes/telegram.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

