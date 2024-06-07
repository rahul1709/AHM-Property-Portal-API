// ******************Configuration file - database connection*********************

// *************************Importing necessary modules*************************
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// ********************Creating a connection pool for MySQL database**************
const pool = mysql.createPool({
  connectionLimit : 10, // Limiting the maximum number of simultaneous connections
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD
});

module.exports = pool;  // Exporting the connection pool
