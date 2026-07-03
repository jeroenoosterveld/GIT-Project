import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type WinOverlayProps = {
  visible: boolean;
  moves: number;
  seconds: number;
  onPlayAgain: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function WinOverlay({ visible, moves, seconds, onPlayAgain }: WinOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Gefeliciteerd!</Text>
          <Text style={styles.message}>Je hebt alle paartjes gevonden.</Text>

          <View style={styles.summary}>
            <Text style={styles.summaryLine}>Tijd: {formatTime(seconds)}</Text>
            <Text style={styles.summaryLine}>Zetten: {moves}</Text>
          </View>

          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Nog een keer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 66, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2a63',
  },
  message: {
    fontSize: 16,
    color: '#5b678f',
    textAlign: 'center',
  },
  summary: {
    marginTop: 8,
    marginBottom: 8,
    gap: 4,
  },
  summaryLine: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3f9f',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#5b6cff',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});
