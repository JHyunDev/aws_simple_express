# Wardrobe API Server

Node.js + Express 기반의 백엔드 API 서버입니다.  
AWS EC2 환경에서 실행되며, ALB(Application Load Balancer)를 통해 외부 요청을 처리합니다.


## Architecture

Client (curl / browser)
        ↓
AWS ALB (HTTP :80)
        ↓
EC2 (Ubuntu, Node.js, Express)
        ↓
PM2 (Process Manager)


현재 단계에서는 프론트엔드 없이 API 서버만 구성되어 있습니다.

## Tech Stack

- Runtime: Node.js
- Framework: Express
- Process Manager: PM2
- Cloud: AWS EC2, ALB
- OS: Ubuntu 22.04

## Application Structure

server.js        # 서버 엔트리 포인트
└── src/
    ├── app.js   # Express 앱 설정
    └── routes/
        ├── api.js
        └── health.js

- server.js: 서버 실행 및 포트 바인딩
- app.js: 미들웨어 및 라우터 등록
- routes/: API 엔드포인트 정의

## API Endpoints

### Health Check
GET /health  
→ 서버 상태 확인용 엔드포인트

### Hello API
GET /api/hello  
→ 테스트용 API

예시 응답
{
  "message": "Hello from API",
  "time": "2026-02-05T07:30:21.123Z"
}

## How to Run

1. 환경 변수 설정 (.env)
2. 의존성 설치
   npm install
3. 서버 실행
   pm2 start server.js --name myapp

서버는 3000 포트에서 실행되며,
ALB를 통해 외부 접근이 가능합니다.

## Future Work

- API 확장
- RDS 연동
- 프론트엔드 연동 시 CORS 설정 추가 예정


## 🛠️ Production Troubleshooting Checklist
(EC2 + PM2 + Express 기준)

증상 예시

*코드 수정했는데 반영 안 됨

*/api/hello → Cannot GET

*ALB 헬스체크 실패

*PM2는 정상인데 요청이 이상함

1️⃣ 포트 점유 확인 (최우선)
sudo lsof -i :3000

해석

출력 있음 → 서버 실행 중

출력 없음 → 서버 미실행

주의

node server.js 와 pm2가 동시에 떠 있으면 충돌 위험

2️⃣ 포트를 점유한 프로세스 확인
ps -fp <PID>

예시
CMD
node server.js


→ 직접 실행된 Node 프로세스
→ PM2와 충돌 가능

node /usr/lib/node_modules/pm2/...


→ PM2 관리 프로세스 (정상)

3️⃣ 유령 / 중복 프로세스 정리
pm2 delete all
ps aux | grep node
sudo kill -9 <불필요한 PID>


이후 반드시 재확인:

sudo lsof -i :3000

4️⃣ 단일 실행 방식 유지 (운영 표준)
❌ 금지
node server.js

✅ 운영 환경 권장
pm2 start server.js --name myapp
pm2 save

5️⃣ 로컬 루프백 테스트 (네트워크 배제)
curl http://localhost:3000/api/hello


실패 → 서버 / 코드 문제

성공 → 네트워크 / ALB / SG 문제

🔑 핵심 교훈

“코드 문제 같아 보여도,
실무에서는 ‘프로세스 충돌’이 원인인 경우가 가장 많다.”

📌 실제 경험 기반 문제 사례

PM2로 서버 운영 중

이전에 node server.js로 실행한 프로세스가 남아

동일 포트(3000)를 점유

요청이 구버전 서버로 라우팅되는 문제 발생

lsof, ps 기반으로 진단 후 해결

## Deployment Verification (Runtime Verification)
운영 환경에서 코드 수정 후
**“지금 실행 중인 코드가 내가 배포한 그 코드인지”**를
즉시 검증하기 위한 전략

1️⃣ Server Boot Signature

서버 시작 시 고유 로그 시그니처를 출력하여
실제 실행 중인 코드 버전을 확인한다.

// server.js or app.js
console.log('### REAL APP v1.0 LOADED @ 2026-02-05 ###');

검증 방법
pm2 restart myapp
pm2 logs myapp


로그 출력됨 → 해당 코드 실행 중

로그 없음 → 다른 코드가 실행 중

2️⃣ API Response Fingerprint

API 응답에 버전 정보를 포함하여
요청이 어떤 코드로 처리되었는지 HTTP 레벨에서 검증한다.

router.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from API',
    version: 'v1.0',
    time: new Date().toISOString(),
  });
});

검증 방법
curl http://localhost:3000/api/hello

3️⃣ Environment-based Identification (Optional)

여러 인스턴스 또는 운영 환경에서
서버 식별을 위해 환경변수를 사용한다.

APP_INSTANCE=ec2-prod-1

console.log('APP_INSTANCE:', process.env.APP_INSTANCE);

🔑 Why This Matters

ALB 뒤에 여러 EC2가 있을 때

무중단 배포 시

롤백 또는 핫픽스 직후

캐시 또는 라우팅 문제 의심 시

➡️ “이 요청이 어떤 서버, 어떤 코드에서 처리됐는지”를 즉시 판단 가능

📌 Key Takeaway

단순히 서버가 살아 있는지보다
“의도한 코드가 실행 중인지”를 확인하는 것이
운영 환경에서 더 중요하다.

🧠 Real-world Application

본 프로젝트에서는

PM2 기반 서버 운영 환경에서

서버 부팅 로그와 API 응답 식별자를 통해

배포 결과를 즉시 검증하는 전략을 사용했다.