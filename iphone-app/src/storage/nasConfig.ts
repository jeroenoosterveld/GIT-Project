import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { NasConfig, StoredNasConfig } from '../types/nas';

const CONFIG_KEY = 'nas.config';
const PASSWORD_KEY = 'nas.password';

const DEFAULT_CONFIG: NasConfig = {
  localUrl: '',
  remoteUrl: '',
  username: '',
  folder: 'iphone-app-notities',
};

export async function loadNasConfig(): Promise<StoredNasConfig | null> {
  const raw = await AsyncStorage.getItem(CONFIG_KEY);
  if (!raw) {
    return null;
  }

  const config = JSON.parse(raw) as NasConfig;
  const password = await SecureStore.getItemAsync(PASSWORD_KEY);

  return {
    ...config,
    hasPassword: Boolean(password),
  };
}

export async function saveNasConfig(config: NasConfig, password: string): Promise<void> {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  await SecureStore.setItemAsync(PASSWORD_KEY, password);
}

export async function loadNasPassword(): Promise<string | null> {
  return SecureStore.getItemAsync(PASSWORD_KEY);
}

export async function clearNasConfig(): Promise<void> {
  await AsyncStorage.removeItem(CONFIG_KEY);
  await SecureStore.deleteItemAsync(PASSWORD_KEY);
}

export function getDefaultNasConfig(): NasConfig {
  return { ...DEFAULT_CONFIG };
}
