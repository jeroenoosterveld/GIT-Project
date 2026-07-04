import AsyncStorage from '@react-native-async-storage/async-storage';

import { Note } from '../types/note';

const CACHE_KEY = 'nas.notes.cache';

export async function loadCachedNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) {
    return [];
  }

  return JSON.parse(raw) as Note[];
}

export async function saveCachedNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(notes));
}

export async function clearCachedNotes(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
}
