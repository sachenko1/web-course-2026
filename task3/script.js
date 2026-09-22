let todos = [];
let currentFilter = 'all';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const validationMsg = document.getElementById('validation-msg');
const countRemainingEl = document.getElementById('count-remaining');
const countCompletedEl = document.getElementById('count-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const filterGlider = document.getElementById('filter-glider');
const emptyStateEl = document.getElementById('empty-state');

document.addEventListener('contextmenu', (e) => {
  if (e.target !== todoInput) {
    e.preventDefault();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && document.activeElement !== todoInput) {
    e.preventDefault();
  }
});

function updateFilterGlider() {
  const activeBtn = document.querySelector('.filter-btn.active');
  if (activeBtn && filterGlider) {
    filterGlider.style.width = `${activeBtn.offsetWidth}px`;
    filterGlider.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }
}

function showValidationWarning(show, message = '') {
  if (show) {
    const textSpan = validationMsg.querySelector('span');
    if (textSpan) {
      textSpan.textContent = message;
    }
    validationMsg.classList.add('visible');
    todoInput.classList.add('input-error');
    todoInput.focus();
  } else {
    validationMsg.classList.remove('visible');
    todoInput.classList.remove('input-error');
  }
}

function addTodo(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    showValidationWarning(true, 'Пожалуйста, введите текст задачи');
    return false;
  }

  const isDuplicate = todos.some(
    todo => todo.text.toLowerCase() === trimmed.toLowerCase()
  );

  if (isDuplicate) {
    showValidationWarning(true, 'Такая задача уже есть в списке');
    return false;
  }

  showValidationWarning(false);

  const newTodo = {
    id: Date.now(),
    text: trimmed,
    completed: false
  };

  todos.push(newTodo);
  render();
  return true;
}

function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  render();
}

function deleteTodoWithAnimation(id, liElement) {
  liElement.classList.add('removing');
  
  setTimeout(() => {
    todos = todos.filter(todo => todo.id !== id);
    render();
  }, 280);
}

function setFilter(filterType) {
  currentFilter = filterType;

  filterBtns.forEach(btn => {
    if (btn.dataset.filter === filterType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  updateFilterGlider();
  render();
}

function updateCounters() {
  const completed = todos.filter(t => t.completed).length;
  const remaining = todos.length - completed;

  countRemainingEl.textContent = remaining;
  countCompletedEl.textContent = completed;
}

function createTodoElement(todo, isVisible) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = String(todo.id);

  if (!isVisible) {
    li.style.display = 'none';
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'todo-content';

  const checkboxWrapper = document.createElement('label');
  checkboxWrapper.className = 'custom-checkbox-wrapper';
  checkboxWrapper.setAttribute('title', 'Отметить как выполненное');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.setAttribute('aria-label', `Отметить задачу "${todo.text}"`);

  checkbox.addEventListener('change', () => {
    toggleTodo(todo.id);
  });

  const checkMarkBox = document.createElement('div');
  checkMarkBox.className = 'checkbox-box';
  checkMarkBox.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkMarkBox);

  const textSpan = document.createElement('span');
  textSpan.className = 'todo-text';
  textSpan.textContent = todo.text;

  contentWrapper.appendChild(checkboxWrapper);
  contentWrapper.appendChild(textSpan);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('title', 'Удалить задачу');
  deleteBtn.setAttribute('aria-label', `Удалить задачу "${todo.text}"`);

  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;

  deleteBtn.addEventListener('click', () => {
    deleteTodoWithAnimation(todo.id, li);
  });

  li.appendChild(contentWrapper);
  li.appendChild(deleteBtn);

  return li;
}

function render() {
  if (todos.length === 0) {
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
  }

  const existingElements = Array.from(todoList.children);
  const existingMap = new Map();
  existingElements.forEach(el => {
    existingMap.set(el.dataset.id, el);
  });

  const activeIds = new Set(todos.map(t => String(t.id)));

  existingElements.forEach(el => {
    if (!activeIds.has(el.dataset.id)) {
      el.remove();
    }
  });

  todos.forEach(todo => {
    const isVisible =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !todo.completed) ||
      (currentFilter === 'completed' && todo.completed);

    const strId = String(todo.id);

    if (existingMap.has(strId)) {
      const el = existingMap.get(strId);
      el.style.display = isVisible ? '' : 'none';

      if (todo.completed) {
        el.classList.add('completed');
      } else {
        el.classList.remove('completed');
      }

      const cb = el.querySelector('input[type="checkbox"]');
      if (cb && cb.checked !== todo.completed) {
        cb.checked = todo.completed;
      }
    } else {
      const newEl = createTodoElement(todo, isVisible);
      todoList.appendChild(newEl);
    }
  });

  updateCounters();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (addTodo(todoInput.value)) {
    todoInput.value = '';
  }
});

todoInput.addEventListener('input', () => {
  if (validationMsg.classList.contains('visible')) {
    showValidationWarning(false);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

window.addEventListener('resize', updateFilterGlider);

render();
updateFilterGlider();