const mysql = require("mysql2");

const connection = mysql.createPool({
  connectionLimit: 100, // 100 tane bağlantı oluşturabilir
  host: "localhost",
  user: "user",
  port: "3308",
  password: "password",
  database: "app",
});

module.exports = connection;
