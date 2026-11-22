const $ = id => document.getElementById(id);
const fmt = n => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const EDIT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>';
const DEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

const opts = list => list.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

export const showError = msg => {
  const box = $('error-box');
  box.textContent = msg;
  box.classList.toggle('hidden', !msg);
};

export const renderFormCategories = (categories, formType) => {
  $('tx-category').innerHTML = opts(categories.filter(c => c.type === formType));
};

export const renderFilterCategories = (categories, filterType = '', selectedId = '') => {
  const el = $('filter-category');
  if (filterType) {
    el.innerHTML = '<option value="">Все категории</option>' + opts(categories.filter(c => c.type === filterType));
  } else {
    const exp = categories.filter(c => c.type === 'expense');
    const inc = categories.filter(c => c.type === 'income');
    el.innerHTML = '<option value="">Все категории</option>' +
      (exp.length ? `<optgroup label="Расходы">${opts(exp)}</optgroup>` : '') +
      (inc.length ? `<optgroup label="Доходы">${opts(inc)}</optgroup>` : '');
  }
  el.value = selectedId;
  if (el.value !== String(selectedId)) el.value = '';
  return el.value;
};

export const renderSummary = transactions => {
  const income = transactions.filter(t => t.category_type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.category_type === 'expense').reduce((s, t) => s + t.amount, 0);
  $('income-val').textContent = fmt(income);
  $('expense-val').textContent = fmt(expense);
  $('balance-val').textContent = fmt(income - expense);
};

export const renderTransactions = transactions => {
  const list = $('tx-list');
  if (!transactions.length) {
    list.innerHTML = '<div class="empty">Операций не найдено</div>';
    return;
  }
  list.innerHTML = transactions.map(t => {
    const type = t.category_type;
    return `
      <article class="tx-item">
        <div class="tx-left">
          <span class="tx-dot ${type}"></span>
          <div class="tx-meta">
            <span class="tx-title">${esc(t.category_name)}</span>
            <span class="tx-sub">${esc(t.date)}${t.comment ? ` · ${esc(t.comment)}` : ''}</span>
          </div>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${type}">${type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
          <button type="button" class="icon-btn" data-edit="${t.id}" aria-label="Редактировать">${EDIT_SVG}</button>
          <button type="button" class="icon-btn del" data-del="${t.id}" aria-label="Удалить">${DEL_SVG}</button>
        </div>
      </article>
    `;
  }).join('');
};