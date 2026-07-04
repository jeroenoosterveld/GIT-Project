import { ImageSourcePropType } from 'react-native';

export type CardTheme = {
  id: string;
  image: ImageSourcePropType;
};

export const MIN_PHOTOS_REQUIRED = 5;
export const ROWS_PER_COLUMN = 5;
export const REFERENCE_COLUMNS = 4;

export const DEFAULT_CARD_THEMES: CardTheme[] = [
  { id: 'dog', image: require('../../assets/cards/dog.png') },
  { id: 'cat', image: require('../../assets/cards/cat.png') },
  { id: 'fox', image: require('../../assets/cards/fox.png') },
  { id: 'frog', image: require('../../assets/cards/frog.png') },
  { id: 'panda', image: require('../../assets/cards/panda.png') },
  { id: 'koala', image: require('../../assets/cards/koala.png') },
  { id: 'lion', image: require('../../assets/cards/lion.png') },
  { id: 'tiger', image: require('../../assets/cards/tiger.png') },
  { id: 'rabbit', image: require('../../assets/cards/rabbit.png') },
  { id: 'bear', image: require('../../assets/cards/bear.png') },
];

/** @deprecated use DEFAULT_CARD_THEMES */
export const CARD_THEMES = DEFAULT_CARD_THEMES;

export type Difficulty = 'easy' | 'medium';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; pairs: number }
> = {
  easy: { label: 'Makkelijk', pairs: 5 },
  medium: { label: 'Normaal', pairs: 10 },
};

export function getColumnCount(cardCount: number): number {
  return Math.ceil(cardCount / ROWS_PER_COLUMN);
}
