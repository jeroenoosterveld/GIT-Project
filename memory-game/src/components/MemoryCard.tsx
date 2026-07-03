import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

type MemoryCardProps = {
  image: ImageSourcePropType;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  disabled: boolean;
};

export function MemoryCard({
  image,
  isFlipped,
  isMatched,
  onPress,
  disabled,
}: MemoryCardProps) {
  const flipAnim = useRef(new Animated.Value(isFlipped || isMatched ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped || isMatched ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [flipAnim, isFlipped, isMatched]);

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
      disabled={disabled || isFlipped || isMatched}
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
          <Image source={image} style={styles.image} resizeMode="contain" />
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
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFront: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  cardMatched: {
    borderColor: '#7dffb2',
    backgroundColor: '#f3fff8',
  },
  image: {
    width: '78%',
    height: '78%',
  },
});
