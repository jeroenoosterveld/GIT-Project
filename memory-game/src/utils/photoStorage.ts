export type StoredPhoto = {
  id: string;
  uri: string;
};

const DB_NAME = 'memory-game-photos';
const STORE_NAME = 'photos';
const PHOTOS_KEY = 'user-photos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
  });
}

export async function loadStoredPhotos(): Promise<StoredPhoto[]> {
  if (typeof indexedDB === 'undefined') {
    return [];
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(PHOTOS_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as StoredPhoto[]) ?? []);
    tx.oncomplete = () => db.close();
  });
}

export async function saveStoredPhotos(photos: StoredPhoto[]): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    return;
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(photos, PHOTOS_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStoredPhotos(): Promise<void> {
  if (typeof indexedDB === 'undefined') {
    return;
  }

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(PHOTOS_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}
