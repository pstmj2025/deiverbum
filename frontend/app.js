// DEI VERBUM - Frontend JavaScript

const API_URL = window.location.origin;

// Load books on page load
document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  setupEventListeners();
});

// Event listeners
function setupEventListeners() {
  document.getElementById('searchBtn').addEventListener('click', loadBooks);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadBooks();
  });
  document.getElementById('conditionFilter').addEventListener('change', loadBooks);
  document.getElementById('categoryFilter').addEventListener('change', loadBooks);
  document.getElementById('minPrice').addEventListener('input', debounce(loadBooks, 300));
  document.getElementById('maxPrice').addEventListener('input', debounce(loadBooks, 300));
  
  // Modal close
  document.querySelector('.close').addEventListener('click', closeModal);
  document.getElementById('bookModal').addEventListener('click', (e) => {
    if (e.target.id === 'bookModal') closeModal();
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Load and display books
async function loadBooks() {
  try {
    const params = new URLSearchParams();
    const search = document.getElementById('searchInput').value;
    const condition = document.getElementById('conditionFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    
    if (search) params.append('search', search);
    if (condition) params.append('condition', condition);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    
    const response = await fetch(`${API_URL}/api/books?${params}`);
    const books = await response.json();
    
    displayBooks(books);
  } catch (error) {
    console.error('Error loading books:', error);
    document.getElementById('booksGrid').innerHTML = 
      '<p style="text-align:center;padding:40px;">Erro ao carregar livros. Tente novamente.</p>';
  }
}

// Display books in grid
function displayBooks(books) {
  const grid = document.getElementById('booksGrid');
  
  if (books.length === 0) {
    grid.innerHTML = '<p style="text-align:center;padding:40px;">Nenhum livro encontrado.</p>';
    return;
  }
  
  grid.innerHTML = books.map(book => `
    <div class="book-card" onclick="showBookDetail('${book.id}')">
      ${book.image 
        ? `<img src="${API_URL}${book.image}" alt="${book.title}" class="book-image">`
        : `<div class="book-image-placeholder">📚</div>`
      }
      <div class="book-info">
        <h4 class="book-title">${escapeHtml(book.title)}</h4>
        <p class="book-author">${escapeHtml(book.author)}</p>
        <div class="book-meta">
          <span class="book-price">R$ ${parseFloat(book.price).toFixed(2)}</span>
          <span class="book-condition condition-${book.condition}">
            ${book.condition === 'new' ? 'Novo' : 'Usado'}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

// Show book detail modal
async function showBookDetail(bookId) {
  try {
    const response = await fetch(`${API_URL}/api/books/${bookId}`);
    const book = await response.json();
    
    const modal = document.getElementById('bookModal');
    const detail = document.getElementById('bookDetail');
    
    detail.innerHTML = `
      <div style="display:flex;gap:30px;flex-wrap:wrap;">
        ${book.image 
          ? `<img src="${API_URL}${book.image}" alt="${book.title}" style="width:200px;height:280px;object-fit:cover;border-radius:8px;">`
          : `<div style="width:200px;height:280px;background:linear-gradient(135deg,#d4a574,#c4956a);display:flex;align-items:center;justify-content:center;font-size:4rem;border-radius:8px;">📚</div>`
        }
        <div style="flex:1;min-width:250px;">
          <h2 style="font-family:'Crimson Text',serif;margin-bottom:10px;">${escapeHtml(book.title)}</h2>
          <p style="color:#666;margin-bottom:15px;">por <strong>${escapeHtml(book.author)}</strong></p>
          <p style="background:${book.condition === 'new' ? '#d4edda' : '#fff3cd'};color:${book.condition === 'new' ? '#155724' : '#856404'};padding:8px 15px;border-radius:20px;display:inline-block;font-size:0.9rem;margin-bottom:15px;">
            ${book.condition === 'new' ? 'Livro Novo' : 'Livro Usado'}
          </p>
          <p style="font-size:2rem;font-weight:bold;color:#1a472a;margin:20px 0;">
            R$ ${parseFloat(book.price).toFixed(2)}
          </p>
          ${book.isbn ? `<p style="color:#666;font-size:0.9rem;">ISBN: ${book.isbn}</p>` : ''}
          ${book.category ? `<p style="color:#666;font-size:0.9rem;">Categoria: ${book.category}</p>` : ''}
          ${book.quantity ? `<p style="color:#666;font-size:0.9rem;">Quantidade: ${book.quantity}</p>` : ''}
          ${book.description ? `<p style="margin-top:15px;line-height:1.6;">${escapeHtml(book.description)}</p>` : ''}
          
          <div style="margin-top:30px;">
            <h4 style="margin-bottom:15px;">Reservar este livro</h4>
            <form id="orderForm" onsubmit="submitOrder(event, '${book.id}')">
              <input type="text" id="customerName" placeholder="Seu nome" required style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">
              <input type="email" id="customerEmail" placeholder="Seu e-mail" required style="width:100%;padding:10px;margin-bottom:10px;border:1px solid #ddd;border-radius:4px;">
              <input type="tel" id="customerPhone" placeholder="Seu telefone" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">
              <button type="submit" style="background:#1a472a;color:#fff;padding:12px 30px;border:none;border-radius:6px;cursor:pointer;width:100%;font-size:1rem;">
                Reservar Agora
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  } catch (error) {
    console.error('Error loading book:', error);
    alert('Erro ao carregar detalhes do livro.');
  }
}

// Submit order
async function submitOrder(e, bookId) {
  e.preventDefault();
  
  const order = {
    bookId,
    customerName: document.getElementById('customerName').value,
    customerEmail: document.getElementById('customerEmail').value,
    customerPhone: document.getElementById('customerPhone').value
  };
  
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Reserva realizada com sucesso! Entraremos em contato em breve.');
      closeModal();
    } else {
      alert('Erro ao realizar reserva. Tente novamente.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Erro ao processar reserva.');
  }
}

// Close modal
function closeModal() {
  document.getElementById('bookModal').style.display = 'none';
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Expose functions globally
window.showBookDetail = showBookDetail;
window.submitOrder