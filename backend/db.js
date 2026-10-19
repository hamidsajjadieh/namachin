import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'nemachin.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ---------- password helpers (node:crypto scrypt) ---------- */
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}
export function verifyPassword(password, salt, hash) {
  const candidate = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

/* ---------- schema ---------- */
db.exec(`
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  name_ar TEXT NOT NULL DEFAULT '',
  base_color TEXT NOT NULL DEFAULT '',
  color_hex TEXT NOT NULL DEFAULT '',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  length REAL, width REAL, thickness REAL,
  absorption TEXT NOT NULL DEFAULT '',
  resistance TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  cover_url TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS announcements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS media_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES media_folders(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folder_id INTEGER REFERENCES media_folders(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  mime TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
`);

/* ---------- seed on first run ---------- */
const seeded = db.prepare('SELECT COUNT(*) AS n FROM admin_users').get().n > 0;
if (!seeded) {
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'));

  const defaultAdmin = process.env.ADMIN_USER || 'admin';
  const defaultPass = process.env.ADMIN_PASSWORD || 'admin1234';
  const { salt, hash } = hashPassword(defaultPass);
  db.prepare(
    'INSERT INTO admin_users (username, name, role, password_hash, salt) VALUES (?, ?, ?, ?, ?)'
  ).run(defaultAdmin, 'مدیر سایت', 'admin', hash, salt);

  const slugToId = {};
  const insertCat = db.prepare('INSERT INTO categories (parent_id, name, slug, sort) VALUES (?, ?, ?, ?)');
  seed.categories.forEach((c, i) => {
    const parent = c.parent ? slugToId[c.parent] : null;
    const info = insertCat.run(parent, c.name, c.slug, i);
    slugToId[c.slug] = info.lastInsertRowid;
  });

  const insertProd = db.prepare(`INSERT INTO products
    (code, name_fa, name_en, name_ar, base_color, color_hex, category_id, length, width, thickness, absorption, resistance, image_url, price, featured, published, sort)
    VALUES (@code, @name_fa, @name_en, @name_ar, @base_color, @color_hex, @category_id, @length, @width, @thickness, @absorption, @resistance, @image_url, @price, @featured, 1, @sort)`);
  for (const p of seed.products) {
    const catId = slugToId[p.color] || slugToId[p.group] || null;
    insertProd.run({ ...p, featured: p.featured ? 1 : 0, category_id: catId });
  }

  const insertNews = db.prepare(
    'INSERT INTO news (title, cover_url, excerpt, body, published, created_at) VALUES (?, ?, ?, ?, 1, ?)'
  );
  for (const n of seed.news) insertNews.run(n.title_fa, n.cover_url, n.excerpt_fa, n.body_fa, n.date);

  const insertFolder = db.prepare('INSERT INTO media_folders (parent_id, name) VALUES (?, ?)');
  const productsFolder = insertFolder.run(null, 'محصولات').lastInsertRowid;
  const newsFolder = insertFolder.run(null, 'اخبار و مقالات').lastInsertRowid;
  insertFolder.run(productsFolder, 'تصاویر اصلی');
  insertFolder.run(newsFolder, 'کاور مطالب');

  db.prepare(
    "INSERT INTO settings (key, value) VALUES ('theme', ?)"
  ).run(JSON.stringify({
    accent: '#b08d57',
    announcementActive: false,
    announcementText: '',
    heroVideoEnabled: true,
  }));
  console.log('[db] seeded with default content');
}
