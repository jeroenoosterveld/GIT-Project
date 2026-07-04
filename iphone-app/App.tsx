import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { APP_VERSION } from './src/constants/app';

export default function App() {
  return (
    <SafeAreaProvider>
      <LinearGradient colors={['#2f3f9f', '#5b6cff']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.card}>
            <Text style={styles.title}>Nieuwe App</Text>
            <Text style={styles.subtitle}>
              Expo + React Native project is klaar. Specificaties volgen nog.
            </Text>
            <Text style={styles.version}>v{APP_VERSION}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3f9f',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
  },
  version: {
    marginTop: 24,
    fontSize: 13,
    color: '#888',
  },
});
