document.getElementById('btn').addEventListener('click', async () => {
  const res = await fetch(`${API_BASE_URL}/api/hello`);
  const data = await res.json();

  document.getElementById('result').textContent =
    JSON.stringify(data, null, 2);
});

async function loadItems() {
  const res = await fetch(`${API_BASE_URL}/api/items`); // fetch(`${API_BASE_URL}/api/items`)요청 서버로 보냄 -> EC2에 3000번 포트로 접근
  const data = await res.json();

  const itemList = document.getElementById('itemList');
  itemList.innerHTML = '';

  data.forEach((item) => {
    const li = document.createElement('li');

    const itemText = document.createElement('span');
    itemText.textContent =
      `${item.id}. ${item.name} - ${item.description} / 작성자: ${item.user_name}`;

    const editBtn = document.createElement('button');
    editBtn.textContent = '수정';

    editBtn.addEventListener('click', async () => {
      const newName = prompt('새 아이템 이름:', item.name);
      const newDescription = prompt('새 설명:', item.description);

      if (!newName || !newDescription) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/items/${item.id}`, {
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

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '삭제';

    deleteBtn.addEventListener('click', async () => {
      const response = await fetch(`${API_BASE_URL}/api/items/${item.id}`, {
        method: 'DELETE',
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

  const res = await fetch(`${API_BASE_URL}/api/items`, {
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