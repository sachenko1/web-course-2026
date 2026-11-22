import { getCategories, createCategory, getTransactions, createTransaction, updateTransaction, deleteTransaction } from './api.js';
import { showError, renderFormCategories, renderFilterCategories, renderSummary, renderTransactions } from './ui.js';

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'zen_money_ui';

let categories = [];
let transactions = [];
let editId = null;

const prefs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"theme":"dark","filters":{}}');
const savePrefs = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

const syncTypeButtons = type => {
  document.querySelectorAll('#filter-type .seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === (type || ''));
  });
};

const applyPrefs = () => {
  document.documentElement.dataset.theme = prefs.theme || 'dark';
  const f = prefs.filters || {};
  syncTypeButtons(f.type || '');
  $('filter-from').value = f.from || '';
  $('filter-to').value = f.to || '';
};

const resetEdit = () => {
  editId = null;
  $('form-title').textContent = 'Новая операция';
  $('tx-submit').textContent = 'Добавить';
  $('cancel-edit').classList.add('hidden');
  $('tx-amount').value = '';
  $('tx-comment').value = '';
  $('tx-date').value = new Date().toISOString().slice(0, 10);
};

const loadTransactions = async () => {
  try {
    showError('');
    transactions = await getTransactions(prefs.filters);
    renderSummary(transactions);
    renderTransactions(transactions);
  } catch (e) {
    showError(e.message);
  }
};

const init = async () => {
  applyPrefs();
  $('tx-date').value = new Date().toISOString().slice(0, 10);
  try {
    categories = await getCategories();
    renderFormCategories(categories, $('tx-type').value);
    prefs.filters.category_id = renderFilterCategories(categories, prefs.filters?.type, prefs.filters?.category_id);
    await loadTransactions();
  } catch (e) {
    showError(e.message);
  }
};

$('toggle-cat').addEventListener('click', () => $('cat-form').classList.toggle('hidden'));
$('tx-type').addEventListener('change', e => renderFormCategories(categories, e.target.value));

$('tx-form').addEventListener('submit', async e => {
  e.preventDefault();
  const amount = Number($('tx-amount').value);
  const category_id = Number($('tx-category').value);
  const date = $('tx-date').value;
  const comment = $('tx-comment').value.trim();

  if (!amount || amount <= 0 || !category_id || !date) {
    return showError('Заполните сумму (> 0), категорию и дату');
  }

  try {
    showError('');
    const payload = { amount, category_id, date, comment };
    if (editId) await updateTransaction(editId, payload);
    else await createTransaction(payload);
    resetEdit();
    await loadTransactions();
  } catch (err) {
    showError(err.message);
  }
});

$('cancel-edit').addEventListener('click', resetEdit);

$('cat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = $('cat-name').value.trim();
  const type = $('cat-type').value;
  if (!name) return showError('Введите название категории');

  try {
    showError('');
    const created = await createCategory({ name, type });
    $('cat-name').value = '';
    $('cat-form').classList.add('hidden');
    categories = await getCategories();
    $('tx-type').value = type;
    renderFormCategories(categories, type);
    $('tx-category').value = created.id;
    renderFilterCategories(categories, prefs.filters?.type, $('filter-category').value);
  } catch (err) {
    showError(err.message);
  }
});

$('tx-list').addEventListener('click', async e => {
  const delId = e.target.dataset.del;
  const updId = e.target.dataset.edit;

  if (delId) {
    try {
      showError('');
      await deleteTransaction(delId);
      if (editId === Number(delId)) resetEdit();
      await loadTransactions();
    } catch (err) {
      showError(err.message);
    }
  }

  if (updId) {
    const t = transactions.find(item => item.id === Number(updId));
    if (!t) return;
    editId = t.id;
    $('form-title').textContent = 'Редактирование';
    $('tx-submit').textContent = 'Сохранить';
    $('cancel-edit').classList.remove('hidden');
    $('tx-type').value = t.category_type;
    renderFormCategories(categories, t.category_type);
    $('tx-category').value = t.category_id;
    $('tx-amount').value = t.amount;
    $('tx-date').value = t.date;
    $('tx-comment').value = t.comment || '';
  }
});

$('filter-type').addEventListener('click', e => {
  const btn = e.target.closest('.seg-btn');
  if (!btn) return;
  const type = btn.dataset.type;
  syncTypeButtons(type);
  prefs.filters.type = type;
  prefs.filters.category_id = renderFilterCategories(categories, type, $('filter-category').value);
  savePrefs();
  loadTransactions();
});

['filter-category', 'filter-from', 'filter-to'].forEach(id => {
  $(id).addEventListener('change', () => {
    prefs.filters = {
      type: prefs.filters?.type || '',
      category_id: $('filter-category').value,
      from: $('filter-from').value,
      to: $('filter-to').value
    };
    savePrefs();
    loadTransactions();
  });
});

$('reset-filters').addEventListener('click', () => {
  prefs.filters = {};
  applyPrefs();
  renderFilterCategories(categories, '', '');
  savePrefs();
  loadTransactions();
});

$('theme-btn').addEventListener('click', () => {
  prefs.theme = prefs.theme === 'light' ? 'dark' : 'light';
  savePrefs();
  applyPrefs();
});

init();