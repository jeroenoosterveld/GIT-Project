import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { applyUpdate, fetchLatestVersion, isUpdateAvailable } from '../utils/checkForUpdate';

export function UpdateBanner() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const check = useCallback(async () => {
    const latest = await fetchLatestVersion();
    if (isUpdateAvailable(latest)) {
      setLatestVersion(latest);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    check();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        check();
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [check]);

  if (!latestVersion) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        {isUpdating ? 'Bezig met bijwerken…' : 'Nieuwe versie beschikbaar'}
      </Text>
      <Pressable
        onPress={() => {
          setIsUpdating(true);
          applyUpdate(latestVersion);
        }}
        disabled={isUpdating}
        style={({ pressed }) => [
          styles.button,
          isUpdating && styles.buttonDisabled,
          pressed && !isUpdating && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>{isUpdating ? 'Laden…' : 'Bijwerken'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  text: {
    flex: 1,
    color: '#2f3f9f',
    fontWeight: '700',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#5b6cff',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
