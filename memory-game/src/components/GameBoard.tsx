import { Dimensions, StyleSheet, View } from 'react-native';

import { GRID_COLUMNS } from '../constants/cards';
import { GameCard } from '../hooks/useMemoryGame';
import { MemoryCard } from './MemoryCard';

type GameBoardProps = {
  cards: GameCard[];
  flippedIds: string[];
  matchedIds: string[];
  isLocked: boolean;
  onFlip: (cardId: string) => void;
};

const BOARD_GAP = 10;
const BOARD_HORIZONTAL_PADDING = 18;

export function GameBoard({
  cards,
  flippedIds,
  matchedIds,
  isLocked,
  onFlip,
}: GameBoardProps) {
  const boardWidth = Dimensions.get('window').width - BOARD_HORIZONTAL_PADDING * 2;
  const cardWidth = (boardWidth - BOARD_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const compact = cards.length >= 20;

  return (
    <View style={[styles.board, { gap: BOARD_GAP }]}>
      {cards.map((card) => (
        <View key={card.uid} style={[styles.cardSlot, { width: cardWidth }]}>
          <MemoryCard
            image={card.image}
            isFlipped={flippedIds.includes(card.uid)}
            isMatched={matchedIds.includes(card.uid)}
            disabled={isLocked}
            compact={compact}
            onPress={() => onFlip(card.uid)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  cardSlot: {
    minWidth: 0,
  },
});
