import {
  DEFAULT_GRID_SIZE,
  GRID_COLUMNS_MAX,
  GRID_COLUMNS_MIN,
  GRID_ROWS_MAX,
  GRID_ROWS_MIN,
  GridSize,
} from '../constants/grid';

const STORAGE_KEY = 'memory-grid-size';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeGridSize(columns: number, rows: number): GridSize {
  let nextColumns = clamp(Math.round(columns), GRID_COLUMNS_MIN, GRID_COLUMNS_MAX);
  let nextRows = clamp(Math.round(rows), GRID_ROWS_MIN, GRID_ROWS_MAX);

  if ((nextColumns * nextRows) % 2 !== 0) {
    if (nextRows < GRID_ROWS_MAX) {
      nextRows += 1;
    } else if (nextRows > GRID_ROWS_MIN) {
      nextRows -= 1;
    } else if (nextColumns < GRID_COLUMNS_MAX) {
      nextColumns += 1;
    }
  }

  return { columns: nextColumns, rows: nextRows };
}

export function getCardCount(grid: GridSize): number {
  return grid.columns * grid.rows;
}

export function getPairCount(grid: GridSize): number {
  return getCardCount(grid) / 2;
}

export function getGridLabel(grid: GridSize): string {
  return `${grid.columns}×${grid.rows}`;
}

export function loadGridSize(): GridSize {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_GRID_SIZE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_GRID_SIZE;
    }

    const parsed = JSON.parse(raw) as Partial<GridSize>;
    return normalizeGridSize(parsed.columns ?? DEFAULT_GRID_SIZE.columns, parsed.rows ?? DEFAULT_GRID_SIZE.rows);
  } catch {
    return DEFAULT_GRID_SIZE;
  }
}

export function saveGridSize(grid: GridSize): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
}
