import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DifficultyPicker, GameBoard } from './src/components/GameBoard';
import { GameHeader } from './src/components/GameHeader';
import { WinOverlay } from './src/components/WinOverlay';
import { useMemoryGame } from './src/hooks/useMemoryGame';

export default function App() {
  const {
    cards,
    columns,
    difficulty,
    flippedIds,
    matchedIds,
    isComplete,
    isLocked,
    stats,
    changeDifficulty,
    flipCard,
    resetGame,
  } = useMemoryGame();

  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#2f3f9f', '#5b6cff', '#8f6dff']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <GameHeader
            moves={stats.moves}
            seconds={stats.seconds}
            matchedPairs={stats.matchedPairs}
            totalPairs={stats.totalPairs}
            onRestart={() => resetGame()}
          />

          <DifficultyPicker difficulty={difficulty} onChange={changeDifficulty} />

          <GameBoard
            cards={cards}
            columns={columns}
            flippedIds={flippedIds}
            matchedIds={matchedIds}
            isLocked={isLocked}
            onFlip={flipCard}
          />
        </ScrollView>

        <WinOverlay
          visible={isComplete}
          moves={stats.moves}
          seconds={stats.seconds}
          onPlayAgain={() => resetGame()}
        />
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 20,
  },
});
