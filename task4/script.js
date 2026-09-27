let secretNumber = '';
let attempts = [];
let isGameOver = false;

const gameForm = document.getElementById('game-form');
const guessInput = document.getElementById('guess-input');
const inputIcon = document.querySelector('.input-icon');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const historyList = document.getElementById('history-list');
const validationMsg = document.getElementById('validation-msg');
const validationText = document.getElementById('validation-text');
const attemptsCountEl = document.getElementById('attempts-count');
const emptyStateEl = document.getElementById('empty-state');
const winBanner = document.getElementById('win-banner');
const winText = document.getElementById('win-text');

document.addEventListener('contextmenu', (e) => {
  if (e.target !== guessInput) {
    e.preventDefault();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && document.activeElement !== guessInput) {
    e.preventDefault();
  }
});

function generateSecretNumber() {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = '';

  while (result.length < 4) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    result += digits.splice(randomIndex, 1)[0];
  }

  return result;
}

function validateInput(value) {
  if (!value) {
    return { valid: false, error: 'Пожалуйста, введите 4 цифры' };
  }

  if (value.length !== 4) {
    return { valid: false, error: 'Число должно состоять ровно из 4 цифр' };
  }

  if (!/^\d{4}$/.test(value)) {
    return { valid: false, error: 'Разрешены только цифры без букв и символов' };
  }

  const uniqueDigits = new Set(value.split(''));
  if (uniqueDigits.size !== 4) {
    return { valid: false, error: 'Все 4 цифры должны быть уникальными' };
  }

  return { valid: true, error: '' };
}

function calculateBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }

  return { bulls, cows };
}

function formatWord(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) {
    return many;
  }
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  return many;
}

function showValidationWarning(show, message = '') {
  if (show) {
    validationText.textContent = message;
    validationMsg.classList.add('visible');
    guessInput.classList.add('input-error');
    if (inputIcon) {
      inputIcon.style.color = 'var(--danger-color)';
    }
    guessInput.focus();
  } else {
    validationMsg.classList.remove('visible');
    guessInput.classList.remove('input-error');
    if (inputIcon) {
      inputIcon.style.color = '';
    }
  }
}

function render() {
  attemptsCountEl.textContent = attempts.length;

  if (attempts.length === 0) {
    emptyStateEl.classList.remove('hidden');
    historyList.innerHTML = '';
  } else {
    emptyStateEl.classList.add('hidden');
    historyList.innerHTML = '';

    attempts.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = `history-item ${item.bulls === 4 ? 'win-item' : ''}`;

      const leftDiv = document.createElement('div');
      leftDiv.className = 'history-left';

      const indexSpan = document.createElement('span');
      indexSpan.className = 'history-index';
      indexSpan.textContent = `#${index + 1}`;

      const guessSpan = document.createElement('span');
      guessSpan.className = 'history-guess';
      guessSpan.textContent = item.guess;

      leftDiv.appendChild(indexSpan);
      leftDiv.appendChild(guessSpan);

      const resultDiv = document.createElement('div');
      resultDiv.className = 'history-result';

      const bullsBadge = document.createElement('span');
      bullsBadge.className = 'badge badge-bulls';
      bullsBadge.textContent = `${item.bulls} ${formatWord(item.bulls, 'бык', 'быка', 'быков')}`;

      const cowsBadge = document.createElement('span');
      cowsBadge.className = 'badge badge-cows';
      cowsBadge.textContent = `${item.cows} ${formatWord(item.cows, 'корова', 'коровы', 'коров')}`;

      resultDiv.appendChild(bullsBadge);
      resultDiv.appendChild(cowsBadge);

      li.appendChild(leftDiv);
      li.appendChild(resultDiv);

      historyList.appendChild(li);
    });
  }

  if (isGameOver) {
    guessInput.disabled = true;
    submitBtn.disabled = true;
    winBanner.classList.remove('hidden');
    const wordAttempts = formatWord(attempts.length, 'попытку', 'попытки', 'попыток');
    winText.textContent = `Победа! Угадано за ${attempts.length} ${wordAttempts}`;
  } else {
    guessInput.disabled = false;
    submitBtn.disabled = false;
    winBanner.classList.add('hidden');
  }
}

function handleGuess(guessString) {
  if (isGameOver) {
    return;
  }

  const trimmed = guessString.trim();
  const validation = validateInput(trimmed);

  if (!validation.valid) {
    showValidationWarning(true, validation.error);
    return;
  }

  showValidationWarning(false);

  const { bulls, cows } = calculateBullsAndCows(secretNumber, trimmed);

  attempts.push({
    id: Date.now(),
    guess: trimmed,
    bulls,
    cows
  });

  if (bulls === 4) {
    isGameOver = true;
  }

  render();
}

function initGame() {
  secretNumber = generateSecretNumber();
  attempts = [];
  isGameOver = false;

  showValidationWarning(false);
  guessInput.value = '';
  guessInput.disabled = false;
  submitBtn.disabled = false;
  winBanner.classList.add('hidden');

  render();
  guessInput.focus();
}

gameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleGuess(guessInput.value);
  if (!isGameOver) {
    guessInput.value = '';
  }
});

guessInput.addEventListener('input', () => {
  if (validationMsg.classList.contains('visible')) {
    showValidationWarning(false);
  }
});

restartBtn.addEventListener('click', () => {
  initGame();
});

initGame();