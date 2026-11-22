import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(fileURLToPath(new URL('../client', import.meta.url))));

const selectTx = `
  SELECT t.*, c.name AS category_name, c.type AS category_type
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
`;

const validateTx = ({ amount, category_id, date, comment }) => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return 'Сумма должна быть больше 0';
  if (!date || typeof date !== 'string' || !date.trim()) return 'Укажите дату';
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(category_id))) {
    return 'Категория не найдена';
  }
  return {
    amount: num,
    category_id: Number(category_id),
    date: date.trim(),
    comment: String(comment || '').trim()
  };
};

app.get('/categories', (req, res) => {
  try {
    res.json(db.prepare('SELECT * FROM categories ORDER BY id').all());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/categories', (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const { type } = req.body || {};
    if (!name || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Некорректные данные категории' });
    }
    const { lastInsertRowid } = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)').run(name, type);
    res.status(201).json({ id: Number(lastInsertRowid), name, type });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/transactions', (req, res) => {
  try {
    const { category_id, type, from, to } = req.query;
    const where = [];
    const params = [];
    if (category_id) { where.push('t.category_id = ?'); params.push(Number(category_id)); }
    if (type) { where.push('c.type = ?'); params.push(type); }
    if (from) { where.push('t.date >= ?'); params.push(from); }
    if (to) { where.push('t.date <= ?'); params.push(to); }
    const sql = `${selectTx} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.date DESC, t.id DESC`;
    res.json(db.prepare(sql).all(...params));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/transactions', (req, res) => {
  try {
    const data = validateTx(req.body || {});
    if (typeof data === 'string') return res.status(400).json({ error: data });
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO transactions (amount, category_id, date, comment) VALUES (?, ?, ?, ?)'
    ).run(data.amount, data.category_id, data.date, data.comment);
    res.status(201).json(db.prepare(`${selectTx} WHERE t.id = ?`).get(Number(lastInsertRowid)));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/transactions/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!db.prepare('SELECT id FROM transactions WHERE id = ?').get(id)) {
      return res.status(404).json({ error: 'Операция не найдена' });
    }
    const data = validateTx(req.body || {});
    if (typeof data === 'string') return res.status(400).json({ error: data });
    db.prepare(
      'UPDATE transactions SET amount = ?, category_id = ?, date = ?, comment = ? WHERE id = ?'
    ).run(data.amount, data.category_id, data.date, data.comment, id);
    res.json(db.prepare(`${selectTx} WHERE t.id = ?`).get(id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/transactions/:id', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM transactions WHERE id = ?').run(Number(req.params.id));
    if (!info.changes) return res.status(404).json({ error: 'Операция не найдена' });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('http://localhost:3001'));