/**
 * MERGE TROLL – game.js
 * Jogo de merge estilo 2048 com estilingue e tabuleiro 5×5
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   CONSTANTES
   ════════════════════════════════════════════════════════════ */
const ROWS  = 5;
const COLS  = 5;
const VALUES = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
const WIN_VALUE = 2048;

// Probabilidades de spawn (quanto menor o jogo, mais baixos os valores)
function pickValue(score) {
  const w = score < 200 ? [70,25,5,0,0] : score < 800 ? [50,30,15,4,1] : [35,30,20,10,5];
  const pool = [];
  w.forEach((wt, i) => { for (let j=0;j<wt;j++) pool.push(VALUES[i]); });
  return pool[Math.floor(Math.random()*pool.length)];
}

/* ════════════════════════════════════════════════════════════
   ESTADO GLOBAL
   ════════════════════════════════════════════════════════════ */
let grid = [];            // grid[row][col] = valor | 0
let score = 0;
let bestScore = 0;
let level = 1;
let currentVal = 2;
let nextVal    = 2;
let paused     = false;
let gameOver   = false;
let won        = false;
let continueAfterWin = false;
let undoState  = null;   // snapshot para desfazer 1 jogada
let swapCount  = 3;      // trocas disponíveis por sessão

/* ════════════════════════════════════════════════════════════
   DOM REFS
   ════════════════════════════════════════════════════════════ */
const screens = {
  loading: document.getElementById('loading-screen'),
  menu:    document.getElementById('menu-screen'),
  game:    document.getElementById('game-screen'),
};
const boardEl     = document.getElementById('board');
const hudStars    = document.getElementById('hud-stars');
const hudLevel    = document.getElementById('hud-level');
const slingBall   = document.getElementById('sling-ball');
const slingVal    = document.getElementById('sling-val');
const nextValEl   = document.getElementById('next-val');
const loadingBar  = document.getElementById('loading-bar');
const bestScoreEl = document.getElementById('best-score');
const colIndicators = document.getElementById('col-indicators');

/* ════════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════════ */
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ════════════════════════════════════════════════════════════
   LOADING
   ════════════════════════════════════════════════════════════ */
function runLoading() {
  showScreen('loading');
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 5;
    if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(showMenu, 400); }
    loadingBar.style.width = pct + '%';
  }, 220);
}

function showMenu() {
  bestScore = +(localStorage.getItem('mergeTrollBest') || 0);
  bestScoreEl.textContent = bestScore;
  showScreen('menu');
}

/* ════════════════════════════════════════════════════════════
   INICIALIZAÇÃO DO JOGO
   ════════════════════════════════════════════════════════════ */
function initGame() {
  grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  score = 0; level = 1; gameOver = false; won = false; continueAfterWin = false;
  swapCount = 3; undoState = null;
  currentVal = pickValue(0);
  nextVal    = pickValue(0);
  updateSlingball();
  updateHUD();
  renderBoard();
  positionColIndicators();
  showScreen('game');
  hideOverlay('pause-overlay');
  hideOverlay('gameover-overlay');
  hideOverlay('win-overlay');
}

/* ════════════════════════════════════════════════════════════
   RENDER
   ════════════════════════════════════════════════════════════ */
function renderBoard(mergedCells = []) {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.col = c;
      cell.dataset.row = r;

      const v = grid[r][c];
      if (v) {
        const tile = document.createElement('div');
        tile.className = 'tile ' + tileClass(v);
        if (mergedCells.find(m => m.r===r && m.c===c)) tile.classList.add('merging');
        tile.textContent = v >= 2048 ? formatBig(v) : v;
        cell.appendChild(tile);
        cell.classList.add('filled');
      }

      cell.addEventListener('click',   () => dropInColumn(c));
      cell.addEventListener('touchend', e => { e.preventDefault(); dropInColumn(c); });
      boardEl.appendChild(cell);
    }
  }
}

function tileClass(v) {
  if (v <= 2048) return 't-' + v;
  return 't-big';
}
function formatBig(v) {
  if (v >= 1000000) return (v/1000000).toFixed(1)+'M';
  if (v >= 1000)    return (v/1000).toFixed(1)+'K';
  return v;
}

function updateHUD() {
  hudStars.textContent  = score;
  hudLevel.textContent  = level;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('mergeTrollBest', bestScore);
  }
}

function updateSlingball() {
  slingVal.textContent  = currentVal;
  nextValEl.textContent = nextVal;
  // cor dinâmica da bola
  const colors = {
    2:'#E53935',4:'#C2185B',8:'#7B1FA2',16:'#1565C0',
    32:'#1B5E20',64:'#E65100',128:'#BF360C',256:'#006064',
    512:'#2E7D32',1024:'#BF360C',2048:'#FF6F00'
  };
  const col = colors[currentVal] || '#6A1B9A';
  slingBall.style.background = `radial-gradient(circle at 35% 35%, ${col}88, ${col})`;
  slingVal.style.color = 'white';
}

/* ════════════════════════════════════════════════════════════
   COLUMN INDICATORS (botões invisíveis sobre o tabuleiro)
   ════════════════════════════════════════════════════════════ */
function positionColIndicators() {
  const bf = document.querySelector('.board-frame');
  if (!bf) return;
  const rect = bf.getBoundingClientRect();
  colIndicators.style.cssText = `
    position:fixed; top:${rect.top}px; left:${rect.left}px;
    width:${rect.width}px; height:${rect.height}px;
    display:flex; pointer-events:none; z-index:25;
  `;
  colIndicators.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const btn = document.createElement('button');
    btn.className = 'col-btn';
    btn.dataset.col = c;
    btn.style.flex = '1';
    btn.style.pointerEvents = 'all';
    btn.addEventListener('click',    () => dropInColumn(c));
    btn.addEventListener('touchend', e => { e.preventDefault(); dropInColumn(c); });
    btn.addEventListener('mouseenter', () => highlightCol(c));
    btn.addEventListener('mouseleave', () => clearHighlight());
    btn.addEventListener('touchstart', e => { e.preventDefault(); highlightCol(c); });
    colIndicators.appendChild(btn);
  }
}

function highlightCol(c) {
  [...colIndicators.children].forEach((b,i) => {
    b.classList.toggle('highlighted', i===c);
  });
}
function clearHighlight() {
  [...colIndicators.children].forEach(b => b.classList.remove('highlighted'));
}

/* ════════════════════════════════════════════════════════════
   MECÂNICA PRINCIPAL – SOLTAR BLOCO NA COLUNA
   ════════════════════════════════════════════════════════════ */
function dropInColumn(col) {
  if (paused || gameOver) return;

  // Salva estado para undo
  undoState = { grid: grid.map(r=>[...r]), score, currentVal, nextVal, level };

  // Encontra a linha disponível mais baixa
  let row = -1;
  for (let r = ROWS-1; r >= 0; r--) {
    if (grid[r][col] === 0) { row = r; break; }
  }
  if (row < 0) { shakeColumn(col); return; } // coluna cheia

  grid[row][col] = currentVal;

  // Animação de queda
  animateDrop(row, col, () => {
    const merges = applyGravityAndMerge();
    score += calcPoints(merges);
    updateHUD();
    checkLevelUp();

    const merged = merges.flat();
    renderBoard(merged);

    // Avança projétil
    currentVal = nextVal;
    nextVal = pickValue(score);
    updateSlingball();

    if (!continueAfterWin && hasValue(WIN_VALUE)) { triggerWin(); return; }
    if (isBoardFull()) { triggerGameOver(); return; }
  });
}

function animateDrop(row, col, cb) {
  // Renderiza imediatamente e chama callback
  renderBoard();
  // pequena animação visual: pisca a célula
  const cells = boardEl.querySelectorAll('.cell');
  const idx = row * COLS + col;
  if (cells[idx]) {
    cells[idx].style.transform = 'scale(1.2)';
    setTimeout(() => { cells[idx] && (cells[idx].style.transform=''); }, 150);
  }
  setTimeout(cb, 160);
}

/* ════════════════════════════════════════════════════════════
   GRAVITY + MERGE (colunas, de baixo para cima)
   ════════════════════════════════════════════════════════════ */
function applyGravityAndMerge() {
  const allMerges = [];
  let changed = true;
  while (changed) {
    changed = false;
    // 1. Gravity: tiles caem para baixo em cada coluna
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = 0; r < ROWS; r++) if (grid[r][c]) col.push(grid[r][c]);
      for (let r = 0; r < ROWS; r++) {
        const fill = r < ROWS - col.length ? 0 : col[r - (ROWS - col.length)];
        if (grid[r][c] !== fill) changed = true;
        grid[r][c] = fill;
      }
    }
    // 2. Merge: colunas, de baixo para cima
    for (let c = 0; c < COLS; c++) {
      for (let r = ROWS-1; r > 0; r--) {
        if (grid[r][c] && grid[r][c] === grid[r-1][c]) {
          const newVal = grid[r][c] * 2;
          grid[r][c] = newVal;
          grid[r-1][c] = 0;
          allMerges.push({r, c, val: newVal});
          changed = true;
        }
      }
    }
  }
  return allMerges;
}

function calcPoints(merges) {
  return merges.reduce((s, m) => s + m.val, 0);
}

/* ════════════════════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════════════════════ */
function isBoardFull() {
  for (let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!grid[r][c]) return false;
  return true;
}
function hasValue(v) {
  for (let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(grid[r][c]===v) return true;
  return false;
}
function checkLevelUp() {
  const thresholds = [0,200,600,1500,3500,8000,20000,50000];
  for (let i=thresholds.length-1;i>=0;i--) {
    if (score >= thresholds[i] && level < i+1) { level = i+1; hudLevel.textContent = level; break; }
  }
}
function shakeColumn(col) {
  const cells = [...boardEl.querySelectorAll('.cell')].filter(c => +c.dataset.col === col);
  cells.forEach(c => {
    c.style.animation = 'none';
    c.offsetHeight; // reflow
    c.style.animation = 'shake .4s ease';
  });
  // inject keyframes once
  if (!document.querySelector('#shakeKF')) {
    const st = document.createElement('style');
    st.id = 'shakeKF';
    st.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}';
    document.head.appendChild(st);
  }
}

/* ════════════════════════════════════════════════════════════
   PARTÍCULAS E EFEITOS
   ════════════════════════════════════════════════════════════ */
function spawnParticles(x, y, color='#FFD700', count=10) {
  for (let i=0;i<count;i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random()*10+5;
    const angle = Math.random()*360;
    const dist  = Math.random()*80+30;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${x}px;top:${y}px;
      background:${color};
      --dx:${Math.cos(angle)*dist}px;
      --dy:${Math.sin(angle)*dist}px;
    `;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 800);
  }
}

function spawnScorePopup(x, y, pts) {
  const el = document.createElement('div');
  el.className = 'score-popup';
  el.textContent = '+' + pts + '⭐';
  el.style.cssText = `left:${x-20}px;top:${y}px;`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1000);
}

/* ════════════════════════════════════════════════════════════
   WIN / GAME OVER
   ════════════════════════════════════════════════════════════ */
function triggerWin() {
  won = true;
  document.getElementById('win-tile').textContent  = WIN_VALUE;
  document.getElementById('win-score').textContent = score;
  showOverlay('win-overlay');
  spawnParticles(window.innerWidth/2, window.innerHeight/3, '#FFD700', 25);
}

function triggerGameOver() {
  gameOver = true;
  document.getElementById('go-score').textContent = score;
  document.getElementById('go-best').textContent  = bestScore;
  showOverlay('gameover-overlay');
}

function showOverlay(id)  { document.getElementById(id).classList.remove('hidden'); }
function hideOverlay(id)  { document.getElementById(id).classList.add('hidden'); }

/* ════════════════════════════════════════════════════════════
   BOTÕES
   ════════════════════════════════════════════════════════════ */
// Menu → Jogar
document.getElementById('btn-play').addEventListener('click', initGame);

// Pause
document.getElementById('btn-pause').addEventListener('click', () => {
  paused = true; showOverlay('pause-overlay');
});
document.getElementById('btn-resume').addEventListener('click', () => {
  paused = false; hideOverlay('pause-overlay');
});
document.getElementById('btn-menu-pause').addEventListener('click', () => {
  hideOverlay('pause-overlay'); showMenu();
});

// Game Over
document.getElementById('btn-restart').addEventListener('click', initGame);
document.getElementById('btn-menu-go').addEventListener('click', () => {
  hideOverlay('gameover-overlay'); showMenu();
});

// Win
document.getElementById('btn-next').addEventListener('click', () => {
  continueAfterWin = true; won = false; hideOverlay('win-overlay');
});
document.getElementById('btn-menu-win').addEventListener('click', () => {
  hideOverlay('win-overlay'); showMenu();
});

// Undo
document.getElementById('btn-undo').addEventListener('click', () => {
  if (!undoState || gameOver) return;
  grid       = undoState.grid;
  score      = undoState.score;
  currentVal = undoState.currentVal;
  nextVal    = undoState.nextVal;
  level      = undoState.level;
  undoState  = null;
  updateHUD(); updateSlingball(); renderBoard();
});

// Swap
document.getElementById('btn-swap').addEventListener('click', () => {
  if (swapCount <= 0) return;
  [currentVal, nextVal] = [nextVal, currentVal];
  swapCount--;
  updateSlingball();
  document.getElementById('btn-swap').title = `Trocar (${swapCount} restantes)`;
  if (swapCount === 0) document.getElementById('btn-swap').style.opacity = '.4';
});

/* ════════════════════════════════════════════════════════════
   KEYBOARD SUPPORT (PC)
   ════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (!screens.game.classList.contains('active') || paused || gameOver) return;
  const key = e.key;
  const numMap = {'1':0,'2':1,'3':2,'4':3,'5':4};
  if (numMap[key] !== undefined) dropInColumn(numMap[key]);
  if (key === 'Escape') document.getElementById('btn-pause').click();
  if (key === 'z' || key === 'Z') document.getElementById('btn-undo').click();
  if (key === 's' || key === 'S') document.getElementById('btn-swap').click();
});

/* ════════════════════════════════════════════════════════════
   SWIPE / DRAG PARA SELECIONAR COLUNA (mobile)
   ════════════════════════════════════════════════════════════ */
let touchStartX = 0;
boardEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, {passive:true});

boardEl.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 10) return; // tap, não swipe
}, {passive:true});

/* ════════════════════════════════════════════════════════════
   REPOSITION on resize
   ════════════════════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  if (screens.game.classList.contains('active')) positionColIndicators();
});

/* ════════════════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════════════════ */
runLoading();
