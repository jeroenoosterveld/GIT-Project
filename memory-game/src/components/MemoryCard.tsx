import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type MemoryCardProps = {
  image: ImageSourcePropType;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled: boolean;
  sizeMode?: 'normal' | 'compact' | 'extraCompact';
};

const isWeb = Platform.OS === 'web';

export function MemoryCard({
  image,
  isFlipped,
  isMatched,
  onPress,
  disabled,
  sizeMode = 'normal',
}: MemoryCardProps) {
  const showFront = isFlipped || isMatched;
  const flipAnim = useRef(new Animated.Value(showFront ? 1 : 0)).current;

  useEffect(() => {
    if (isWeb) {
      return;
    }

    Animated.spring(flipAnim, {
      toValue: showFront ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [flipAnim, showFront]);

  if (isWeb) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || showFront}
        style={({ pressed }) => [
          styles.pressable,
          sizeMode === 'compact' && styles.pressableCompact,
          sizeMode === 'extraCompact' && styles.pressableExtraCompact,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.cardFace, showFront ? styles.cardFront : styles.cardBackSolid, !showFront && styles.webCardBack]}>
          {showFront ? (
            <Image source={image} style={styles.imageFull} resizeMode="cover" />
          ) : (
            <Text style={styles.webHelp}>?</Text>
          )}
        </View>
      </Pressable>
    );
  }

  const frontRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || showFront}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <View style={styles.cardContainer}>
        <Animated.View
          pointerEvents="none"
          style={[styles.cardFace, { transform: [{ rotateY: frontRotation }] }]}
        >
          <LinearGradient colors={['#5b6cff', '#7c4dff']} style={styles.cardBack}>
            <Ionicons name="help" size={28} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cardFace,
            styles.cardFront,
            isMatched && styles.cardMatched,
            { transform: [{ rotateY: backRotation }] },
          ]}
        >
          <Image source={image} style={styles.imageFull} resizeMode="cover" />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    aspectRatio: 0.78,
    minHeight: 88,
    maxHeight: 130,
  },
  pressableCompact: {
    minHeight: 58,
    maxHeight: 82,
    aspectRatio: 0.82,
  },
  pressableExtraCompact: {
    minHeight: 46,
    maxHeight: 68,
    aspectRatio: 0.85,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardContainer: {
    flex: 1,
  },
  cardFace: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  webCardBack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackSolid: {
    backgroundColor: '#6a5cff',
  },
  cardFront: {
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },
  cardMatched: {
    borderColor: '#7dffb2',
  },
  imageFull: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  webHelp: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
});
