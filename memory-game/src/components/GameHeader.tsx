import { Pressable, StyleSheet, Text, View } from 'react-native';

type GameHeaderProps = {
  moves: number;
  seconds: number;
  matchedPairs: number;
  totalPairs: number;
  usingCustomPhotos: boolean;
  onRestart: () => void;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function GameHeader({
  moves,
  seconds,
  matchedPairs,
  totalPairs,
  usingCustomPhotos,
  onRestart,
}: GameHeaderProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Memory</Text>
        <Text style={styles.subtitle}>
          {usingCustomPhotos ? 'Met jouw foto\'s — volledig offline' : 'Vind alle paartjes — volledig offline'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tijd</Text>
          <Text style={styles.statValue}>{formatTime(seconds)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Zetten</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Paren</Text>
          <Text style={styles.statValue}>
            {matchedPairs}/{totalPairs}
          </Text>
        </View>
      </View>

      <Pressable onPress={onRestart} style={({ pressed }) => [styles.restartButton, pressed && styles.restartPressed]}>
        <Text style={styles.restartText}>Opnieuw</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#c9d4ff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  statLabel: {
    color: '#c9d4ff',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  restartButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  restartPressed: {
    opacity: 0.85,
  },
  restartText: {
    color: '#2f3f9f',
    fontWeight: '700',
    fontSize: 15,
  },
});
