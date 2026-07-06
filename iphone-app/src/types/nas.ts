export type NasConfig = {
  localUrl: string;
  remoteUrl: string;
  username: string;
  folder: string;
};

export type StoredNasConfig = NasConfig & {
  hasPassword: boolean;
};

export type ConnectionMode = 'local' | 'remote' | 'offline';

export type ConnectionStatus = {
  mode: ConnectionMode;
  connected: boolean;
  message: string;
};
