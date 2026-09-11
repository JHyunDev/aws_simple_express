const mysql = require('mysql2/promise');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('ENV CHECK:', process.env.DB_HOST);



const pool = mysql.createPool({//요청마다 db연결을 새로만들고 끊으면 비효율적! 따라서 pool객체가 최대 10개정도의 connection을 가지고 있다가 필요한 요청에 빌려주고 회수한다.
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  port: 3306,
  connectionLimit: 10 //동시에 관리할 db연결을 최대 10개로 제한, 
});

module.exports = pool; //완성된 객체를 export
