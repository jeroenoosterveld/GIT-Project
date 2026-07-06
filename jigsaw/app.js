(function () {
  'use strict';

  const state = {
    image: null,
    rows: 4,
    cols: 4,
    cellW: 0,
    cellH: 0,
    boardW: 0,
    boardH: 0,
    grid: [],
    groups: [],
    nextGroupId: 1,
    playing: false,
    timerInterval: null,
    startTime: null,
    selectedGroupId: null,
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const photoInput = $('#photo-input');
  const previewImg = $('#preview-img');
  const photoPlaceholder = $('.photo-placeholder');
  const startBtn = $('#start-btn');
  const sizeHint = $('#size-hint');
  const setupScreen = $('#setup-screen');
  const gameScreen = $('#game-screen');
  const boardEl = $('#board');
  const groupCountEl = $('#group-count');
  const timerEl = $('#timer');
  const winOverlay = $('#win-overlay');
  const winStats = $('#win-stats');
  const sliceCanvas = $('#slice-canvas');

  function init() {
    photoInput.addEventListener('change', onPhotoSelected);
    $$('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => selectSize(
        parseInt(btn.dataset.rows, 10),
        parseInt(btn.dataset.cols, 10)
      ));
    });
    startBtn.addEventListener('click', startGame);
    $('#back-btn').addEventListener('click', goToSetup);
    $('#shuffle-btn').addEventListener('click', () => state.playing && scatterGroups(true));
    $('#play-again-btn').addEventListener('click', () => {
      winOverlay.hidden = true;
      state.playing = true;
      scatterGroups(true);
      startTimer();
    });
    $('#new-photo-btn').addEventListener('click', () => {
      winOverlay.hidden = true;
      goToSetup();
    });

    boardEl.addEventListener('click', onBoardClick);
  }

  function onPhotoSelected(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        previewImg.src = ev.target.result;
        previewImg.hidden = false;
        photoPlaceholder.hidden = true;
        startBtn.disabled = false;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function selectSize(rows, cols) {
    state.rows = rows;
    state.cols = cols;
    $$('.size-btn').forEach((btn) => {
      const active = parseInt(btn.dataset.rows, 10) === rows &&
        parseInt(btn.dataset.cols, 10) === cols;
      btn.classList.toggle('active', active);
    });
    sizeHint.textContent = `${rows * cols} stukjes`;
  }

  function goToSetup() {
    stopTimer();
    setupScreen.classList.add('active');
    gameScreen.classList.remove('active');
    state.playing = false;
    state.selectedGroupId = null;
    boardEl.innerHTML = '';
    state.groups = [];
    state.grid = [];
  }

  function startGame() {
    if (!state.image) return;
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    winOverlay.hidden = true;
    requestAnimationFrame(() => {
      buildPuzzle();
      scatterGroups(false);
      state.playing = true;
      startTimer();
    });
  }

  function emptyGrid() {
    state.grid = Array.from({ length: state.rows }, () => Array(state.cols).fill(null));
  }

  function buildPuzzle() {
    boardEl.innerHTML = '';
    state.groups = [];
    state.nextGroupId = 1;
    emptyGrid();

    const rect = boardEl.getBoundingClientRect();
    state.boardW = rect.width;
    state.boardH = rect.height;
    state.cellW = state.boardW / state.cols;
    state.cellH = state.boardH / state.rows;

    boardEl.style.setProperty('--cols', state.cols);
    boardEl.style.setProperty('--rows', state.rows);

    const ctx = sliceCanvas.getContext('2d');
    sliceCanvas.width = state.image.width;
    sliceCanvas.height = state.image.height;
    ctx.drawImage(state.image, 0, 0);

    const srcW = state.image.width / state.cols;
    const srcH = state.image.height / state.rows;

    for (let row = 0; row < state.rows; row++) {
      for (let col = 0; col < state.cols; col++) {
        const id = row * state.cols + col;
        const tile = document.createElement('canvas');
        tile.width = srcW;
        tile.height = srcH;
        tile.getContext('2d').drawImage(
          sliceCanvas,
          col * srcW, row * srcH, srcW, srcH,
          0, 0, srcW, srcH
        );

        const piece = {
          id,
          row,
          col,
          relCol: 0,
          relRow: 0,
          width: state.cellW,
          height: state.cellH,
          imgSrc: tile.toDataURL('image/jpeg', 0.92),
          connTop: false,
          connRight: false,
          connBottom: false,
          connLeft: false,
        };

        createGroup([piece]);
      }
    }

    renderGridOverlay();
  }

  function renderGridOverlay() {
    let overlay = boardEl.querySelector('.grid-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'grid-overlay';
      boardEl.appendChild(overlay);
    }
    overlay.innerHTML = '';
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.style.left = c * state.cellW + 'px';
        cell.style.top = r * state.cellH + 'px';
        cell.style.width = state.cellW + 'px';
        cell.style.height = state.cellH + 'px';
        overlay.appendChild(cell);
      }
    }
  }

  function createGroup(pieces) {
    const group = {
      id: state.nextGroupId++,
      gridCol: 0,
      gridRow: 0,
      pieces,
      el: null,
      zIndex: state.nextGroupId,
    };
    normalizeGroupPieces(group);
    renderGroup(group);
    state.groups.push(group);
    return group;
  }

  function normalizeGroupPieces(group) {
    if (!group.pieces.length) return;
    let minCol = Infinity;
    let minRow = Infinity;
    group.pieces.forEach((p) => {
      minCol = Math.min(minCol, p.col);
      minRow = Math.min(minRow, p.row);
    });
    group.pieces.forEach((p) => {
      p.relCol = p.col - minCol;
      p.relRow = p.row - minRow;
    });
  }

  function getGroupCells(group, gridCol, gridRow) {
    return group.pieces.map((p) => ({
      r: gridRow + p.relRow,
      c: gridCol + p.relCol,
    }));
  }

  function clearGroupFromGrid(group) {
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.grid[r][c] === group.id) {
          state.grid[r][c] = null;
        }
      }
    }
  }

  function placeGroupOnGrid(group, gridCol, gridRow) {
    clearGroupFromGrid(group);
    group.gridCol = gridCol;
    group.gridRow = gridRow;
    getGroupCells(group, gridCol, gridRow).forEach(({ r, c }) => {
      if (r >= 0 && r < state.rows && c >= 0 && c < state.cols) {
        state.grid[r][c] = group.id;
      }
    });
  }

  function renderGroup(group) {
    if (group.el) group.el.remove();

    const el = document.createElement('div');
    el.className = 'group';
    if (group.id === state.selectedGroupId) el.classList.add('selected');
    el.dataset.groupId = group.id;
    el.style.zIndex = group.zIndex;

    group.pieces.forEach((p) => {
      const pieceEl = document.createElement('div');
      const cls = ['piece'];
      if (p.connTop) cls.push('conn-top');
      if (p.connRight) cls.push('conn-right');
      if (p.connBottom) cls.push('conn-bottom');
      if (p.connLeft) cls.push('conn-left');
      pieceEl.className = cls.join(' ');

      pieceEl.style.left = p.relCol * state.cellW + 'px';
      pieceEl.style.top = p.relRow * state.cellH + 'px';
      pieceEl.style.width = state.cellW + 'px';
      pieceEl.style.height = state.cellH + 'px';

      const img = document.createElement('img');
      img.src = p.imgSrc;
      img.style.width = state.cellW + 'px';
      img.style.height = state.cellH + 'px';
      img.draggable = false;
      pieceEl.appendChild(img);

      ['top', 'right', 'bottom', 'left'].forEach((side) => {
        const edge = document.createElement('div');
        edge.className = 'edge edge-' + side;
        pieceEl.appendChild(edge);
      });

      el.appendChild(pieceEl);
    });

    let maxC = 0;
    let maxR = 0;
    group.pieces.forEach((p) => {
      maxC = Math.max(maxC, p.relCol + 1);
      maxR = Math.max(maxR, p.relRow + 1);
    });
    el.style.width = maxC * state.cellW + 'px';
    el.style.height = maxR * state.cellH + 'px';
    el.style.left = group.gridCol * state.cellW + 'px';
    el.style.top = group.gridRow * state.cellH + 'px';

    boardEl.appendChild(el);
    group.el = el;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function scatterGroups(reshuffle) {
    if (reshuffle) {
      const allPieces = [];
      state.groups.forEach((g) => allPieces.push(...g.pieces));
      state.groups.forEach((g) => g.el && g.el.remove());
      state.groups = [];
      state.nextGroupId = 1;
      emptyGrid();
      allPieces.forEach((p) => {
        p.relCol = 0;
        p.relRow = 0;
        p.connTop = p.connRight = p.connBottom = p.connLeft = false;
        createGroup([p]);
      });
    }

    const slots = [];
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        slots.push({ r, c });
      }
    }
    shuffleArray(slots);

    emptyGrid();
    state.groups.forEach((group, i) => {
      const slot = slots[i];
      placeGroupOnGrid(group, slot.c, slot.r);
      renderGroup(group);
    });

    updateGroupCount();
    clearSelection();
  }

  function areSolveNeighbors(p1, p2) {
    const dc = Math.abs(p1.col - p2.col);
    const dr = Math.abs(p1.row - p2.row);
    return (dc === 1 && dr === 0) || (dc === 0 && dr === 1);
  }

  function tryMergeAll() {
    let merged = true;
    while (merged) {
      merged = false;
      for (let i = 0; i < state.groups.length; i++) {
        for (let j = i + 1; j < state.groups.length; j++) {
          const g1 = state.groups[i];
          const g2 = state.groups[j];
          if (!g1 || !g2) continue;
          if (findGridMerge(g1, g2)) {
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    }
    updateConnections();
    updateGroupCount();
    checkWin();
  }

  function findGridMerge(g1, g2) {
    for (const p1 of g1.pieces) {
      for (const p2 of g2.pieces) {
        if (!areSolveNeighbors(p1, p2)) continue;

        const r1 = g1.gridRow + p1.relRow;
        const c1 = g1.gridCol + p1.relCol;
        const r2 = g2.gridRow + p2.relRow;
        const c2 = g2.gridCol + p2.relCol;

        const dr = p1.row - p2.row;
        const dc = p1.col - p2.col;

        if (r1 - r2 === dr && c1 - c2 === dc) {
          mergeGroups(g1, g2);
          return true;
        }
      }
    }
    return false;
  }

  function mergeGroups(target, source) {
    const sourceCol = source.gridCol;
    const sourceRow = source.gridRow;

    source.pieces.forEach((p) => {
      p.relCol = sourceCol + p.relCol - target.gridCol;
      p.relRow = sourceRow + p.relRow - target.gridRow;
      target.pieces.push(p);
    });

    clearGroupFromGrid(source);
    source.el.remove();
    state.groups = state.groups.filter((g) => g.id !== source.id);

    normalizeGroupPieces(target);
    placeGroupOnGrid(target, target.gridCol, target.gridRow);
    target.zIndex = Math.max(target.zIndex, source.zIndex) + 1;
    renderGroup(target);

    target.el.classList.add('snapping');
    setTimeout(() => target.el && target.el.classList.remove('snapping'), 200);
  }

  function updateConnections() {
    state.groups.forEach((group) => {
      group.pieces.forEach((p) => {
        p.connTop = p.connRight = p.connBottom = p.connLeft = false;
      });

      for (let i = 0; i < group.pieces.length; i++) {
        for (let j = i + 1; j < group.pieces.length; j++) {
          const a = group.pieces[i];
          const b = group.pieces[j];
          if (!areSolveNeighbors(a, b)) continue;

          const dr = a.relRow - b.relRow;
          const dc = a.relCol - b.relCol;
          const sdr = a.row - b.row;
          const sdc = a.col - b.col;

          if (dr === sdr && dc === sdc) {
            if (a.row === b.row - 1) { a.connBottom = true; b.connTop = true; }
            if (a.row === b.row + 1) { a.connTop = true; b.connBottom = true; }
            if (a.col === b.col - 1) { a.connRight = true; b.connLeft = true; }
            if (a.col === b.col + 1) { a.connLeft = true; b.connRight = true; }
          }
        }
      }

      renderGroup(group);
    });
  }

  function updateGroupCount() {
    const total = state.rows * state.cols;
    const connected = total - state.groups.length;
    groupCountEl.textContent = `${connected} verbonden`;
  }

  function checkWin() {
    if (state.groups.length !== 1) return;
    const group = state.groups[0];
    if (group.pieces.length !== state.rows * state.cols) return;
    if (group.gridCol !== 0 || group.gridRow !== 0) return;

    const ref = group.pieces[0];
    for (const p of group.pieces) {
      const expectedRelCol = p.col - ref.col;
      const expectedRelRow = p.row - ref.row;
      if (p.relCol !== expectedRelCol || p.relRow !== expectedRelRow) return;
    }

    onWin();
  }

  function clearSelection() {
    if (state.selectedGroupId === null) return;
    const prev = state.groups.find((g) => g.id === state.selectedGroupId);
    state.selectedGroupId = null;
    if (prev && prev.el) prev.el.classList.remove('selected');
  }

  function selectGroup(group) {
    clearSelection();
    state.selectedGroupId = group.id;
    if (group.el) group.el.classList.add('selected');
  }

  function canSwapGroups(g1, g2) {
    const cells1 = getGroupCells(g1, g2.gridCol, g2.gridRow);
    const cells2 = getGroupCells(g2, g1.gridCol, g1.gridRow);
    const all = [...cells1, ...cells2];

    for (const { r, c } of all) {
      if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) return false;
    }

    const keys = new Set();
    for (const { r, c } of cells1) {
      keys.add(`${r},${c}`);
    }
    for (const { r, c } of cells2) {
      if (keys.has(`${r},${c}`)) return false;
    }

    return true;
  }

  function swapGroups(g1, g2) {
    if (!canSwapGroups(g1, g2)) return false;

    const c1 = g1.gridCol;
    const r1 = g1.gridRow;
    const c2 = g2.gridCol;
    const r2 = g2.gridRow;

    clearGroupFromGrid(g1);
    clearGroupFromGrid(g2);
    placeGroupOnGrid(g1, c2, r2);
    placeGroupOnGrid(g2, c1, r1);

    g1.el.classList.add('swapping');
    g2.el.classList.add('swapping');
    renderGroup(g1);
    renderGroup(g2);
    setTimeout(() => {
      if (g1.el) g1.el.classList.remove('swapping');
      if (g2.el) g2.el.classList.remove('swapping');
    }, 200);

    tryMergeAll();
    return true;
  }

  function onBoardClick(e) {
    if (!state.playing) return;
    const groupEl = e.target.closest('.group');
    if (!groupEl || !boardEl.contains(groupEl)) return;

    const group = state.groups.find((g) => g.id === parseInt(groupEl.dataset.groupId, 10));
    if (!group) return;

    if (state.selectedGroupId === null) {
      selectGroup(group);
      return;
    }

    if (state.selectedGroupId === group.id) {
      clearSelection();
      return;
    }

    const first = state.groups.find((g) => g.id === state.selectedGroupId);
    clearSelection();
    if (first) swapGroups(first, group);
  }

  function startTimer() {
    stopTimer();
    state.startTime = Date.now();
    timerEl.textContent = '0:00';
    state.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function onWin() {
    state.playing = false;
    stopTimer();
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    winStats.textContent = `Voltooid in ${mins}:${secs.toString().padStart(2, '0')}`;
    winOverlay.hidden = false;
  }

  init();
})();
