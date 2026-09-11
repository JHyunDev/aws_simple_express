require('dotenv').config(); //.env파일의 값을 Node프로세스 환경변수로 넣는다

const app = require('./src/app'); //이 부분을 만날때 Node.js가 app.js실행하여 module.exports = app 으로 export한 app객체 받아옴

const PORT = process.env.PORT || 3000;

app.listen(3000, "0.0.0.0", () => {  // 앞으로 3000번 TCP포트로 들어오는 연결을 이 Express app객체로 처리하겠다, 바인딩 -> 소켓을 특정 IP/포트에 연결
  console.log("Server running on port 3000");
});
