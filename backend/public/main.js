document.getElementById('btn').addEventListener('click', async () => { 
    const res = await fetch('/api/hello');
    const data = await res.json();

    document.getElementById('result').textContent =
      JSON.stringify(data, null, 2);
  });

async function loadItems() {
  const res = await fetch('/api/items'); // 브라우저가 GET /api/items HTTP 요청 보냄 -> api.js의 router.get('/items')로 요청이 날라감

  const data = await res.json(); //브라우저가 서버가 보낸 문자열 형식 응답파일을 res.json()으로 브라우저가 처리할 수 있는 JavaScript 객체로 변환한다.


  const itemList = document.getElementById('itemList'); // <ul id="itemList"></ul> 태그 찾는중

  itemList.innerHTML = ''; //버튼누를떄마다 목록이 중복되지 않도록 화면 비우고 다시그림

  data.forEach((item) => { //현재 데이터가 배열이므로 foreach를 사용해 하나씩 꺼냄
    const li = document.createElement('li'); //새로운 html 생성 (<li> <li> 생성)

    const itemText = document.createElement('span');
    itemText.textContent = `${item.id}. ${item.name} - ${item.description} / 작성자: ${item.user_name}`;

    const deleteBtn = document.createElement('button'); // <button></button> 생성
    deleteBtn.textContent = '삭제';

    deleteBtn.addEventListener('click', async () => { //삭제버튼이 클릭되면 
      const response = await fetch(`/api/items/${item.id}`, {  //DELETE /api/items/3 과 같은 삭제요청 메세지를 보낸다
        method: 'DELETE',
      });

      const result = await response.json();
      console.log(result);

      await loadItems();
    });

    const editBtn = document.createElement('button');

    editBtn.textContent = '수정';

    editBtn.addEventListener('click', async () => {
      const newName = prompt('새 아이템 이름:', item.name);
      const newDescription = prompt('새 설명:', item.description);

      if (!newName || !newDescription) {
        return;
      }

      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
        }),
      });

      const result = await response.json();
      console.log(result);

      await loadItems();
    });

    li.appendChild(itemText);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    itemList.appendChild(li);
  });
}

  document.getElementById('loadItems').addEventListener('click', loadItems);

  document.getElementById('createItem').addEventListener('click', async () => {
    const user_id = document.getElementById('userIdInput').value;
    const name = document.getElementById('itemNameInput').value;
    const description = document.getElementById('itemDescInput').value;

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        name,
        description,
      }),
    });

    const data = await res.json();

    document.getElementById('createResult').textContent =
      JSON.stringify(data, null, 2);

    await loadItems();
  });