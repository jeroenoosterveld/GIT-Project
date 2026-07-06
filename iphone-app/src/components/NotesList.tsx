import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Note } from '../types/note';

type NotesListProps = {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  lastSyncMessage: string | null;
  onRefresh: () => void;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotesList({
  notes,
  isLoading,
  error,
  lastSyncMessage,
  onRefresh,
  onSelectNote,
  onCreateNote,
}: NotesListProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={onCreateNote}>
        <Text style={styles.createButtonText}>+ Nieuwe notitie</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {lastSyncMessage ? <Text style={styles.syncMessage}>{lastSyncMessage}</Text> : null}

      {isLoading && notes.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Notities ophalen van NAS...</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#fff" />
          }
          contentContainerStyle={notes.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nog geen notities</Text>
              <Text style={styles.emptyText}>
                Maak een notitie aan. Deze wordt als JSON-bestand op je NAS opgeslagen.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard} onPress={() => onSelectNote(item)}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {item.body || 'Geen inhoud'}
              </Text>
              <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    color: '#2f3f9f',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#fecaca',
    marginBottom: 8,
    fontSize: 14,
  },
  syncMessage: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    fontSize: 13,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 15,
  },
  list: {
    paddingBottom: 24,
    gap: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2f3f9f',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  notePreview: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
