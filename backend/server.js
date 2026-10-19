import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { db, verifyPassword, hashPassword, UPLOADS_DIR } from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

/* ---------- uploads: static files + multipart handling ---------- */
app.use('/api/uploads', express.static(UPLOADS_DIR));
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

/* ---------- auth ---------- */
const TOKEN_TTL_DAYS = 7;
function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 864e5).toISOString();
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expires);
  return token;
}
function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  const row = db
    .prepare(
      `SELECT s.user_id, s.expires_at, u.username, u.name, u.role
       FROM sessions s JOIN admin_users u ON u.id = s.user_id WHERE s.token = ?`
    )
    .get(token);
  if (!row || new Date(row.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'unauthorized' });
  }
  req.user = { id: row.user_id, username: row.username, name: row.name, role: row.role };
  next();
}
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(String(username || '').trim());
  if (!user || !verifyPassword(password, user.salt, user.password_hash))
    return res.status(401).json({ error: 'invalid_credentials' });
  const token = createSession(user.id);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});
app.post('/api/auth/logout', authRequired, (req, res) => {
  const token = req.headers.authorization.slice(7);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.json({ ok: true });
});
app.get('/api/auth/me', authRequired, (req, res) => res.json({ user: req.user }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const crud = (table, cols) => {
  const list = () => db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`);
  return { list };
};

/* ---------- categories ---------- */
app.get('/api/categories', (_req, res) => {
  const cats = db
    .prepare('SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY c.sort, c.id')
    .all();
  res.json(cats);
});
app.post('/api/categories', authRequired, (req, res) => {
  const { name, parent_id = null } = req.body || {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name_required' });
  const info = db
    .prepare('INSERT INTO categories (parent_id, name, slug) VALUES (?, ?, ?)')
    .run(parent_id, String(name).trim(), '');
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/categories/:id', authRequired, (req, res) => {
  const { name, parent_id } = req.body || {};
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'not_found' });
  const pid = parent_id === undefined ? cat.parent_id : parent_id;
  if (pid == req.params.id) return res.status(400).json({ error: 'self_parent' });
  db.prepare('UPDATE categories SET name = ?, parent_id = ? WHERE id = ?').run(
    String(name ?? cat.name).trim(), pid, cat.id
  );
  res.json({ ok: true });
});
app.delete('/api/categories/:id', authRequired, (req, res) => {
  const children = db.prepare('SELECT COUNT(*) AS n FROM categories WHERE parent_id = ?').get(req.params.id).n;
  const products = db.prepare('SELECT COUNT(*) AS n FROM products WHERE category_id = ?').get(req.params.id).n;
  if (children || products) return res.status(400).json({ error: 'category_not_empty' });
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- products ---------- */
app.get('/api/products', (req, res) => {
  const q = String(req.query.search || '').trim();
  const rows = q
    ? db.prepare(`SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.name_fa LIKE ? OR p.code LIKE ? ORDER BY p.sort, p.id`).all(`%${q}%`, `%${q}%`)
    : db.prepare(`SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id ORDER BY p.sort, p.id`).all();
  res.json(rows);
});
app.post('/api/products', authRequired, (req, res) => {
  const p = req.body || {};
  if (!p.name_fa || !p.code) return res.status(400).json({ error: 'name_and_code_required' });
  const info = db.prepare(`INSERT INTO products
    (code, name_fa, name_en, name_ar, base_color, color_hex, category_id, length, width, thickness, absorption, resistance, image_url, price, featured, published, sort)
    VALUES (@code, @name_fa, @name_en, @name_ar, @base_color, @color_hex, @category_id, @length, @width, @thickness, @absorption, @resistance, @image_url, @price, @featured, @published, @sort)`)
    .run({ price: 0, featured: 0, published: 1, sort: 0, ...p });
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/products/:id', authRequired, (req, res) => {
  const p = req.body || {};
  db.prepare(`UPDATE products SET code=@code, name_fa=@name_fa, name_en=@name_en, name_ar=@name_ar,
    base_color=@base_color, color_hex=@color_hex, category_id=@category_id, length=@length, width=@width,
    thickness=@thickness, absorption=@absorption, resistance=@resistance, image_url=@image_url,
    price=@price, featured=@featured, published=@published, updated_at=datetime('now')
    WHERE id=@id`).run({ ...p, id: Number(req.params.id) });
  res.json({ ok: true });
});
app.delete('/api/products/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- news / announcements ---------- */
app.get('/api/news', (_req, res) => res.json(crud('news').list().all()));
app.post('/api/news', authRequired, (req, res) => {
  const { title, cover_url = '', excerpt = '', body = '', published = 1 } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title_required' });
  const info = db.prepare('INSERT INTO news (title, cover_url, excerpt, body, published) VALUES (?, ?, ?, ?, ?)')
    .run(title, cover_url, excerpt, body, published ? 1 : 0);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/news/:id', authRequired, (req, res) => {
  const { title, cover_url = '', excerpt = '', body = '', published = 1 } = req.body || {};
  db.prepare('UPDATE news SET title=?, cover_url=?, excerpt=?, body=?, published=? WHERE id=?')
    .run(title, cover_url, excerpt, body, published ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/news/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/announcements', (_req, res) => res.json(crud('announcements').list().all()));
app.post('/api/announcements', authRequired, (req, res) => {
  const { title, body = '', active = 1 } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title_required' });
  const info = db.prepare('INSERT INTO announcements (title, body, active) VALUES (?, ?, ?)').run(title, body, active ? 1 : 0);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/announcements/:id', authRequired, (req, res) => {
  const { title, body = '', active = 1 } = req.body || {};
  db.prepare('UPDATE announcements SET title=?, body=?, active=? WHERE id=?').run(title, body, active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
app.delete('/api/announcements/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- media ---------- */
app.get('/api/media/folders', (_req, res) => {
  const folders = db.prepare('SELECT f.*, (SELECT COUNT(*) FROM media_files m WHERE m.folder_id = f.id) AS file_count FROM media_folders f ORDER BY f.id').all();
  res.json(folders);
});
app.post('/api/media/folders', authRequired, (req, res) => {
  const { name, parent_id = null } = req.body || {};
  if (!String(name || '').trim()) return res.status(400).json({ error: 'name_required' });
  const info = db.prepare('INSERT INTO media_folders (parent_id, name) VALUES (?, ?)').run(parent_id, String(name).trim());
  res.json({ id: info.lastInsertRowid });
});
app.delete('/api/media/folders/:id', authRequired, (req, res) => {
  const children = db.prepare('SELECT COUNT(*) AS n FROM media_folders WHERE parent_id = ?').get(req.params.id).n;
  if (children) return res.status(400).json({ error: 'folder_not_empty' });
  const files = db.prepare('SELECT * FROM media_files WHERE folder_id = ?').all(req.params.id);
  for (const f of files) {
    try { fs.unlinkSync(path.join(UPLOADS_DIR, f.filename)); } catch { /* already gone */ }
    db.prepare('DELETE FROM media_files WHERE id = ?').run(f.id);
  }
  db.prepare('DELETE FROM media_folders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
app.get('/api/media/files', (req, res) => {
  const folder = req.query.folder_id;
  const rows = folder
    ? db.prepare('SELECT * FROM media_files WHERE folder_id = ? ORDER BY id DESC').all(folder)
    : db.prepare('SELECT * FROM media_files ORDER BY id DESC').all();
  res.json(rows);
});
app.post('/api/media/upload', authRequired, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'invalid_file' });
  const folder_id = req.body.folder_id ? Number(req.body.folder_id) : null;
  const url = `/api/uploads/${req.file.filename}`;
  const info = db
    .prepare('INSERT INTO media_files (folder_id, filename, url, size, mime) VALUES (?, ?, ?, ?, ?)')
    .run(folder_id, req.file.filename, url, req.file.size, req.file.mimetype);
  res.json({ id: info.lastInsertRowid, url });
});
app.delete('/api/media/files/:id', authRequired, (req, res) => {
  const file = db.prepare('SELECT * FROM media_files WHERE id = ?').get(req.params.id);
  if (!file) return res.status(404).json({ error: 'not_found' });
  try { fs.unlinkSync(path.join(UPLOADS_DIR, file.filename)); } catch { /* already gone */ }
  db.prepare('DELETE FROM media_files WHERE id = ?').run(file.id);
  res.json({ ok: true });
});

/* ---------- orders & messages ---------- */
app.get('/api/orders', (_req, res) => res.json(crud('orders').list().all()));
app.put('/api/orders/:id', authRequired, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(String(req.body?.status || 'new'), req.params.id);
  res.json({ ok: true });
});
app.delete('/api/orders/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
app.get('/api/messages', (_req, res) => res.json(crud('messages').list().all()));
app.put('/api/messages/:id/read', authRequired, (req, res) => {
  db.prepare('UPDATE messages SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});
app.delete('/api/messages/:id', authRequired, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- public (no auth) — wired to the site's inquiry forms ---------- */
app.post('/api/public/order-request', (req, res) => {
  const { name, phone, email = '', product = '', message = '' } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'name_phone_required' });
  db.prepare('INSERT INTO orders (name, phone, email, product, message) VALUES (?, ?, ?, ?, ?)')
    .run(String(name).slice(0, 120), String(phone).slice(0, 40), String(email).slice(0, 160), String(product).slice(0, 160), String(message).slice(0, 2000));
  res.json({ ok: true });
});
app.post('/api/public/message', (req, res) => {
  const { name, contact = '', subject = '', body = '' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  db.prepare('INSERT INTO messages (name, contact, subject, body) VALUES (?, ?, ?, ?)')
    .run(String(name).slice(0, 120), String(contact).slice(0, 160), String(subject).slice(0, 200), String(body).slice(0, 4000));
  res.json({ ok: true });
});

/* ---------- users ---------- */
app.get('/api/users', authRequired, (_req, res) =>
  res.json(db.prepare('SELECT id, username, name, role, created_at FROM admin_users ORDER BY id').all())
);
app.post('/api/users', authRequired, (req, res) => {
  const { username, name = '', role = 'admin', password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username_password_required' });
  const exists = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(String(username).trim());
  if (exists) return res.status(400).json({ error: 'username_taken' });
  const { salt, hash } = hashPassword(password);
  const info = db.prepare('INSERT INTO admin_users (username, name, role, password_hash, salt) VALUES (?, ?, ?, ?, ?)')
    .run(String(username).trim(), name, role === 'editor' ? 'editor' : 'admin', hash, salt);
  res.json({ id: info.lastInsertRowid });
});
app.put('/api/users/:id', authRequired, (req, res) => {
  const { username, name = '', role, password } = req.body || {};
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'not_found' });
  if (password) {
    const { salt, hash } = hashPassword(password);
    db.prepare('UPDATE admin_users SET username=?, name=?, role=?, password_hash=?, salt=? WHERE id=?')
      .run(String(username || user.username).trim(), name || user.name, role || user.role, hash, salt, user.id);
  } else {
    db.prepare('UPDATE admin_users SET username=?, name=?, role=? WHERE id=?')
      .run(String(username || user.username).trim(), name || user.name, role || user.role, user.id);
  }
  res.json({ ok: true });
});
app.delete('/api/users/:id', authRequired, (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'cannot_delete_self' });
  db.prepare('DELETE FROM admin_users WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

/* ---------- settings (theme) ---------- */
app.get('/api/settings', (_req, res) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'theme'").get();
  res.json(row ? JSON.parse(row.value) : {});
});
app.put('/api/settings', authRequired, (req, res) => {
  const current = db.prepare("SELECT value FROM settings WHERE key = 'theme'").get();
  const merged = { ...(current ? JSON.parse(current.value) : {}), ...req.body };
  db.prepare("INSERT INTO settings (key, value) VALUES ('theme', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(JSON.stringify(merged));
  res.json(merged);
});

/* ---------- dashboard stats ---------- */
app.get('/api/dashboard/stats', authRequired, (_req, res) => {
  const count = (sql) => db.prepare(sql).get().n;
  res.json({
    products: count('SELECT COUNT(*) AS n FROM products'),
    categories: count('SELECT COUNT(*) AS n FROM categories'),
    orders: count('SELECT COUNT(*) AS n FROM orders'),
    ordersNew: count("SELECT COUNT(*) AS n FROM orders WHERE status = 'new'"),
    messages: count('SELECT COUNT(*) AS n FROM messages'),
    messagesUnread: count('SELECT COUNT(*) AS n FROM messages WHERE is_read = 0'),
    news: count('SELECT COUNT(*) AS n FROM news'),
    mediaFiles: count('SELECT COUNT(*) AS n FROM media_files'),
    mediaFolders: count('SELECT COUNT(*) AS n FROM media_folders'),
    announcements: count('SELECT COUNT(*) AS n FROM announcements'),
    users: count('SELECT COUNT(*) AS n FROM admin_users'),
  });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, '0.0.0.0', () => console.log(`[api] listening on :${PORT}`));
