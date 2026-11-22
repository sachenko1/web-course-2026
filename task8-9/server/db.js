import Database from 'better-sqlite3';

const db = new Database('database.sqlite');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  );
`);

if (!db.prepare('SELECT 1 FROM categories LIMIT 1').get()) {
  const ins = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
  ins.run('Еда', 'expense');
  ins.run('Транспорт', 'expense');
  ins.run('Зарплата', 'income');
}

export default db;