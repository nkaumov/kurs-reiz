// config/db.js

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'kursovaya_reiz',
  // Можно добавить connectionLimit, если нужно
  // connectionLimit: 10,
});

module.exports = pool;
