(function () {
  'use strict';

  const SNAP = 28;

  const state = {
    image: null,
    rows: 4,
    cols: 4,
    pieceW: 0,
    pieceH: 0,
    boardW: 0,
    boardH: 0,
    groups: [],
    nextGroupId: 1,
    playing: false,
    timerInterval: null,
    startTime: null,
    drag: null,
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

    boardEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
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
    boardEl.innerHTML = '';
    state.groups = [];
  }

  function startGame() {
    if (!state.image) return;
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    winOverlay.hidden = true;
    requestAnimationFrame(() => {
      buildPuzzle();
      scatterGroups();
      state.playing = true;
      startTimer();
    });
  }

  function buildPuzzle() {
    boardEl.innerHTML = '';
    state.groups = [];
    state.nextGroupId = 1;

    const rect = boardEl.getBoundingClientRect();
    state.boardW = rect.width;
    state.boardH = rect.height;

    const aspect = state.image.width / state.image.height;
    let imgW, imgH;
    if (aspect >= 1) {
      imgW = state.boardW * 0.88;
      imgH = imgW / aspect;
    } else {
      imgH = state.boardH * 0.88;
      imgW = imgH * aspect;
    }

    state.pieceW = imgW / state.cols;
    state.pieceH = imgH / state.rows;

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
          localX: 0,
          localY: 0,
          width: state.pieceW,
          height: state.pieceH,
          imgSrc: tile.toDataURL('image/jpeg', 0.92),
          connTop: false,
          connRight: false,
          connBottom: false,
          connLeft: false,
        };

        createGroup([piece]);
      }
    }
  }

  function createGroup(pieces) {
    const group = {
      id: state.nextGroupId++,
      x: 0,
      y: 0,
      pieces,
      el: null,
      zIndex: state.nextGroupId,
    };
    layoutGroup(group);
    renderGroup(group);
    state.groups.push(group);
    return group;
  }

  function layoutGroup(group) {
    if (!group.pieces.length) return { minX: 0, minY: 0 };
    let minX = Infinity;
    let minY = Infinity;
    group.pieces.forEach((p) => {
      minX = Math.min(minX, p.localX);
      minY = Math.min(minY, p.localY);
    });
    group.pieces.forEach((p) => {
      p.localX -= minX;
      p.localY -= minY;
    });
    return { minX, minY };
  }

  function renderGroup(group) {
    if (group.el) group.el.remove();

    const el = document.createElement('div');
    el.className = 'group';
    el.dataset.groupId = group.id;
    el.style.zIndex = group.zIndex;

    group.pieces.forEach((p) => {
      const pieceEl = document.createElement('div');
      pieceEl.className = 'piece';
      pieceEl.style.left = p.localX + 'px';
      pieceEl.style.top = p.localY + 'px';
      pieceEl.style.width = p.width + 'px';
      pieceEl.style.height = p.height + 'px';
      pieceEl.dataset.pieceId = p.id;

      const cls = [];
      if (p.connTop) cls.push('conn-top');
      if (p.connRight) cls.push('conn-right');
      if (p.connBottom) cls.push('conn-bottom');
      if (p.connLeft) cls.push('conn-left');
      pieceEl.className = 'piece ' + cls.join(' ');

      const img = document.createElement('img');
      img.src = p.imgSrc;
      img.style.width = p.width + 'px';
      img.style.height = p.height + 'px';
      img.draggable = false;
      pieceEl.appendChild(img);

      ['top', 'right', 'bottom', 'left'].forEach((side) => {
        const edge = document.createElement('div');
        edge.className = 'edge edge-' + side;
        pieceEl.appendChild(edge);
      });

      el.appendChild(pieceEl);
    });

    let maxX = 0;
    let maxY = 0;
    group.pieces.forEach((p) => {
      maxX = Math.max(maxX, p.localX + p.width);
      maxY = Math.max(maxY, p.localY + p.height);
    });
    el.style.width = maxX + 'px';
    el.style.height = maxY + 'px';
    el.style.left = group.x + 'px';
    el.style.top = group.y + 'px';

    boardEl.appendChild(el);
    group.el = el;
  }

  function scatterGroups(reshuffle) {
    if (reshuffle) {
      const allPieces = [];
      state.groups.forEach((g) => allPieces.push(...g.pieces));
      state.groups.forEach((g) => g.el && g.el.remove());
      state.groups = [];
      state.nextGroupId = 1;
      allPieces.forEach((p) => {
        p.localX = 0;
        p.localY = 0;
        p.connTop = p.connRight = p.connBottom = p.connLeft = false;
        createGroup([p]);
      });
    }

    const padding = 12;
    state.groups.forEach((group) => {
      let maxX = 0;
      let maxY = 0;
      group.pieces.forEach((p) => {
        maxX = Math.max(maxX, p.localX + p.width);
        maxY = Math.max(maxY, p.localY + p.height);
      });

      group.x = padding + Math.random() * Math.max(0, state.boardW - maxX - padding * 2);
      group.y = padding + Math.random() * Math.max(0, state.boardH - maxY - padding * 2);
      group.el.style.left = group.x + 'px';
      group.el.style.top = group.y + 'px';
    });

    updateGroupCount();
  }

  function pieceWorld(piece, group) {
    return { x: group.x + piece.localX, y: group.y + piece.localY };
  }

  function solvedOffset(p1, p2) {
    return {
      dx: (p1.col - p2.col) * state.pieceW,
      dy: (p1.row - p2.row) * state.pieceH,
    };
  }

  function areNeighbors(p1, p2) {
    const dc = Math.abs(p1.col - p2.col);
    const dr = Math.abs(p1.row - p2.row);
    return (dc === 1 && dr === 0) || (dc === 0 && dr === 1);
  }

  function trySnap() {
    let merged = false;

    for (let i = 0; i < state.groups.length; i++) {
      for (let j = i + 1; j < state.groups.length; j++) {
        const g1 = state.groups[i];
        const g2 = state.groups[j];
        if (!g1.el || !g2.el) continue;

        const snap = findSnap(g1, g2);
        if (snap) {
          mergeGroups(g1, g2, snap.dx, snap.dy);
          merged = true;
          break;
        }
      }
      if (merged) break;
    }

    if (merged) {
      updateConnections();
      updateGroupCount();
      checkWin();
    }
  }

  function findSnap(g1, g2) {
    for (const p1 of g1.pieces) {
      for (const p2 of g2.pieces) {
        if (!areNeighbors(p1, p2)) continue;

        const w1 = pieceWorld(p1, g1);
        const w2 = pieceWorld(p2, g2);
        const off = solvedOffset(p1, p2);
        const targetX = w1.x - off.dx;
        const targetY = w1.y - off.dy;
        const dx = targetX - w2.x;
        const dy = targetY - w2.y;

        if (Math.abs(dx) <= SNAP && Math.abs(dy) <= SNAP) {
          return { dx, dy, p1, p2 };
        }
      }
    }
    return null;
  }

  function mergeGroups(target, source, dx, dy) {
    source.x += dx;
    source.y += dy;

    source.pieces.forEach((p) => {
      p.localX = source.x + p.localX - target.x;
      p.localY = source.y + p.localY - target.y;
      target.pieces.push(p);
    });

    source.el.remove();
    state.groups = state.groups.filter((g) => g.id !== source.id);

    const shift = layoutGroup(target);
    target.x += shift.minX;
    target.y += shift.minY;

    target.zIndex = Math.max(target.zIndex, source.zIndex) + 1;
    renderGroup(target);

    target.el.classList.add('snapping');
    setTimeout(() => target.el.classList.remove('snapping'), 220);
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
          if (!areNeighbors(a, b)) continue;

          const wa = { x: a.localX, y: a.localY };
          const wb = { x: b.localX, y: b.localY };
          const off = solvedOffset(a, b);
          const tol = 4;

          if (Math.abs((wa.x - wb.x) - off.dx) < tol && Math.abs((wa.y - wb.y) - off.dy) < tol) {
            if (a.col === b.col && a.row === b.row - 1) { a.connBottom = true; b.connTop = true; }
            if (a.col === b.col && a.row === b.row + 1) { a.connTop = true; b.connBottom = true; }
            if (a.row === b.row && a.col === b.col - 1) { a.connRight = true; b.connLeft = true; }
            if (a.row === b.row && a.col === b.col + 1) { a.connLeft = true; b.connRight = true; }
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

    const ref = group.pieces[0];
    for (const p of group.pieces) {
      const expectedDx = (p.col - ref.col) * state.pieceW;
      const expectedDy = (p.row - ref.row) * state.pieceH;
      const actualDx = p.localX - ref.localX;
      const actualDy = p.localY - ref.localY;
      if (Math.abs(actualDx - expectedDx) > 6 || Math.abs(actualDy - expectedDy) > 6) {
        return;
      }
    }

    onWin();
  }

  function onPointerDown(e) {
    if (!state.playing) return;
    const groupEl = e.target.closest('.group');
    if (!groupEl || !boardEl.contains(groupEl)) return;

    const group = state.groups.find((g) => g.id === parseInt(groupEl.dataset.groupId, 10));
    if (!group) return;

    group.zIndex = Date.now();
    groupEl.style.zIndex = group.zIndex;
    groupEl.classList.add('dragging');
    groupEl.setPointerCapture(e.pointerId);

    const boardRect = boardEl.getBoundingClientRect();
    state.drag = {
      group,
      pointerId: e.pointerId,
      offsetX: e.clientX - boardRect.left - group.x,
      offsetY: e.clientY - boardRect.top - group.y,
    };
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!state.drag || state.drag.pointerId !== e.pointerId) return;

    const boardRect = boardEl.getBoundingClientRect();
    const group = state.drag.group;
    let maxX = 0;
    let maxY = 0;
    group.pieces.forEach((p) => {
      maxX = Math.max(maxX, p.localX + p.width);
      maxY = Math.max(maxY, p.localY + p.height);
    });

    let nx = e.clientX - boardRect.left - state.drag.offsetX;
    let ny = e.clientY - boardRect.top - state.drag.offsetY;
    nx = Math.max(0, Math.min(nx, state.boardW - maxX));
    ny = Math.max(0, Math.min(ny, state.boardH - maxY));

    group.x = nx;
    group.y = ny;
    group.el.style.left = nx + 'px';
    group.el.style.top = ny + 'px';
  }

  function onPointerUp(e) {
    if (!state.drag || state.drag.pointerId !== e.pointerId) return;

    state.drag.group.el.classList.remove('dragging');
    state.drag = null;
    trySnap();
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
