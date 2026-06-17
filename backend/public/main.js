// =====================================================
// main.js
// 역할:
// - 브라우저에서 버튼 클릭 이벤트를 처리한다.
// - fetch API로 Express 서버의 API를 호출한다.
// - JWT 토큰을 Authorization 헤더에 담아 보낸다.
// - 서버에서 받은 JSON 데이터를 화면 DOM에 렌더링한다.
// =====================================================


// -----------------------------------------------------
// 공통 함수: JWT 인증 헤더 생성
// -----------------------------------------------------
// 로그인 성공 시 localStorage에 저장해 둔 JWT 토큰을 꺼낸다.
// 이후 인증이 필요한 API 요청마다 Authorization 헤더에 담아 보낸다.
//
// 브라우저
//   ↓ Authorization: Bearer JWT
// Express
//   ↓ authMiddleware
// jwt.verify()
//   ↓
// req.user 생성
// -----------------------------------------------------
function getAuthHeaders() { //기존의 jwt토큰을 꺼내서 돌려주는 부분을 하나의 함수로 만들어 코드 반복을 줄임
  const token = localStorage.getItem('token');

  return {
    Authorization: `Bearer ${token}`,
  };
}


// -----------------------------------------------------
// 로그인 여부에 따라 화면 표시/숨김 처리
// -----------------------------------------------------
// 브라우저 localStorage에 JWT 토큰이 있으면 로그인 상태로 본다.
// 토큰이 없으면 비로그인 상태로 본다.
//
// 주의:
// 이건 "프론트 화면 제어"일 뿐이다.
// 진짜 보안은 백엔드 authMiddleware가 담당한다.
// -----------------------------------------------------
function updateAuthUI() {
  const token = localStorage.getItem('token');

  const guestArea = document.getElementById('guestArea');
  const userArea = document.getElementById('userArea');

  if (token) {
    // 로그인 상태
    guestArea.style.display = 'none';
    userArea.style.display = 'block';
  } else {
    // 비로그인 상태
    guestArea.style.display = 'block';
    userArea.style.display = 'none';
  }
}

// -----------------------------------------------------
// 테스트용 API 호출: GET /api/hello
// -----------------------------------------------------
// 서버가 정상적으로 살아있는지 확인하는 가장 단순한 요청이다.
// 인증이 필요 없는 테스트 API라면 Authorization 헤더는 없어도 된다.
//
// 요청 흐름:
// 버튼 클릭
//   ↓
// fetch(`${API_BASE_URL}/api/hello`)
//   ↓
// Express의 GET /api/hello
//   ↓
// JSON 응답
//   ↓
// 화면에 출력
// -----------------------------------------------------
document.getElementById('btn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hello`);
    const data = await res.json();

    document.getElementById('result').textContent =
      JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('GET /api/hello error:', error);
    alert('서버 연결 중 오류가 발생했습니다.');
  }
});


// -----------------------------------------------------
// 아이템 목록 조회 함수: GET /api/items
// -----------------------------------------------------
// 로그인한 사용자의 아이템 목록을 가져온다.
// 이제 items API는 JWT 인증이 필요하므로 Authorization 헤더를 반드시 보낸다.
//
// 요청 흐름:
// 브라우저 loadItems()
//   ↓
// GET /api/items + Authorization 헤더
//   ↓
// Express apiRouter
//   ↓
// authMiddleware가 JWT 검증
//   ↓
// req.user.id 기준으로 DB 조회
//   ↓
// MySQL: SELECT ... WHERE user_id = req.user.id
//   ↓
// rows 반환
//   ↓
// 브라우저가 li/button DOM을 동적으로 생성
// -----------------------------------------------------
async function loadItems() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/items`, {
      headers: {
        ...getAuthHeaders(),// -> 함수가 반환한 객체를 headers 안에 펼쳐 넣는다
      },
    });

    const data = await res.json();

    // 인증 실패, 권한 없음, 서버 에러 등을 브라우저에서 확인하기 위한 처리
    if (!res.ok) {
      console.error('GET /api/items failed:', data);
      alert(data.message || '아이템 목록 조회에 실패했습니다.');
      return;
    }

    const itemList = document.getElementById('itemList');

    // 기존 목록을 비운다.
    // 안 비우면 loadItems()를 호출할 때마다 같은 데이터가 계속 누적된다.
    itemList.innerHTML = '';

    // 서버에서 받은 아이템 배열을 하나씩 li로 만든다.
    data.forEach((item) => {
      const li = document.createElement('li');

      // 아이템 텍스트 영역
      const itemText = document.createElement('span');

      // 현재 백엔드가 사용자별 조회로 바뀌면 user_name이 없을 수 있다.
      // 그래서 작성자 표시는 일단 제거하고 item 기본 정보만 표시한다.
      itemText.textContent =
        `${item.id}. ${item.name} - ${item.description || ''}`;

      // 수정 버튼 생성
      const editBtn = document.createElement('button');
      editBtn.textContent = '수정';

      // 수정 버튼 클릭 시 PUT /api/items/:id 요청
      editBtn.addEventListener('click', async () => {
        await updateItem(item);
      });

      // 삭제 버튼 생성
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '삭제';

      // 삭제 버튼 클릭 시 DELETE /api/items/:id 요청
      deleteBtn.addEventListener('click', async () => {
        await deleteItem(item.id);
      });

      // li 안에 텍스트, 수정 버튼, 삭제 버튼을 순서대로 넣는다.
      li.appendChild(itemText);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      // 완성된 li를 ul 또는 ol 영역에 추가한다.
      itemList.appendChild(li);
    });
  } catch (error) {
    console.error('loadItems error:', error);
    alert('아이템 목록을 불러오는 중 오류가 발생했습니다.');
  }
}


// -----------------------------------------------------
// 아이템 생성: POST /api/items
// -----------------------------------------------------
// 사용자가 입력한 name, description을 서버로 보낸다.
// user_id는 더 이상 프론트에서 보내지 않는다.
//
// 이유:
// 프론트에서 user_id를 보내면 사용자가 개발자 도구로 조작할 수 있다.
// 따라서 서버가 JWT를 검증한 뒤 req.user.id에서 user_id를 꺼내야 안전하다.
//
// 요청 흐름:
// 입력값 읽기
//   ↓
// POST /api/items + Authorization 헤더
//   ↓
// authMiddleware
//   ↓
// req.user.id 확인
//   ↓
// INSERT INTO items (user_id, name, description)
// -----------------------------------------------------
document.getElementById('createItem').addEventListener('click', async () => {
  try {
    const name = document.getElementById('itemNameInput').value;
    const description = document.getElementById('itemDescInput').value;

    if (!name) {
      alert('아이템 이름을 입력해주세요.');
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('POST /api/items failed:', data);
      alert(data.message || '아이템 생성에 실패했습니다.');
      return;
    }

    document.getElementById('createResult').textContent =
      JSON.stringify(data, null, 2);

    // 생성 성공 후 목록을 다시 불러온다.
    // DB에 새로 저장된 결과를 화면에 즉시 반영하기 위해서다.
    await loadItems();

    // 입력창 초기화
    document.getElementById('itemNameInput').value = '';
    document.getElementById('itemDescInput').value = '';
  } catch (error) {
    console.error('createItem error:', error);
    alert('아이템 생성 중 오류가 발생했습니다.');
  }
});


// -----------------------------------------------------
// 아이템 수정: PUT /api/items/:id
// -----------------------------------------------------
// 기존 코드에서 가장 큰 오류가 있던 부분이다.
//
// 잘못된 방식:
// - 수정 버튼인데 POST /api/items로 요청함
// - name, description이라는 존재하지 않는 변수를 body에 넣음
//
// 올바른 방식:
// - PUT /api/items/${item.id}
// - body에는 prompt로 입력받은 newName, newDescription 사용
//
// 요청 흐름:
// 수정 버튼 클릭
//   ↓
// prompt로 새 값 입력
//   ↓
// PUT /api/items/:id + Authorization 헤더
//   ↓
// authMiddleware
//   ↓
// UPDATE items
//      SET name = ?, description = ?
//      WHERE id = ? AND user_id = req.user.id
//
// 이 구조 덕분에 A 사용자가 B 사용자의 item id를 알아도 수정할 수 없다.
// -----------------------------------------------------
async function updateItem(item) {
  try {
    const newName = prompt('새 아이템 이름:', item.name);
    const newDescription = prompt('새 설명:', item.description || '');

    if (!newName) {
      alert('아이템 이름은 비워둘 수 없습니다.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/items/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name: newName,
        description: newDescription,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PUT /api/items/:id failed:', result);
      alert(result.message || '아이템 수정에 실패했습니다.');
      return;
    }

    console.log('아이템 수정 성공:', result);

    // 수정 성공 후 목록을 다시 불러와 화면을 최신 상태로 만든다.
    await loadItems();
  } catch (error) {
    console.error('updateItem error:', error);
    alert('아이템 수정 중 오류가 발생했습니다.');
  }
}


// -----------------------------------------------------
// 아이템 삭제: DELETE /api/items/:id
// -----------------------------------------------------
// 특정 item.id를 서버로 보내 삭제한다.
// 서버에서는 JWT에서 꺼낸 req.user.id와 item의 user_id가 같은지 확인해야 한다.
//
// 요청 흐름:
// 삭제 버튼 클릭
//   ↓
// DELETE /api/items/:id + Authorization 헤더
//   ↓
// authMiddleware
//   ↓
// DELETE FROM items
//   WHERE id = ? AND user_id = req.user.id
//
// 이 구조 덕분에 자기 아이템만 삭제할 수 있다.
// -----------------------------------------------------
async function deleteItem(itemId) {
  try {
    const confirmed = confirm('정말 삭제하시겠습니까?');

    if (!confirmed) {
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('DELETE /api/items/:id failed:', result);
      alert(result.message || '아이템 삭제에 실패했습니다.');
      return;
    }

    console.log('아이템 삭제 성공:', result);

    // 삭제 성공 후 목록을 다시 불러온다.
    await loadItems();
  } catch (error) {
    console.error('deleteItem error:', error);
    alert('아이템 삭제 중 오류가 발생했습니다.');
  }
}


// -----------------------------------------------------
// 목록 조회 버튼 이벤트 연결
// -----------------------------------------------------
// 사용자가 "아이템 목록 조회" 버튼을 누르면 loadItems()가 실행된다.
// -----------------------------------------------------
document.getElementById('loadItems').addEventListener('click', loadItems);

//회원가입 로직
document.getElementById('registerBtn').addEventListener('click', async () => {
  try {
    const name = document.getElementById('registerNameInput').value;
    const email = document.getElementById('registerEmailInput').value;
    const password = document.getElementById('registerPasswordInput').value;

    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    document.getElementById('registerResult').textContent =
      JSON.stringify(data, null, 2);

    if (!res.ok) {
      alert(data.message || '회원가입 실패');
      return;
    }

    alert('회원가입 성공! 이제 로그인해보세요.');
  } catch (error) {
    console.error('register error:', error);
    alert('회원가입 중 오류가 발생했습니다.');
  }
});

// 로그인 로직

document.getElementById('loginBtn').addEventListener('click', async () => {
  try {
    const email = document.getElementById('loginEmailInput').value;
    const password = document.getElementById('loginPasswordInput').value;

    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || '로그인 실패');
      return;
    }

    localStorage.setItem('token', data.token); //-> 이제부터 브라우저가 jwt토큰저장 후 인가 필요한 상황마다 함께 서버에 보냄

    document.getElementById('loginResult').textContent =
      JSON.stringify(data, null, 2);

    updateAuthUI();


    alert('로그인 성공!');

    await loadMe();
    await loadItems();
  } catch (error) {
    console.error('login error:', error);
    alert('로그인 중 오류가 발생했습니다.');
  }
});

//로그아웃(브라우저 localstorage token 버리는 간단한 방식)
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');

  document.getElementById('loginResult').textContent = '';
  document.getElementById('meResult').textContent = '';
  document.getElementById('itemList').innerHTML = '';
  
  updateAuthUI();

  alert('로그아웃되었습니다.');
});

//내 정보 확인기능 추가
async function loadMe() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById('meResult').textContent =
        '로그인이 필요합니다.';
      return;
    }

    document.getElementById('meResult').textContent =
      JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('loadMe error:', error);
    alert('내 정보 조회 중 오류가 발생했습니다.');
  }
}

document.getElementById('meBtn').addEventListener('click', loadMe);

updateAuthUI();

if (localStorage.getItem('token')) {
  loadMe();
  loadItems();
}