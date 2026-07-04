import { StyleSheet, Text, View } from 'react-native';

import { ConnectionStatus } from '../types/nas';

type ConnectionBadgeProps = {
  status: ConnectionStatus;
};

const MODE_LABELS = {
  local: 'Thuis',
  remote: 'Extern',
  offline: 'Offline',
} as const;

const MODE_COLORS = {
  local: '#1f9d55',
  remote: '#2563eb',
  offline: '#9ca3af',
} as const;

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: MODE_COLORS[status.mode] }]} />
      <View style={styles.textWrap}>
        <Text style={styles.mode}>{MODE_LABELS[status.mode]}</Text>
        <Text style={styles.message}>{status.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  mode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  message: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});
