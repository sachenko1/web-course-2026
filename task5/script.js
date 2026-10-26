let sequence = [];
let playerStep = 0;
let level = 0;
let isAcceptingInput = false;
let timeoutIds = [];

const FREQUENCIES = [329.63, 261.63, 220.0, 164.81];
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

const startBtn = document.getElementById('start-btn');
const startBtnText = document.getElementById('start-btn-text');
const levelCountEl = document.getElementById('level-count');
const statusBanner = document.getElementById('status-banner');
const statusText = document.getElementById('status-text');
const simonBoard = document.getElementById('simon-board');
const simonBtns = document.querySelectorAll('.simon-btn');

function playTone(freq, duration = 300) {
  try {
    if (!audioCtx && AudioContextClass) audioCtx = new AudioContextClass();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
  } catch (e) {}
}

function delay(ms) {
  return new Promise((resolve) => {
    const id = setTimeout(() => {
      timeoutIds = timeoutIds.filter((t) => t !== id);
      resolve();
    }, ms);
    timeoutIds.push(id);
  });
}

function clearTimers() {
  timeoutIds.forEach(clearTimeout);
  timeoutIds = [];
}

function setButtonsDisabled(disabled) {
  simonBtns.forEach((btn) => (btn.disabled = disabled));
}

function flashButton(index, duration = 500) {
  const btn = document.querySelector(`.simon-btn[data-index="${index}"]`);
  if (!btn) return;
  btn.classList.add('active');
  playTone(FREQUENCIES[index], duration);
  setTimeout(() => btn.classList.remove('active'), duration);
}

async function playSequence() {
  isAcceptingInput = false;
  setButtonsDisabled(true);
  startBtn.disabled = true;

  await delay(600);

  for (let i = 0; i < sequence.length; i++) {
    flashButton(sequence[i], 500);
    await delay(750);
  }

  isAcceptingInput = true;
  setButtonsDisabled(false);
  startBtn.disabled = false;
}

function nextRound() {
  playerStep = 0;
  level = sequence.length + 1;
  levelCountEl.textContent = level;
  sequence.push(Math.floor(Math.random() * 4));
  playSequence();
}

function gameOver() {
  clearTimers();
  isAcceptingInput = false;
  setButtonsDisabled(true);
  startBtn.disabled = false;
  startBtnText.textContent = 'Играть снова';

  simonBoard.classList.remove('board-shake');
  void simonBoard.offsetWidth;
  simonBoard.classList.add('board-shake');

  statusBanner.classList.remove('hidden');
  statusText.textContent = `Игра окончена! Вы дошли до уровня ${level}`;
  playTone(110, 600);
}

function handleInput(index) {
  if (!isAcceptingInput) return;

  flashButton(index, 300);

  if (index !== sequence[playerStep]) {
    gameOver();
    return;
  }

  playerStep++;

  if (playerStep === sequence.length) {
    isAcceptingInput = false;
    setButtonsDisabled(true);
    delay(800).then(nextRound);
  }
}

function startGame() {
  clearTimers();
  simonBoard.classList.remove('board-shake');
  statusBanner.classList.add('hidden');
  startBtnText.textContent = 'Рестарт';

  sequence = [];
  nextRound();
}

startBtn.addEventListener('click', startGame);

simonBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    handleInput(parseInt(btn.dataset.index, 10));
  });
});