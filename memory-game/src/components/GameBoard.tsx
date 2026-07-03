import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { Difficulty, DIFFICULTY_CONFIG } from '../constants/cards';
import { GameCard } from '../hooks/useMemoryGame';
import { MemoryCard } from './MemoryCard';

type GameBoardProps = {
  cards: GameCard[];
  columns: number;
  flippedIds: string[];
  matchedIds: string[];
  isLocked: boolean;
  onFlip: (cardId: string) => void;
};

const BOARD_GAP = 10;
const BOARD_HORIZONTAL_PADDING = 18;

export function GameBoard({
  cards,
  columns,
  flippedIds,
  matchedIds,
  isLocked,
  onFlip,
}: GameBoardProps) {
  const boardWidth = Dimensions.get('window').width - BOARD_HORIZONTAL_PADDING * 2;
  const cardWidth = (boardWidth - BOARD_GAP * (columns - 1)) / columns;

  return (
    <View style={[styles.board, { gap: BOARD_GAP }]}>
      {cards.map((card) => (
        <View key={card.uid} style={[styles.cardSlot, { width: cardWidth }]}>
          <MemoryCard
            image={card.image}
            isFlipped={flippedIds.includes(card.uid)}
            isMatched={matchedIds.includes(card.uid)}
            disabled={isLocked}
            onPress={() => onFlip(card.uid)}
          />
        </View>
      ))}
    </View>
  );
}

type DifficultyPickerProps = {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
};

export function DifficultyPicker({ difficulty, onChange }: DifficultyPickerProps) {
  return (
    <View style={styles.difficultyRow}>
      {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => {
        const isActive = difficulty === level;
        return (
          <Pressable
            key={level}
            onPress={() => onChange(level)}
            style={[styles.difficultyButton, isActive && styles.difficultyButtonActive]}
          >
            <Text style={[styles.difficultyText, isActive && styles.difficultyTextActive]}>
              {DIFFICULTY_CONFIG[level].label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSlot: {
    minWidth: 72,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  difficultyButtonActive: {
    backgroundColor: '#ffffff',
  },
  difficultyText: {
    color: '#dbe4ff',
    fontWeight: '600',
    fontSize: 14,
  },
  difficultyTextActive: {
    color: '#2f3f9f',
  },
});
