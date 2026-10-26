const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreVal = document.getElementById('score-val');
const levelVal = document.getElementById('level-val');
const timeVal = document.getElementById('time-val');
const overlay = document.getElementById('game-overlay');
const overlayCard = document.getElementById('overlay-card');
const overlayIcon = document.getElementById('overlay-icon');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');
const playBtn = document.getElementById('play-btn');
const playBtnText = document.getElementById('play-btn-text');

const SIZE = 25;
const TILES = canvas.width / SIZE;

let snake = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let apple = { x: 0, y: 0 };
let score = 0;
let level = 1;
let seconds = 0;
let timer = null;
let isRunning = false;
let lastMove = 0;

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function spawnApple() {
  do {
    apple = { x: Math.floor(Math.random() * TILES), y: Math.floor(Math.random() * TILES) };
  } while (snake.some((s) => s.x === apple.x && s.y === apple.y));
}

function gameOver() {
  isRunning = false;
  clearInterval(timer);
  overlayCard.classList.add('danger');
  overlayIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  overlayTitle.textContent = 'Игра окончена';
  overlaySub.innerHTML = `Счёт: <strong>${score}</strong> | Время: <strong>${formatTime(seconds)}</strong>`;
  playBtnText.textContent = 'Начать заново';
  overlay.classList.remove('hidden');
}

function update(now) {
  if (!isRunning) return;

  const interval = Math.max(60, 140 - (level - 1) * 8);
  if (now - lastMove >= interval) {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES || snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === apple.x && head.y === apple.y) {
      scoreVal.textContent = ++score;
      level = Math.floor(score / 4) + 1;
      levelVal.textContent = level;
      spawnApple();
    } else {
      snake.pop();
    }
    lastMove = now;
  }
}

function draw() {
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
  for (let i = 0; i <= canvas.width; i += SIZE) {
    ctx.strokeRect(i, 0, 0, canvas.height);
    ctx.strokeRect(0, i, canvas.width, 0);
  }

  const ax = apple.x * SIZE + SIZE / 2;
  const ay = apple.y * SIZE + SIZE / 2;
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(ax - 3, ay, 7, 0, Math.PI * 2);
  ctx.arc(ax + 3, ay, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax, ay - 6);
  ctx.lineTo(ax + 2, ay - 12);
  ctx.stroke();

  snake.forEach((s, i) => {
    const x = s.x * SIZE + 2;
    const y = s.y * SIZE + 2;
    ctx.fillStyle = i === 0 ? '#3b82f6' : '#60a5fa';
    ctx.beginPath();
    ctx.roundRect(x, y, SIZE - 4, SIZE - 4, 6);
    ctx.fill();

    if (i === 0) {
      const cx = x + (SIZE - 4) / 2;
      const cy = y + (SIZE - 4) / 2;
      const ex1 = dir.x ? cx + dir.x * 3 : cx - 4;
      const ey1 = dir.y ? cy + dir.y * 3 : cy - 4;
      const ex2 = dir.x ? cx + dir.x * 3 : cx + 4;
      const ey2 = dir.y ? cy + dir.y * 3 : cy + 4;

      ctx.fillStyle = '#ffffff';
      [ [ex1, ey1], [ex2, ey2] ].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = '#060913';
      [ [ex1, ey1], [ex2, ey2] ].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.arc(ex + dir.x, ey + dir.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });
}

function loop(now) {
  update(now);
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  level = 1;
  seconds = 0;
  scoreVal.textContent = '0';
  levelVal.textContent = '1';
  timeVal.textContent = '00:00';
  overlay.classList.add('hidden');
  overlayCard.classList.remove('danger');
  spawnApple();

  clearInterval(timer);
  timer = setInterval(() => (timeVal.textContent = formatTime(++seconds)), 1000);
  isRunning = true;
  lastMove = performance.now();
}

window.addEventListener('keydown', (e) => {
  const map = {
    arrowup: [0, -1], w: [0, -1], ц: [0, -1],
    arrowdown: [0, 1], s: [0, 1], ы: [0, 1],
    arrowleft: [-1, 0], a: [-1, 0], ф: [-1, 0],
    arrowright: [1, 0], d: [1, 0], в: [1, 0]
  };
  const d = map[e.key.toLowerCase()];
  if (d && isRunning && (d[0] !== -dir.x || d[1] !== -dir.y)) {
    nextDir = { x: d[0], y: d[1] };
    e.preventDefault();
  }
});

playBtn.addEventListener('click', startGame);

snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
apple = { x: 14, y: 10 };
requestAnimationFrame(loop);