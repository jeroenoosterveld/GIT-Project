import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GameBoard } from './src/components/GameBoard';
import { GameHeader } from './src/components/GameHeader';
import { GridSizePicker } from './src/components/GridSizePicker';
import { PhotoPickerButton } from './src/components/PhotoPickerButton';
import { UpdateBanner } from './src/components/UpdateBanner';
import { WinOverlay } from './src/components/WinOverlay';
import { CardTheme, DEFAULT_CARD_THEMES } from './src/constants/cards';
import { MAX_PAIR_COUNT } from './src/constants/grid';
import { BUILD_VERSION } from './src/constants/buildVersion';
import { useMemoryGame } from './src/hooks/useMemoryGame';
import { storedPhotosToThemes, validatePhotoCount } from './src/utils/cardThemes';
import { loadGridSize, saveGridSize } from './src/utils/gridConfig';
import { clearStoredPhotos, loadStoredPhotos, saveStoredPhotos, StoredPhoto } from './src/utils/photoStorage';
import { resizeImageFile } from './src/utils/resizeImage';

const isWeb = Platform.OS === 'web';

export default function App() {
  const [cardThemes, setCardThemes] = useState<CardTheme[]>(DEFAULT_CARD_THEMES);
  const [usingCustomPhotos, setUsingCustomPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSavingPhotos, setIsSavingPhotos] = useState(false);
  const [photosLoaded, setPhotosLoaded] = useState(!isWeb);
  const [gridSize, setGridSize] = useState(loadGridSize);

  const {
    cards,
    flippedIds,
    matchedIds,
    isComplete,
    isLocked,
    stats,
    flipCard,
    resetGame,
  } = useMemoryGame(cardThemes, gridSize);

  const handleGridChange = useCallback((nextGridSize: typeof gridSize) => {
    setGridSize(nextGridSize);
    saveGridSize(nextGridSize);
  }, []);

  useEffect(() => {
    if (!isWeb) {
      return;
    }

    loadStoredPhotos()
      .then((photos) => {
        if (photos.length >= 6) {
          setCardThemes(storedPhotosToThemes(photos));
          setUsingCustomPhotos(true);
        }
      })
      .finally(() => setPhotosLoaded(true));
  }, []);

  const photoCount = useMemo(
    () => (usingCustomPhotos ? cardThemes.length : 0),
    [cardThemes.length, usingCustomPhotos],
  );

  const handlePickPhotos = useCallback(async (files: File[]) => {
    const validationError = validatePhotoCount(files.length);
    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    setIsSavingPhotos(true);
    setPhotoError(null);

    try {
      const selected = files.slice(0, MAX_PAIR_COUNT);
      const stored: StoredPhoto[] = [];

      for (let index = 0; index < selected.length; index += 1) {
        const uri = await resizeImageFile(selected[index]);
        stored.push({ id: `photo-${Date.now()}-${index}`, uri });
      }

      await saveStoredPhotos(stored);
      setCardThemes(storedPhotosToThemes(stored));
      setUsingCustomPhotos(true);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Foto\'s opslaan mislukt.');
    } finally {
      setIsSavingPhotos(false);
    }
  }, []);

  const handleUseDefaultPhotos = useCallback(async () => {
    await clearStoredPhotos();
    setCardThemes(DEFAULT_CARD_THEMES);
    setUsingCustomPhotos(false);
    setPhotoError(null);
  }, []);

  if (!photosLoaded) {
    return (
      <View style={styles.webRoot}>
        <View style={styles.webInner}>
          <View style={styles.loadingBox}>
            <StatusBar style="light" />
            <Text style={styles.loadingText}>Memory laden…</Text>
          </View>
        </View>
      </View>
    );
  }

  const content = (
    <>
      <StatusBar style="light" />
      <ScrollView
        style={isWeb ? styles.webScroll : styles.nativeScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={isWeb}
        keyboardShouldPersistTaps="handled"
      >
        {isWeb ? <UpdateBanner /> : null}

        <GameHeader
          moves={stats.moves}
          seconds={stats.seconds}
          matchedPairs={stats.matchedPairs}
          totalPairs={stats.totalPairs}
          cardCount={cards.length}
          gridSize={gridSize}
          usingCustomPhotos={usingCustomPhotos}
          onRestart={() => resetGame()}
        />

        <GridSizePicker gridSize={gridSize} onChange={handleGridChange} />

        {isWeb ? (
          <PhotoPickerButton
            usingCustomPhotos={usingCustomPhotos}
            photoCount={photoCount}
            onPickPhotos={handlePickPhotos}
            onUseDefaultPhotos={handleUseDefaultPhotos}
            errorMessage={photoError}
            isSaving={isSavingPhotos}
          />
        ) : null}

        <Text style={styles.versionLabel}>Versie: {BUILD_VERSION}</Text>

        <GameBoard
          cards={cards}
          gridSize={gridSize}
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
    height: '100vh' as unknown as number,
    width: '100%',
    paddingTop: 16,
    paddingBottom: 16,
  },
  webInner: {
    flex: 1,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    height: '100%',
  },
  webScroll: {
    flex: 1,
  },
  nativeScroll: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: '#4d5fd6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
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
  versionLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'center',
  },
});
