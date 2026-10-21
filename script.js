const EMOJIS = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮"];
let cols = 4, rows = 3, total = 6;
let cards = [], first = null, lock = false, matched = 0, moves = 0, secs = 0, timer = null, started = false, diff = 'easy';
const board = document.getElementById('board');
const timeEl = document.getElementById('time');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const bestEl = document.getElementById('best');
const winEl = document.getElementById('win');

function setDiff(d) {
  diff = d;
  if (d === 'easy') { cols = 4; rows = 3; total = 6; }
  else if (d === 'mid') { cols = 4; rows = 4; total = 8; }
  else { cols = 6; rows = 4; total = 12; }
  build();
}

document.querySelectorAll('.difficulty button').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.difficulty button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    setDiff(b.dataset.d);
  };
});

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function loadBest() { return localStorage.getItem('mem_best_' + diff) || '--'; }
function saveBest() {
  const b = localStorage.getItem('mem_best_' + diff);
  if (!b || secs < +b) localStorage.setItem('mem_best_' + diff, secs);
}

function sparkle(x, y) {
  const colors = ['#ff69b4','#8a2be2','#32cd32','#ffd700','#00ffff'];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('div'); s.className = 'spark';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.background = colors[i % colors.length];
    s.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    s.style.setProperty('--dy', (Math.random() * 160 - 80) + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

function build() {
  clearInterval(timer); timer = null; secs = 0; started = false;
  moves = 0; matched = 0; first = null; lock = false;
  timeEl.textContent = '0s'; movesEl.textContent = '0';
  pairsEl.textContent = '0/' + total;
  bestEl.textContent = loadBest();
  winEl.classList.remove('show');
  board.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
  board.innerHTML = '';
  const picks = shuffle(EMOJIS.slice()).slice(0, total);
  cards = shuffle(picks.concat(picks));
  cards.forEach(sym => {
    const c = document.createElement('div'); c.className = 'card';
    c.innerHTML = '<div class="face back">❓</div><div class="face front">' + sym + '</div>';
    c.onclick = () => flip(c, sym);
    board.appendChild(c);
  });
}

function flip(c, sym) {
  if (lock || c.classList.contains('flipped') || c.classList.contains('matched')) return;
  if (!started) {
    started = true;
    timer = setInterval(() => { secs++; timeEl.textContent = secs + 's'; }, 1000);
  }
  c.classList.add('flipped');
  if (!first) { first = { c: c, sym: sym }; return; }
  moves++; movesEl.textContent = moves; lock = true;
  if (first.sym === sym) {
    c.classList.add('matched'); first.c.classList.add('matched');
    matched++; pairsEl.textContent = matched + '/' + total;
    const r = c.getBoundingClientRect();
    sparkle(r.left + r.width / 2, r.top + r.height / 2);
    first = null; lock = false;
    if (matched === total) {
      clearInterval(timer);
      saveBest();
      document.getElementById('winTime').textContent = secs + 's';
      document.getElementById('winMoves').textContent = moves;
      document.getElementById('winBest').textContent = loadBest() + 's';
      setTimeout(() => winEl.classList.add('show'), 500);
    }
  } else {
    setTimeout(() => {
      c.classList.remove('flipped');
      first.c.classList.remove('flipped');
      first = null; lock = false;
    }, 800);
  }
}

function closeWin() { winEl.classList.remove('show'); build(); }

bestEl.textContent = loadBest();
setDiff('easy');
