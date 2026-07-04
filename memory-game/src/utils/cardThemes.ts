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
