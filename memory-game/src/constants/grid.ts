export const GRID_COLUMNS_MIN = 1;
export const GRID_COLUMNS_MAX = 6;
export const GRID_ROWS_MIN = 2;
export const GRID_ROWS_MAX = 12;

export const DEFAULT_GRID_COLUMNS = 4;
export const DEFAULT_GRID_ROWS = 6;

export const MAX_PAIR_COUNT = (GRID_COLUMNS_MAX * GRID_ROWS_MAX) / 2;

export type GridSize = {
  columns: number;
  rows: number;
};

export const DEFAULT_GRID_SIZE: GridSize = {
  columns: DEFAULT_GRID_COLUMNS,
  rows: DEFAULT_GRID_ROWS,
};
