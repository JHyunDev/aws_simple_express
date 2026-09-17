const mysql = require('mysql2/promise'); // mySQL통신 라이브러리 불러옴, promise버전을 사용하는 이유는 await pool.query와 같은 async/await 패턴을 사용하기 위해서
console.log('DB_HOST:', process.env.DB_HOST);
console.log('ENV CHECK:', process.env.DB_HOST);



const pool = mysql.createPool({//요청마다 db연결을 새로만들고 끊으면 비효율적! 따라서 pool객체가 최대 10개정도의 connection을 가지고 있다가 필요한 요청에 빌려주고 회수한다. 실제 connection pool객체 생성(커넥션 관리자 객체) ,실제로 처음부터 10개를 만들어 놓는것은 아님! 요청이 들어올때마다 만들고 반납하는데 최대갯수를 10개로 제한
  host: process.env.DB_HOST, //RDS엔드포인트, Node.js가 이 DNS 이름을 해석해서 RDS Private IP를 알아낸다
  user: process.env.DB_USER, //MySQL authentication
  password: process.env.DB_PASSWORD, //MySQL authentication
  database: process.env.DB_NAME, //사용할 DB schema를 지정
  waitForConnections: true, //만약 11번째 연결 요청이 오면? -> 빈 connection이 생길때까지 기다린다! 쉽게는 connection이 꽉차도 오류내지 말고 기다려라 
  port: 3306, //RDS가 기다리고 있는 Destination port
  connectionLimit: 10 //동시에 관리할 db연결을 최대 10개로 제한, 
});

module.exports = pool; //완성된 객체를 export
