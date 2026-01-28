const mysql = require('mysql2/promise');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('ENV CHECK:', process.env.DB_HOST);



const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  port: 3306,
  connectionLimit: 10
});

module.exports = pool;
