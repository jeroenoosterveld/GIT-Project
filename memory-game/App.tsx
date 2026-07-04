import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DifficultyPicker, GameBoard } from './src/components/GameBoard';
import { GameHeader } from './src/components/GameHeader';
import { WinOverlay } from './src/components/WinOverlay';
import { useMemoryGame } from './src/hooks/useMemoryGame';

const isWeb = Platform.OS === 'web';

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

  const content = (
    <>
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
    </>
  );

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <View style={styles.webInner}>{content}</View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.nativeRoot}>
        <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    backgroundColor: '#4d5fd6',
    minHeight: '100vh' as unknown as number,
    width: '100%',
    paddingTop: 16,
    paddingBottom: 16,
  },
  webInner: {
    flex: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    minHeight: '100%',
  },
  nativeRoot: {
    flex: 1,
    backgroundColor: '#5b6cff',
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
