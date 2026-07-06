import { CardTheme, MIN_PHOTOS_REQUIRED } from '../constants/cards';
import { StoredPhoto } from '../utils/photoStorage';

export function storedPhotosToThemes(photos: StoredPhoto[]): CardTheme[] {
  return photos.map((photo) => ({
    id: photo.id,
    image: { uri: photo.uri },
  }));
}

export function validatePhotoCount(count: number): string | null {
  if (count < MIN_PHOTOS_REQUIRED) {
    return `Kies minimaal ${MIN_PHOTOS_REQUIRED} verschillende foto's.`;
  }
  return null;
}

export function expandThemesToPairCount(themes: CardTheme[], pairCount: number): CardTheme[] {
  if (themes.length === 0 || pairCount <= 0) {
    return [];
  }

  if (themes.length >= pairCount) {
    return themes.slice(0, pairCount);
  }

  return Array.from({ length: pairCount }, (_, index) => {
    const source = themes[index % themes.length];
    return {
      id: `${source.id}-${index}`,
      image: source.image,
    };
  });
}
