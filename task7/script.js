const postsContainer = document.getElementById('posts-container');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading-indicator');
const endMessage = document.getElementById('end-message');
const emptySearchMessage = document.getElementById('empty-search-message');
const errorBanner = document.getElementById('error-banner');
const errorText = document.getElementById('error-text');

const PAGE_SIZE = 10;
const TOTAL_POSTS = 100;
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

let allPosts = [];
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let searchQuery = '';
let debounceTimer = null;

function createPostElement(post) {
  const card = document.createElement('article');
  card.className = 'post-card';

  const meta = document.createElement('div');
  meta.className = 'post-meta';

  const authorBadge = document.createElement('span');
  authorBadge.className = 'meta-badge badge-author';
  authorBadge.textContent = `Автор #${post.userId}`;

  const idBadge = document.createElement('span');
  idBadge.className = 'meta-badge badge-id';
  idBadge.textContent = `#${post.id}`;

  meta.appendChild(authorBadge);
  meta.appendChild(idBadge);

  const title = document.createElement('h2');
  title.className = 'post-title';
  title.textContent = post.title;

  const body = document.createElement('p');
  body.className = 'post-body';
  body.textContent = post.body;

  card.appendChild(meta);
  card.appendChild(title);
  card.appendChild(body);

  return card;
}

function renderAllPosts() {
  const filtered = allPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  postsContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();
  filtered.forEach((post) => {
    fragment.appendChild(createPostElement(post));
  });
  postsContainer.appendChild(fragment);

  updateStatusMessages(filtered.length);
}

function appendNewPosts(newPosts) {
  const fragment = document.createDocumentFragment();

  newPosts.forEach((post) => {
    if (!searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      fragment.appendChild(createPostElement(post));
    }
  });

  postsContainer.appendChild(fragment);
  updateStatusMessages(postsContainer.children.length);
}

function updateStatusMessages(visibleCount) {
  if (visibleCount === 0 && allPosts.length > 0 && searchQuery) {
    emptySearchMessage.classList.remove('hidden');
  } else {
    emptySearchMessage.classList.add('hidden');
  }

  if (!hasMore && !searchQuery) {
    endMessage.classList.remove('hidden');
  } else {
    endMessage.classList.add('hidden');
  }
}

async function loadPosts() {
  if (isLoading || !hasMore) return;

  isLoading = true;
  loadingIndicator.classList.remove('hidden');
  errorBanner.classList.add('hidden');

  try {
    const response = await fetch(`${API_URL}?_page=${currentPage}&_limit=${PAGE_SIZE}`);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const posts = await response.json();

    if (posts.length === 0 || allPosts.length + posts.length >= TOTAL_POSTS) {
      hasMore = false;
    }

    allPosts = [...allPosts, ...posts];
    currentPage++;

    appendNewPosts(posts);
  } catch (err) {
    errorText.textContent = `Сбой сети: ${err.message}. Проверьте подключение.`;
    errorBanner.classList.remove('hidden');
  } finally {
    isLoading = false;
    loadingIndicator.classList.add('hidden');
  }
}

function handleScroll() {
  if (searchQuery) return;

  const scrollBottom =
    document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);

  if (scrollBottom <= 200 && !isLoading && hasMore) {
    loadPosts();
  }
}

searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderAllPosts();
  }, 300);
});

window.addEventListener('scroll', handleScroll);

loadPosts();