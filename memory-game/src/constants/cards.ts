import { ImageSourcePropType } from 'react-native';

export type CardTheme = {
  id: string;
  image: ImageSourcePropType;
};

export const MIN_PHOTOS_REQUIRED = 6;

export const DEFAULT_CARD_THEMES: CardTheme[] = [
  { id: 'dog', image: require('../../assets/cards/dog.png') },
  { id: 'cat', image: require('../../assets/cards/cat.png') },
  { id: 'fox', image: require('../../assets/cards/fox.png') },
  { id: 'frog', image: require('../../assets/cards/frog.png') },
  { id: 'panda', image: require('../../assets/cards/panda.png') },
  { id: 'koala', image: require('../../assets/cards/koala.png') },
  { id: 'lion', image: require('../../assets/cards/lion.png') },
  { id: 'tiger', image: require('../../assets/cards/tiger.png') },
];

/** @deprecated use DEFAULT_CARD_THEMES */
export const CARD_THEMES = DEFAULT_CARD_THEMES;

export type Difficulty = 'easy' | 'medium';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; pairs: number; columns: number }
> = {
  easy: { label: 'Makkelijk', pairs: 6, columns: 3 },
  medium: { label: 'Normaal', pairs: 8, columns: 4 },
};
