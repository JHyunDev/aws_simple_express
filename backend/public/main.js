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

function getAuthHeaders() {//기존의 jwt토큰을 localstorage에서 꺼내서 돌려주는 부분을 하나의 함수로 만들어 코드 반복을 줄임
  const token = localStorage.getItem('token');

  if (!token) { //토큰이 없으면 -> 아무것도 반환 X
    return {};
  }

  return { //토큰이 있으면 ->  Authorization 헤더 반환
    Authorization: `Bearer ${token}`,
  };
}

function getInputValue(id) {
  const value = document.getElementById(id).value.trim();

  if (!value) {
    return null;
  }

  return value;
}

function clearItemForm() { //아이템 정보 입력창 초기화 함수
  document.getElementById('itemNameInput').value = '';
  document.getElementById('itemDescInput').value = '';
  document.getElementById('itemCategoryInput').value = '';
  document.getElementById('itemSubCategoryInput').value = '';
  document.getElementById('itemColorInput').value = '';
  document.getElementById('itemMaterialInput').value = '';
  document.getElementById('itemFitInput').value = '';
  document.getElementById('itemSeasonInput').value = '';
  document.getElementById('itemStyleInput').value = '';
  document.getElementById('itemImageUrlInput').value = '';
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

//로그아웃에 필요한 청소 작업 모음
//localStorage token 삭제
//화면에 남은 내 정보 삭제
//아이템 목록 삭제
//아이템 생성 결과 삭제
//UI를 비로그인 상태로 전환
function clearLoginState() {
  localStorage.removeItem('token');

  document.getElementById('loginResult').textContent = '';
  document.getElementById('meResult').textContent = '';
  document.getElementById('itemList').innerHTML = '';
  document.getElementById('createResult').textContent = '';

  updateAuthUI();
}

//인증실패처리 함수, 서버현재 응답이 401이면? -> 토큰 삭제 후 로그인 화면으로 전환 & 사용자에게 다시 로그인 안내
function handleAuthError(response, data) {
  if (response.status === 401) {
    clearLoginState();
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
    return true;
  }

  return false;
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

      if (handleAuthError(res, data)) { //토근 만료시에 handleAuthError호출 -> 토큰 삭제후 로그인 화면으로 전환
        return;
      }

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
        `${item.id}. ${item.name}
      설명: ${item.description || ''}
      분류: ${item.category || ''} / ${item.sub_category || ''}
      색상: ${item.color || ''}
      소재: ${item.material || ''}
      핏: ${item.fit || ''}
      계절: ${item.season || ''}
      스타일: ${item.style || ''}`;

      let imagePreview = null; // 처음에는 이미지 미리보기가 없다고 가정

      if (item.image_url) { // DB에서 가져온 아이템에 image_url이 있을 때만 이미지를 만들겠다
        imagePreview = document.createElement('img'); // 브라우저 화면에 넣을 <img> 태그를 JavaScript로 만듦
        imagePreview.src = item.image_url; //<img src="...">의 src에 S3 이미지 URL을 넣는다. 브라우저는 이 URL을 보고 S3로 이미지 요청을 보낸다.
        imagePreview.alt = item.name; // 이미지가 안 뜰 때 대신 보여줄 설명.
        imagePreview.className = 'item-image-preview'; //CSS에서 이미지 크기, 테두리, 둥근 모서리 같은 스타일을 주기 위한 클래스 이름
      }

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

      // 이미지 파일 선택 input 생성
      const imageInput = document.createElement('input');
      imageInput.type = 'file';
      imageInput.accept = 'image/*';

      // 이미지 업로드 버튼 생성
      const uploadImageBtn = document.createElement('button');
      uploadImageBtn.textContent = '이미지 업로드';

      uploadImageBtn.addEventListener('click', async () => {
        await uploadItemImage(item.id, imageInput);
      });

      // li 안에 텍스트, 파일 선택창, 이미지 업로드, 수정 버튼, 삭제 버튼을 순서대로 넣는다.
      li.appendChild(itemText);

      if (imagePreview) {
        li.appendChild(imagePreview);
      }

      li.appendChild(imageInput);
      li.appendChild(uploadImageBtn);
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
    const name = getInputValue('itemNameInput');
    const description = getInputValue('itemDescInput');
    const category = getInputValue('itemCategoryInput');
    const sub_category = getInputValue('itemSubCategoryInput');
    const color = getInputValue('itemColorInput');
    const material = getInputValue('itemMaterialInput');
    const fit = getInputValue('itemFitInput');
    const season = getInputValue('itemSeasonInput');
    const style = getInputValue('itemStyleInput');
    const image_url = getInputValue('itemImageUrlInput');

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
        category,
        sub_category,
        color,
        material,
        fit,
        season,
        style,
        image_url,
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

    await loadItems();

    clearItemForm();
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
    const newCategory = prompt('새 category:', item.category || '');
    const newSubCategory = prompt('새 sub_category:', item.sub_category || '');
    const newColor = prompt('새 color:', item.color || '');
    const newMaterial = prompt('새 material:', item.material || '');
    const newFit = prompt('새 fit:', item.fit || '');
    const newSeason = prompt('새 season:', item.season || '');
    const newStyle = prompt('새 style:', item.style || '');
    const newImageUrl = prompt('새 image_url:', item.image_url || '');

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
        description: newDescription || null,
        category: newCategory || null,
        sub_category: newSubCategory || null,
        color: newColor || null,
        material: newMaterial || null,
        fit: newFit || null,
        season: newSeason || null,
        style: newStyle || null,
        image_url: newImageUrl || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PUT /api/items/:id failed:', result);
      alert(result.message || '아이템 수정에 실패했습니다.');
      return;
    }

    console.log('아이템 수정 성공:', result);

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

      if (handleAuthError(response, result)) { //토큰 만료시 처리
        return;
      }

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
// 아이템 이미지 업로드: POST /api/items/:id/image
// -----------------------------------------------------
// JSON이 아니라 multipart/form-data 요청을 보낸다.
// 그래서 FormData를 사용한다.
//
// 주의:
// FormData를 보낼 때는 Content-Type을 직접 지정하지 않는다.
// 브라우저가 boundary를 포함해서 자동으로 Content-Type을 만들어야 한다.
//
// 요청 흐름:
// 파일 선택
//   ↓
// FormData에 image 파일 담기
//   ↓
// POST /api/items/:id/image + Authorization 헤더
//   ↓
// Express authMiddleware
//   ↓
// multer가 파일 파싱
//   ↓
// S3 PutObject
//   ↓
// DB items.image_url 업데이트
// -----------------------------------------------------
async function uploadItemImage(itemId, fileInput) {
  try {
    const file = fileInput.files[0];

    if (!file) {
      alert('업로드할 이미지 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/items/${itemId}/image`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('POST /api/items/:id/image failed:', result);

      if (handleAuthError(response, result)) {
        return;
      }

      alert(result.message || '이미지 업로드에 실패했습니다.');
      return;
    }

    console.log('이미지 업로드 성공:', result);
    alert('이미지 업로드 성공!');

    await loadItems();
  } catch (error) {
    console.error('uploadItemImage error:', error);
    alert('이미지 업로드 중 오류가 발생했습니다.');
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

//로그아웃(브라우저 localstorage token 버리는 간단한 방식) -> 이제 위에 만든 clearLoginState()함수를 통해 간편하게 로그아웃 가능
document.getElementById('logoutBtn').addEventListener('click', () => {
  clearLoginState();
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
      if (handleAuthError(res, data)) { //토큰 만료시 처리
        return;
      }

      document.getElementById('meResult').textContent =
        data.message || '내 정보 조회에 실패했습니다.';
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