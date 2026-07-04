import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { NasConfig } from '../types/nas';
import { loadNasPassword } from '../storage/nasConfig';

type SettingsFormProps = {
  config: NasConfig;
  hasStoredPassword: boolean;
  isSaving: boolean;
  isTesting: boolean;
  error: string | null;
  onChange: (config: NasConfig) => void;
  onSave: (config: NasConfig, password: string) => Promise<void>;
  onTest: (config: NasConfig, password: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
};

export function SettingsForm({
  config,
  hasStoredPassword,
  isSaving,
  isTesting,
  error,
  onChange,
  onSave,
  onTest,
  onDisconnect,
}: SettingsFormProps) {
  const [password, setPassword] = useState('');

  const updateField = <K extends keyof NasConfig>(key: K, value: NasConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  const resolvePassword = () => {
    if (password.trim()) {
      return password;
    }

    if (hasStoredPassword) {
      return '__USE_STORED__';
    }

    return '';
  };

  const handleTest = async () => {
    const nextPassword = resolvePassword();
    if (!nextPassword || nextPassword === '__USE_STORED__') {
      if (!hasStoredPassword) {
        Alert.alert('Wachtwoord nodig', 'Vul je NAS-wachtwoord in om te testen.');
        return;
      }
    }

    try {
      const actualPassword =
        nextPassword === '__USE_STORED__' ? await loadNasPassword() : nextPassword;

      if (!actualPassword) {
        Alert.alert('Wachtwoord nodig', 'Vul je NAS-wachtwoord in om te testen.');
        return;
      }

      await onTest(config, actualPassword);
      Alert.alert('Verbinding OK', 'De NAS is bereikbaar.');
    } catch {
      Alert.alert('Verbinding mislukt', 'Controleer de adressen en inloggegevens.');
    }
  };

  const handleSave = async () => {
    const nextPassword = resolvePassword();
    if (!nextPassword || nextPassword === '__USE_STORED__') {
      if (!hasStoredPassword) {
        Alert.alert('Wachtwoord nodig', 'Vul je NAS-wachtwoord in om op te slaan.');
        return;
      }
    }

    try {
      const actualPassword =
        nextPassword === '__USE_STORED__' ? await loadNasPassword() : nextPassword;

      if (!actualPassword) {
        Alert.alert('Wachtwoord nodig', 'Vul je NAS-wachtwoord in om op te slaan.');
        return;
      }

      await onSave(config, actualPassword);
      setPassword('');
      Alert.alert('Opgeslagen', 'NAS-instellingen zijn bewaard.');
    } catch {
      Alert.alert('Opslaan mislukt', 'Controleer je instellingen en probeer opnieuw.');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'NAS ontkoppelen',
      'Dit verwijdert je opgeslagen inloggegevens van dit apparaat.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Ontkoppelen',
          style: 'destructive',
          onPress: () => {
            void onDisconnect();
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thuisnetwerk (QNAP)</Text>
        <Text style={styles.help}>
          QNAP WebDAV-adres met gedeelde map: http://192.168.2.27:8080/Public
        </Text>
        <TextInput
          value={config.localUrl}
          onChangeText={(value) => updateField('localUrl', value)}
          placeholder="http://192.168.2.27:8080/Public"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Buiten huis (QNAP)</Text>
        <Text style={styles.help}>
          HTTPS via myQNAPcloud of eigen domein, bijv. https://naam.myqnapcloud.com/Public
        </Text>
        <TextInput
          value={config.remoteUrl}
          onChangeText={(value) => updateField('remoteUrl', value)}
          placeholder="https://naam.myqnapcloud.com/Public"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Inloggen</Text>
        <TextInput
          value={config.username}
          onChangeText={(value) => updateField('username', value)}
          placeholder="Gebruikersnaam"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={hasStoredPassword ? 'Wachtwoord (laat leeg om te behouden)' : 'Wachtwoord'}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Opslagmap op QNAP</Text>
        <Text style={styles.help}>
          Submap binnen je gedeelde map (bijv. Public). De app maakt deze map zelf aan.
        </Text>
        <TextInput
          value={config.folder}
          onChangeText={(value) => updateField('folder', value)}
          placeholder="iphone-app-notities"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            void handleTest();
          }}
          disabled={isTesting || isSaving}
        >
          {isTesting ? (
            <ActivityIndicator color="#2f3f9f" />
          ) : (
            <Text style={styles.secondaryButtonText}>Test verbinding</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            void handleSave();
          }}
          disabled={isSaving || isTesting}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Opslaan</Text>
          )}
        </TouchableOpacity>

        {hasStoredPassword ? (
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectText}>NAS ontkoppelen</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2f3f9f',
    marginTop: 8,
    marginBottom: 6,
  },
  help: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 10,
  },
  error: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2f3f9f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e8ebff',
  },
  secondaryButtonText: {
    color: '#2f3f9f',
    fontSize: 16,
    fontWeight: '700',
  },
  disconnectButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  disconnectText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
});
