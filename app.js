(function () {
  'use strict';

  const state = {
    image: null,
    gridSize: 4,
    tiles: [],
    emptyIndex: 0,
    moves: 0,
    timerInterval: null,
    startTime: null,
    playing: false,
    tileSize: 0,
    boardSize: 0,
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
  const puzzleBoard = $('#puzzle-board');
  const moveCount = $('#move-count');
  const timerEl = $('#timer');
  const winOverlay = $('#win-overlay');
  const winStats = $('#win-stats');

  function init() {
    photoInput.addEventListener('change', onPhotoSelected);
    $$('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => selectSize(parseInt(btn.dataset.size, 10)));
    });
    startBtn.addEventListener('click', startGame);
    $('#back-btn').addEventListener('click', goToSetup);
    $('#shuffle-btn').addEventListener('click', () => {
      if (state.playing) shufflePuzzle();
    });
    $('#play-again-btn').addEventListener('click', () => {
      winOverlay.hidden = true;
      shufflePuzzle();
    });
    $('#new-photo-btn').addEventListener('click', () => {
      winOverlay.hidden = true;
      goToSetup();
    });
    updateSizeHint();
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

  function selectSize(size) {
    state.gridSize = size;
    $$('.size-btn').forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === size);
    });
    updateSizeHint();
  }

  function updateSizeHint() {
    const total = state.gridSize * state.gridSize;
    sizeHint.textContent = `${total} stukjes (${total - 1} te schuiven)`;
  }

  function goToSetup() {
    stopTimer();
    setupScreen.classList.add('active');
    gameScreen.classList.remove('active');
    state.playing = false;
  }

  function startGame() {
    if (!state.image) return;
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    winOverlay.hidden = true;
    requestAnimationFrame(() => {
      createPuzzle();
      shufflePuzzle();
    });
  }

  function createPuzzle() {
    puzzleBoard.innerHTML = '';
    const n = state.gridSize;
    const boardRect = puzzleBoard.getBoundingClientRect();
    state.boardSize = boardRect.width;
    state.tileSize = state.boardSize / n;
    const gap = 3;
    const tileDisplaySize = state.tileSize - gap;

    state.tiles = [];
    for (let i = 0; i < n * n; i++) {
      const row = Math.floor(i / n);
      const col = i % n;
      const correctRow = Math.floor(i / n);
      const correctCol = i % n;

      if (i === n * n - 1) {
        state.emptyIndex = i;
        continue;
      }

      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.index = i;
      tile.dataset.correct = i;

      const bgSize = state.boardSize;
      tile.style.width = tileDisplaySize + 'px';
      tile.style.height = tileDisplaySize + 'px';
      tile.style.backgroundImage = `url(${state.image.src})`;
      tile.style.backgroundSize = `${bgSize}px ${bgSize}px`;
      tile.style.backgroundPosition = `-${correctCol * state.tileSize}px -${correctRow * state.tileSize}px`;

      tile.addEventListener('click', () => tryMoveTile(parseInt(tile.dataset.index, 10)));
      puzzleBoard.appendChild(tile);

      state.tiles.push({
        element: tile,
        currentIndex: i,
        correctIndex: i,
      });
    }

    positionAllTiles();
  }

  function getPosition(index) {
    const n = state.gridSize;
    const gap = 3;
    const tileDisplaySize = state.tileSize - gap;
    const row = Math.floor(index / n);
    const col = index % n;
    return {
      left: col * state.tileSize + gap / 2,
      top: row * state.tileSize + gap / 2,
      width: tileDisplaySize,
      height: tileDisplaySize,
    };
  }

  function positionAllTiles() {
    state.tiles.forEach((tile) => {
      const pos = getPosition(tile.currentIndex);
      tile.element.style.left = pos.left + 'px';
      tile.element.style.top = pos.top + 'px';
      tile.element.dataset.index = tile.currentIndex;
    });
    highlightMovable();
  }

  function getNeighbors(index) {
    const n = state.gridSize;
    const row = Math.floor(index / n);
    const col = index % n;
    const neighbors = [];
    if (row > 0) neighbors.push(index - n);
    if (row < n - 1) neighbors.push(index + n);
    if (col > 0) neighbors.push(index - 1);
    if (col < n - 1) neighbors.push(index + 1);
    return neighbors;
  }

  function highlightMovable() {
    const movable = getNeighbors(state.emptyIndex);
    state.tiles.forEach((tile) => {
      tile.element.classList.toggle('movable', movable.includes(tile.currentIndex));
    });
  }

  function tryMoveTile(tileIndex) {
    if (!state.playing) return;
    const neighbors = getNeighbors(state.emptyIndex);
    if (!neighbors.includes(tileIndex)) return;

    const tile = state.tiles.find((t) => t.currentIndex === tileIndex);
    if (!tile) return;

    tile.currentIndex = state.emptyIndex;
    state.emptyIndex = tileIndex;

    const pos = getPosition(tile.currentIndex);
    tile.element.style.left = pos.left + 'px';
    tile.element.style.top = pos.top + 'px';
    tile.element.dataset.index = tile.currentIndex;

    state.moves++;
    moveCount.textContent = `${state.moves} ${state.moves === 1 ? 'zet' : 'zetten'}`;
    highlightMovable();

    if (isSolved()) {
      onWin();
    }
  }

  function isSolved() {
    return state.tiles.every((tile) => tile.currentIndex === tile.correctIndex);
  }

  function shufflePuzzle() {
    const n = state.gridSize;
    const total = n * n;

    for (let i = 0; i < total; i++) {
      if (i < state.tiles.length) {
        state.tiles[i].currentIndex = i;
      }
    }
    state.emptyIndex = total - 1;

    const shuffleMoves = n * n * 50;
    let lastMoved = -1;

    for (let i = 0; i < shuffleMoves; i++) {
      const neighbors = getNeighbors(state.emptyIndex).filter((idx) => idx !== lastMoved);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];

      const tile = state.tiles.find((t) => t.currentIndex === pick);
      if (tile) {
        const prevEmpty = state.emptyIndex;
        tile.currentIndex = prevEmpty;
        state.emptyIndex = pick;
        lastMoved = prevEmpty;
      }
    }

    positionAllTiles();
    state.moves = 0;
    moveCount.textContent = '0 zetten';
    state.playing = true;
    startTimer();
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
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    winStats.textContent = `${state.moves} zetten in ${timeStr}`;
    winOverlay.hidden = false;
  }

  init();
})();
