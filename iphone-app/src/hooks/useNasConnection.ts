import { useCallback, useEffect, useState } from 'react';

import { checkNasConnection } from '../services/nasNotes';
import { ConnectionStatus, NasConfig, StoredNasConfig } from '../types/nas';
import {
  clearNasConfig,
  getDefaultNasConfig,
  loadNasConfig,
  loadNasPassword,
  saveNasConfig,
} from '../storage/nasConfig';

const OFFLINE_STATUS: ConnectionStatus = {
  mode: 'offline',
  connected: false,
  message: 'Nog niet verbonden',
};

export function useNasConnection() {
  const [config, setConfig] = useState<NasConfig>(getDefaultNasConfig());
  const [storedConfig, setStoredConfig] = useState<StoredNasConfig | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(OFFLINE_STATUS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStoredConfig = useCallback(async () => {
    const loaded = await loadNasConfig();
    setStoredConfig(loaded);

    if (loaded) {
      setConfig({
        localUrl: loaded.localUrl,
        remoteUrl: loaded.remoteUrl,
        username: loaded.username,
        folder: loaded.folder,
      });
    }
  }, []);

  useEffect(() => {
    refreshStoredConfig().finally(() => setIsLoading(false));
  }, [refreshStoredConfig]);

  const testConnection = useCallback(
    async (nextConfig: NasConfig, password: string) => {
      setIsTesting(true);
      setError(null);

      try {
        const result = await checkNasConnection(nextConfig, password);
        setStatus(result);
        return result;
      } catch (testError) {
        const message =
          testError instanceof Error ? testError.message : 'Verbinding testen mislukt.';
        setError(message);
        setStatus({
          mode: 'offline',
          connected: false,
          message,
        });
        throw testError;
      } finally {
        setIsTesting(false);
      }
    },
    [],
  );

  const saveConnection = useCallback(
    async (nextConfig: NasConfig, password: string) => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await testConnection(nextConfig, password);
        await saveNasConfig(nextConfig, password);
        await refreshStoredConfig();
        setStatus(result);
        return result;
      } catch (saveError) {
        const message =
          saveError instanceof Error ? saveError.message : 'Opslaan mislukt.';
        setError(message);
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    [refreshStoredConfig, testConnection],
  );

  const reconnect = useCallback(async () => {
    const password = await loadNasPassword();
    if (!storedConfig || !password) {
      setStatus(OFFLINE_STATUS);
      return OFFLINE_STATUS;
    }

    return testConnection(
      {
        localUrl: storedConfig.localUrl,
        remoteUrl: storedConfig.remoteUrl,
        username: storedConfig.username,
        folder: storedConfig.folder,
      },
      password,
    );
  }, [storedConfig, testConnection]);

  const disconnect = useCallback(async () => {
    await clearNasConfig();
    setStoredConfig(null);
    setConfig(getDefaultNasConfig());
    setStatus(OFFLINE_STATUS);
    setError(null);
  }, []);

  return {
    config,
    setConfig,
    storedConfig,
    status,
    isLoading,
    isSaving,
    isTesting,
    error,
    saveConnection,
    testConnection,
    reconnect,
    disconnect,
  };
}
