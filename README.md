# aws_simple_express

## Architecture

## How to Run

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