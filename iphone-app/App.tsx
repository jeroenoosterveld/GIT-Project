import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConnectionBadge } from './src/components/ConnectionBadge';
import { NoteEditor } from './src/components/NoteEditor';
import { NotesList } from './src/components/NotesList';
import { ScreenLayout } from './src/components/ScreenLayout';
import { SettingsForm } from './src/components/SettingsForm';
import { APP_VERSION } from './src/constants/app';
import { useNasConnection } from './src/hooks/useNasConnection';
import { useNotes } from './src/hooks/useNotes';
import { Note } from './src/types/note';

type Screen = 'notes' | 'settings' | 'editor';

export default function App() {
  const {
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
  } = useNasConnection();

  const {
    notes,
    isLoading: notesLoading,
    isSaving: noteSaving,
    error: notesError,
    lastSyncMessage,
    refreshNotes,
    saveNote,
    deleteNote,
    clearLocalData,
  } = useNotes(storedConfig, status);

  const [screen, setScreen] = useState<Screen>('notes');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (!isLoading && !storedConfig?.hasPassword) {
      setScreen('settings');
    }
  }, [isLoading, storedConfig?.hasPassword]);

  const openEditor = (note: Note | null) => {
    setSelectedNote(note);
    setScreen('editor');
  };

  const handleDisconnect = async () => {
    await disconnect();
    await clearLocalData();
    setScreen('settings');
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#2f3f9f" />
          <Text style={styles.loadingLabel}>NAS Notities laden...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (screen === 'settings') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ScreenLayout
          title="NAS instellen"
          subtitle="QNAP WebDAV — thuis en extern"
          onBack={storedConfig?.hasPassword ? () => setScreen('notes') : undefined}
        >
          <SettingsForm
            config={config}
            hasStoredPassword={Boolean(storedConfig?.hasPassword)}
            isSaving={isSaving}
            isTesting={isTesting}
            error={error}
            onChange={setConfig}
            onSave={async (nextConfig, password) => {
              await saveConnection(nextConfig, password);
              setScreen('notes');
            }}
            onTest={async (nextConfig, password) => {
              await testConnection(nextConfig, password);
            }}
            onDisconnect={handleDisconnect}
          />
        </ScreenLayout>
      </SafeAreaProvider>
    );
  }

  if (screen === 'editor') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ScreenLayout
          title={selectedNote ? 'Notitie bewerken' : 'Nieuwe notitie'}
          onBack={() => setScreen('notes')}
        >
          <NoteEditor
            note={selectedNote}
            isSaving={noteSaving}
            onSave={async (draft) => {
              const saved = await saveNote(selectedNote?.id ?? null, draft);
              setSelectedNote(saved);
              setScreen('notes');
            }}
            onDelete={
              selectedNote
                ? async () => {
                    await deleteNote(selectedNote.id);
                    setSelectedNote(null);
                    setScreen('notes');
                  }
                : undefined
            }
          />
        </ScreenLayout>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ScreenLayout
        title="NAS Notities"
        subtitle={`v${APP_VERSION}`}
        rightAction={
          <TouchableOpacity onPress={() => setScreen('settings')} style={styles.settingsButton}>
            <Text style={styles.settingsText}>Instellingen</Text>
          </TouchableOpacity>
        }
      >
        <ConnectionBadge status={status} />
        <NotesList
          notes={notes}
          isLoading={notesLoading}
          error={notesError}
          lastSyncMessage={lastSyncMessage}
          onRefresh={() => {
            void reconnect();
            void refreshNotes();
          }}
          onSelectNote={(note) => openEditor(note)}
          onCreateNote={() => openEditor(null)}
        />
      </ScreenLayout>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    gap: 12,
  },
  loadingLabel: {
    color: '#2f3f9f',
    fontSize: 16,
  },
  settingsButton: {
    paddingVertical: 8,
  },
  settingsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
