const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'dei-verbum-secret-2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

// Database paths
const DB_PATH = path.join(__dirname, '..', 'database', 'database.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'books');

// Ensure directories exist
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize database
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      books: [],
      orders: [],
      admin: { username: 'admin', password: 'dei-verbum-2026' },
      stats: { totalBooks: 0, totalOrders: 0, totalRevenue: 0 }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

function getDB() {
  initDB();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ===== AUTH ROUTES =====
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = getDB();
  if (username === db.admin.username && password === db.admin.password) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.get('/api/admin/check', (req, res) => {
  res.json({ authenticated: !!req.session.admin });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ===== BOOKS ROUTES =====
app.get('/api/books', (req, res) => {
  const db = getDB();
  let books = db.books;
  
  if (req.query.search) {
    const s = req.query.search.toLowerCase();
    books = books.filter(b => 
      b.title.toLowerCase().includes(s) ||
      b.author.toLowerCase().includes(s) ||
      b.isbn?.toLowerCase().includes(s)
    );
  }
  if (req.query.condition) books = books.filter(b => b.condition === req.query.condition);
  if (req.query.category) books = books.filter(b => b.category === req.query.category);
  if (req.query.minPrice) books = books.filter(b => b.price >= parseFloat(req.query.minPrice));
  if (req.query.maxPrice) books = books.filter(b => b.price <= parseFloat(req.query.maxPrice));
  
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const db = getDB();
  const book = db.books.find(b => b.id === req.params.id);
  book ? res.json(book) : res.status(404).json({ message: 'Livro não encontrado' });
});

app.post('/api/books', upload.single('image'), (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  
  const db = getDB();
  const book = {
    id: Date.now().toString(),
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
    price: parseFloat(req.body.price),
    condition: req.body.condition,
    category: req.body.category,
    isbn: req.body.isbn,
    quantity: parseInt(req.body.quantity) || 1,
    image: req.file ? `/uploads/books/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };
  
  db.books.push(book);
  db.stats.totalBooks = db.books.length;
  saveDB(db);
  res.json({ success: true, book });
});

app.put('/api/books/:id', upload.single('image'), (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  
  const db = getDB();
  const idx = db.books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Livro não encontrado' });
  
  const book = db.books[idx];
  Object.assign(book, {
    title: req.body.title || book.title,
    author: req.body.author || book.author,
    description: req.body.description || book.description,
    price: req.body.price ? parseFloat(req.body.price) : book.price,
    condition: req.body.condition || book.condition,
    category: req.body.category || book.category,
    isbn: req.body.isbn || book.isbn,
    quantity: req.body.quantity ? parseInt(req.body.quantity) : book.quantity,
    ...(req.file && { image: `/uploads/books/${req.file.filename}` })
  });
  
  db.books[idx] = book;
  saveDB(db);
  res.json({ success: true, book });
});

app.delete('/api/books/:id', (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  
  const db = getDB();
  db.books = db.books.filter(b => b.id !== req.params.id);
  db.stats.totalBooks = db.books.length;
  saveDB(db);
  res.json({ success: true });
});

// ===== ORDERS ROUTES =====
app.post('/api/orders', (req, res) => {
  const db = getDB();
  const order = {
    id: Date.now().toString(),
    bookId: req.body.bookId,
    customerName: req.body.customerName,
    customerEmail: req.body.customerEmail,
    customerPhone: req.body.customerPhone,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  db.orders.push(order);
  db.stats.totalOrders = db.orders.length;
  saveDB(db);
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  res.json(getDB().orders);
});

app.put('/api/orders/:id/status', (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  
  const db = getDB();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
  
  order.status = req.body.status;
  saveDB(db);
  res.json({ success: true, order });
});

// ===== STATS =====
app.get('/api/stats', (req, res) => {
  if (!req.session.admin) return res.status(401).json({ message: 'Não autorizado' });
  const db = getDB();
  const revenue = db.orders.reduce((sum, o) => {
    const book = db.books.find(b => b.id === o.bookId);
    return sum + (book ? book.price : 0);
  }, 0);
  res.json({
    totalBooks: db.books.length,
    totalOrders: db.orders.length,
    pending: db.orders.filter(o => o.status === 'pending').length,
    revenue: revenue.toFixed(2)
  });
});

// ===== SERVE FRONTEND =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`DEI VERBUM rodando em http://0.0.0.0:${PORT}`);
  console.log(`Acesse: http://187.77.45.220:${PORT}`);
});
