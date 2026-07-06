import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  GRID_COLUMNS_MAX,
  GRID_COLUMNS_MIN,
  GRID_ROWS_MAX,
  GRID_ROWS_MIN,
  GridSize,
} from '../constants/grid';
import { getCardCount, getGridLabel, getPairCount, normalizeGridSize } from '../utils/gridConfig';

type GridSizePickerProps = {
  gridSize: GridSize;
  onChange: (gridSize: GridSize) => void;
};

type StepperRowProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

function StepperRow({ label, value, min, max, onDecrease, onIncrease }: StepperRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={onDecrease}
          disabled={value <= min}
          style={({ pressed }) => [
            styles.stepButton,
            value <= min && styles.stepButtonDisabled,
            pressed && value > min && styles.stepButtonPressed,
          ]}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={onIncrease}
          disabled={value >= max}
          style={({ pressed }) => [
            styles.stepButton,
            value >= max && styles.stepButtonDisabled,
            pressed && value < max && styles.stepButtonPressed,
          ]}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function GridSizePicker({ gridSize, onChange }: GridSizePickerProps) {
  const cardCount = getCardCount(gridSize);
  const pairCount = getPairCount(gridSize);

  const updateGrid = (columns: number, rows: number) => {
    onChange(normalizeGridSize(columns, rows));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bordgrootte</Text>

      <StepperRow
        label="Horizontaal"
        value={gridSize.columns}
        min={GRID_COLUMNS_MIN}
        max={GRID_COLUMNS_MAX}
        onDecrease={() => updateGrid(gridSize.columns - 1, gridSize.rows)}
        onIncrease={() => updateGrid(gridSize.columns + 1, gridSize.rows)}
      />

      <StepperRow
        label="Verticaal"
        value={gridSize.rows}
        min={GRID_ROWS_MIN}
        max={GRID_ROWS_MAX}
        onDecrease={() => updateGrid(gridSize.columns, gridSize.rows - 1)}
        onIncrease={() => updateGrid(gridSize.columns, gridSize.rows + 1)}
      />

      <Text style={styles.summary}>
        {getGridLabel(gridSize)} — {cardCount} kaarten ({pairCount} paren)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    color: '#dbe4ff',
    fontSize: 15,
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonPressed: {
    opacity: 0.85,
  },
  stepButtonDisabled: {
    opacity: 0.35,
  },
  stepButtonText: {
    color: '#2f3f9f',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  summary: {
    marginTop: 4,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
