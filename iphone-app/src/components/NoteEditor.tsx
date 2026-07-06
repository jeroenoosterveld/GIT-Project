import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Note, NoteDraft } from '../types/note';

type NoteEditorProps = {
  note: Note | null;
  isSaving: boolean;
  onSave: (draft: NoteDraft) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function NoteEditor({ note, isSaving, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');

  useEffect(() => {
    setTitle(note?.title ?? '');
    setBody(note?.body ?? '');
  }, [note]);

  const handleSave = async () => {
    try {
      await onSave({ title, body });
    } catch {
      Alert.alert('Opslaan mislukt', 'De notitie kon niet naar de NAS worden geschreven.');
    }
  };

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    Alert.alert('Notitie verwijderen', 'Weet je zeker dat je deze notitie wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: () => {
          void onDelete();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titel"
          style={styles.titleInput}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Schrijf je notitie..."
          multiline
          textAlignVertical="top"
          style={styles.bodyInput}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            void handleSave();
          }}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Opslaan op NAS</Text>
          )}
        </TouchableOpacity>

        {note && onDelete ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Verwijderen</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    minHeight: 420,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    paddingVertical: 8,
  },
  bodyInput: {
    minHeight: 240,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#2f3f9f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
});
