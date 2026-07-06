import { useRef, ChangeEvent } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type PhotoPickerButtonProps = {
  usingCustomPhotos: boolean;
  photoCount: number;
  onPickPhotos: (files: File[]) => Promise<void>;
  onUseDefaultPhotos: () => Promise<void>;
  errorMessage?: string | null;
  isSaving?: boolean;
};

export function PhotoPickerButton({
  usingCustomPhotos,
  photoCount,
  onPickPhotos,
  onUseDefaultPhotos,
  errorMessage,
  isSaving,
}: PhotoPickerButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (Platform.OS !== 'web') {
    return null;
  }

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) {
      return;
    }
    await onPickPhotos(files);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={openPicker}
          disabled={isSaving}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSaving && styles.disabled]}
        >
          <Text style={styles.primaryText}>{isSaving ? 'Opslaan...' : 'Mijn foto\'s kiezen'}</Text>
        </Pressable>

        {usingCustomPhotos ? (
          <Pressable
            onPress={onUseDefaultPhotos}
            disabled={isSaving}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Standaard plaatjes</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.hint}>
        {usingCustomPhotos
          ? `${photoCount} foto's opgeslagen op je iPhone — volledig offline`
          : 'Kies minimaal 6 foto\'s (12 voor Normaal 4×6)'}
      </Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {/* eslint-disable-next-line react/no-unknown-property */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: '#2f3f9f',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  hint: {
    color: '#dbe4ff',
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: '#ffd0d0',
    fontSize: 13,
    fontWeight: '600',
  },
});
