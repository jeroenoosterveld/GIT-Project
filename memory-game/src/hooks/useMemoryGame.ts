import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CardTheme, GAME_PAIRS } from '../constants/cards';
import { expandThemesToPairCount } from '../utils/cardThemes';

export type GameCard = {
  uid: string;
  pairId: string;
  image: CardTheme['image'];
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(cardThemes: CardTheme[]): GameCard[] {
  const selected = expandThemesToPairCount(cardThemes, GAME_PAIRS);

  return shuffle(
    selected.flatMap((theme) => [
      { uid: `${theme.id}-a`, pairId: theme.id, image: theme.image },
      { uid: `${theme.id}-b`, pairId: theme.id, image: theme.image },
    ]),
  );
}

export function useMemoryGame(cardThemes: CardTheme[]) {
  const [cards, setCards] = useState<GameCard[]>(() => createDeck(cardThemes));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const flipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardThemesRef = useRef(cardThemes);

  cardThemesRef.current = cardThemes;

  const totalPairs = GAME_PAIRS;
  const isComplete = matchedIds.length === cards.length && cards.length > 0;

  const resetGame = useCallback(() => {
    if (flipTimeout.current) {
      clearTimeout(flipTimeout.current);
      flipTimeout.current = null;
    }

    setCards(createDeck(cardThemesRef.current));
    setFlippedIds([]);
    setMatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsLocked(false);
  }, []);

  useEffect(() => {
    setCards(createDeck(cardThemesRef.current));
    setFlippedIds([]);
    setMatchedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsLocked(false);
  }, [cardThemes]);

  useEffect(() => {
    if (matchedIds.length > 0 || flippedIds.length > 0) {
      const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [flippedIds.length, matchedIds.length]);

  useEffect(() => {
    return () => {
      if (flipTimeout.current) {
        clearTimeout(flipTimeout.current);
      }
    };
  }, []);

  const flipCard = useCallback(
    (cardId: string) => {
      if (isLocked || isComplete) {
        return;
      }

      const card = cards.find((item) => item.uid === cardId);
      if (!card || matchedIds.includes(cardId) || flippedIds.includes(cardId)) {
        return;
      }

      const nextFlipped = [...flippedIds, cardId];
      setFlippedIds(nextFlipped);

      if (nextFlipped.length < 2) {
        return;
      }

      setMoves((value) => value + 1);
      setIsLocked(true);

      const [firstId, secondId] = nextFlipped;
      const firstCard = cards.find((item) => item.uid === firstId);
      const secondCard = cards.find((item) => item.uid === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        setMatchedIds((value) => [...value, firstId, secondId]);
        setFlippedIds([]);
        setIsLocked(false);
        return;
      }

      flipTimeout.current = setTimeout(() => {
        setFlippedIds([]);
        setIsLocked(false);
        flipTimeout.current = null;
      }, 900);
    },
    [cards, flippedIds, isComplete, isLocked, matchedIds],
  );

  const stats = useMemo(
    () => ({
      moves,
      seconds,
      matchedPairs: matchedIds.length / 2,
      totalPairs,
    }),
    [matchedIds.length, moves, seconds, totalPairs],
  );

  return {
    cards,
    flippedIds,
    matchedIds,
    isComplete,
    isLocked,
    stats,
    flipCard,
    resetGame,
  };
}
