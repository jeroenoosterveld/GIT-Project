import { useCallback, useEffect, useState } from 'react';

import {
  deleteNoteFromNas,
  fetchNotesFromNas,
  saveNoteToNas,
} from '../services/nasNotes';
import { clearCachedNotes, loadCachedNotes, saveCachedNotes } from '../storage/noteCache';
import { loadNasPassword } from '../storage/nasConfig';
import { ConnectionStatus, StoredNasConfig } from '../types/nas';
import { Note, NoteDraft } from '../types/note';

export function useNotes(storedConfig: StoredNasConfig | null, status: ConnectionStatus) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);

  const loadFromCache = useCallback(async () => {
    const cached = await loadCachedNotes();
    setNotes(cached);
  }, []);

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  const refreshNotes = useCallback(async () => {
    if (!storedConfig?.hasPassword) {
      await loadFromCache();
      return;
    }

    const password = await loadNasPassword();
    if (!password) {
      setError('Wachtwoord niet gevonden. Stel de NAS opnieuw in.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNotesFromNas(
        {
          localUrl: storedConfig.localUrl,
          remoteUrl: storedConfig.remoteUrl,
          username: storedConfig.username,
          folder: storedConfig.folder,
        },
        password,
      );

      setNotes(result.notes);
      await saveCachedNotes(result.notes);
      setLastSyncMessage(result.status.message);
    } catch (refreshError) {
      const cached = await loadCachedNotes();
      setNotes(cached);
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Synchroniseren mislukt. Lokale kopie wordt getoond.';
      setError(message);
      setLastSyncMessage('Offline — lokale kopie');
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache, storedConfig]);

  useEffect(() => {
    if (storedConfig?.hasPassword && status.connected) {
      refreshNotes();
    }
  }, [refreshNotes, status.connected, storedConfig?.hasPassword]);

  const saveNote = useCallback(
    async (noteId: string | null, draft: NoteDraft) => {
      if (!storedConfig?.hasPassword) {
        throw new Error('NAS is nog niet ingesteld.');
      }

      const password = await loadNasPassword();
      if (!password) {
        throw new Error('Wachtwoord niet gevonden.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const result = await saveNoteToNas(
          {
            localUrl: storedConfig.localUrl,
            remoteUrl: storedConfig.remoteUrl,
            username: storedConfig.username,
            folder: storedConfig.folder,
          },
          password,
          noteId,
          draft,
        );

        setNotes((current) => {
          const withoutCurrent = current.filter((note) => note.id !== result.note.id);
          const next = [result.note, ...withoutCurrent].sort(
            (left, right) =>
              new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
          );
          void saveCachedNotes(next);
          return next;
        });
        setLastSyncMessage(result.status.message);
        return result.note;
      } catch (saveError) {
        const message = saveError instanceof Error ? saveError.message : 'Opslaan mislukt.';
        setError(message);
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    [storedConfig],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!storedConfig?.hasPassword) {
        throw new Error('NAS is nog niet ingesteld.');
      }

      const password = await loadNasPassword();
      if (!password) {
        throw new Error('Wachtwoord niet gevonden.');
      }

      setIsSaving(true);
      setError(null);

      try {
        const result = await deleteNoteFromNas(
          {
            localUrl: storedConfig.localUrl,
            remoteUrl: storedConfig.remoteUrl,
            username: storedConfig.username,
            folder: storedConfig.folder,
          },
          password,
          noteId,
        );

        setNotes((current) => {
          const next = current.filter((note) => note.id !== noteId);
          void saveCachedNotes(next);
          return next;
        });
        setLastSyncMessage(result.message);
      } catch (deleteError) {
        const message =
          deleteError instanceof Error ? deleteError.message : 'Verwijderen mislukt.';
        setError(message);
        throw deleteError;
      } finally {
        setIsSaving(false);
      }
    },
    [storedConfig],
  );

  const clearLocalData = useCallback(async () => {
    await clearCachedNotes();
    setNotes([]);
    setError(null);
    setLastSyncMessage(null);
  }, []);

  return {
    notes,
    isLoading,
    isSaving,
    error,
    lastSyncMessage,
    refreshNotes,
    saveNote,
    deleteNote,
    clearLocalData,
  };
}
