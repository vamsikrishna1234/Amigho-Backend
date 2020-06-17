// main server code
const express    = require('express');
const bodyParser = require('body-parser');
const app        = express();
const mysql      = require('mysql');

// using .env file
require('dotenv').config();

// mysql connection
const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  charset : "utf8mb4"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});

// parse application/x-www-form-urlencoded && application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({limit: '50mb'}))

require('./routes')(app, con);

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log('We are live on port = ' + port);
});