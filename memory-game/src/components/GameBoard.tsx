import { Dimensions, StyleSheet, View } from 'react-native';

import { GridSize } from '../constants/grid';
import { GameCard } from '../hooks/useMemoryGame';
import { MemoryCard } from './MemoryCard';

type GameBoardProps = {
  cards: GameCard[];
  gridSize: GridSize;
  flippedIds: string[];
  matchedIds: string[];
  isLocked: boolean;
  onFlip: (cardId: string) => void;
};

const BOARD_GAP = 10;
const BOARD_HORIZONTAL_PADDING = 18;

function getCardSizeMode(cardCount: number) {
  if (cardCount >= 30) {
    return 'extraCompact' as const;
  }
  if (cardCount >= 16) {
    return 'compact' as const;
  }
  return 'normal' as const;
}

export function GameBoard({
  cards,
  gridSize,
  flippedIds,
  matchedIds,
  isLocked,
  onFlip,
}: GameBoardProps) {
  const boardWidth = Dimensions.get('window').width - BOARD_HORIZONTAL_PADDING * 2;
  const cardWidth = (boardWidth - BOARD_GAP * (gridSize.columns - 1)) / gridSize.columns;
  const sizeMode = getCardSizeMode(cards.length);

  return (
    <View style={[styles.board, { gap: BOARD_GAP }]}>
      {cards.map((card) => (
        <View key={card.uid} style={[styles.cardSlot, { width: cardWidth }]}>
          <MemoryCard
            image={card.image}
            isFlipped={flippedIds.includes(card.uid)}
            isMatched={matchedIds.includes(card.uid)}
            disabled={isLocked}
            sizeMode={sizeMode}
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
