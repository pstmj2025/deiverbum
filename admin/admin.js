const API_URL = window.location.origin;

// Check auth on load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('addBookBtn').addEventListener('click', () => openBookModal());
  document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);
  document.getElementById('bookImage').addEventListener('change', previewImage);
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;
      showPage(page);
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });
}

async function checkAuth() {
  try {
    const res = await fetch(`${API_URL}/api/admin/check`);
    const data = await res.json();
    if (data.authenticated) {
      showAdminPanel();
      loadStats();
    } else {
      showLoginScreen();
    }
  } catch (err) {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'flex';
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(page + 'Page').style.display = 'block';
  if (page === 'books') loadBooksList();
  if (page === 'orders') loadOrdersList();
  if (page === 'dashboard') loadStats();
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      showAdminPanel();
      loadStats();
    } else {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = 'Credenciais inválidas';
    }
  } catch (err) {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = 'Erro ao conectar';
  }
}

async function handleLogout() {
  await fetch(`${API_URL}/api/admin/logout`, { method: 'POST' });
  showLoginScreen();
}

async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/api/stats`);
    const stats = await res.json();
    document.getElementById('statBooks').textContent = stats.totalBooks;
    document.getElementById('statOrders').textContent = stats.totalOrders;
    document.getElementById('statPending').textContent = stats.pending;
    document.getElementById('statRevenue').textContent = `R$ ${stats.revenue}`;
  } catch (err) {
    console.error('Stats error:', err);
  }
}

async function loadBooksList() {
  try {
    const res = await fetch(`${API_URL}/api/books`);
    const books = await res.json();
    const container = document.getElementById('booksList');
    
    if (books.length === 0) {
      container.innerHTML = '<p style="padding:40px;text-align:center;">Nenhum livro cadastrado.</p>';
      return;
    }
    
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Imagem</th>
            <th>Título</th>
            <th>Autor</th>
            <th>Preço</th>
            <th>Estado</th>
            <th>Qtd</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          ${books.map(book => `
            <tr>
              <td>${book.image ? `<img src="${API_URL}${book.image}">` : '📚'}</td>
              <td>${escapeHtml(book.title)}</td>
              <td>${escapeHtml(book.author)}</td>
              <td>R$ ${parseFloat(book.price).toFixed(2)}</td>
              <td><span class="badge badge-${book.condition}">${book.condition === 'new' ? 'Novo' : 'Usado'}</span></td>
              <td>${book.quantity}</td>
              <td class="actions">
                <button class="btn-edit" onclick="editBook('${book.id}')">Editar</button>
                <button class="btn-delete" onclick="deleteBook('${book.id}')">Excluir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Books error:', err);
  }
}

async function loadOrdersList() {
  try {
    const res = await fetch(`${API_URL}/api/orders`);
    const orders = await res.json();
    const res2 = await fetch(`${API_URL}/api/books`);
    const books = await res2.json();
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
      container.innerHTML = '<p style="padding:40px;text-align:center;">Nenhum pedido.</p>';
      return;
    }
    
    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Livro</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => {
            const book = books.find(b => b.id === order.bookId);
            return `
              <tr>
                <td>${order.id}</td>
                <td>${escapeHtml(order.customerName)}</td>
                <td>${book ? escapeHtml(book.title) : 'Livro removido'}</td>
                <td><span class="badge badge-${order.status}">${order.status === 'pending' ? 'Pendente' : 'Concluído'}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error('Orders error:', err);
  }
}

function openBookModal(book = null) {
  document.getElementById('modalTitle').textContent = book ? 'Editar Livro' : 'Novo Livro';
  document.getElementById('editBookId').value = book?.id || '';
  document.getElementById('bookTitle').value = book?.title || '';
  document.getElementById('bookAuthor').value = book?.author || '';
  document.getElementById('bookPrice').value = book?.price || '';
  document.getElementById('bookQuantity').value = book?.quantity || '1';
  document.getElementById('bookCondition').value = book?.condition || 'new';
  document.getElementById('bookCategory').value = book?.category || '';
  document.getElementById('bookIsbn').value = book?.isbn || '';
  document.getElementById('bookDescription').value = book?.description || '';
  document.getElementById('bookImagePreview').style.display = book?.image ? 'block' : 'none';
  document.getElementById('bookImagePreview').src = book?.image ? API_URL + book.image : '';
  document.getElementById('bookModal').style.display = 'block';
}

function closeBookModal() {
  document.getElementById('bookModal').style.display = 'none';
  document.getElementById('bookForm').reset();
  document.getElementById('bookImagePreview').style.display = 'none';
}

function previewImage(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('bookImagePreview').src = e.target.result;
      document.getElementById('bookImagePreview').style.display = 'block';
    };
    reader.readAsDataURL