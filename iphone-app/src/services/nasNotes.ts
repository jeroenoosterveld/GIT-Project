import { ConnectionMode, ConnectionStatus, NasConfig } from '../types/nas';
import { Note, NoteDraft } from '../types/note';
import { joinUrl } from '../utils/url';

import {
  buildCredentials,
  deleteFile,
  ensureDirectory,
  listFiles,
  readTextFile,
  testConnection,
  writeTextFile,
  WebDavCredentials,
} from './webdav';

const NOTE_PREFIX = 'note-';
const NOTE_SUFFIX = '.json';

function noteFileName(id: string): string {
  return `${NOTE_PREFIX}${id}${NOTE_SUFFIX}`;
}

function noteFilePath(folder: string, id: string): string {
  return joinUrl(folder, noteFileName(id));
}

function parseNote(content: string, fallbackId: string): Note | null {
  try {
    const parsed = JSON.parse(content) as Note;
    if (!parsed.id || !parsed.title) {
      return null;
    }

    return {
      id: parsed.id,
      title: parsed.title,
      body: parsed.body ?? '',
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return {
      id: fallbackId,
      title: 'Onbekende notitie',
      body: content,
      updatedAt: new Date().toISOString(),
    };
  }
}

function createNoteId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function connectWithFallback(
  config: NasConfig,
  password: string,
): Promise<{ credentials: WebDavCredentials; mode: ConnectionMode }> {
  const candidates: Array<{ url: string; mode: ConnectionMode }> = [];

  if (config.localUrl.trim()) {
    candidates.push({ url: config.localUrl, mode: 'local' });
  }

  if (config.remoteUrl.trim()) {
    candidates.push({ url: config.remoteUrl, mode: 'remote' });
  }

  if (candidates.length === 0) {
    throw new Error('Vul minstens een NAS-adres in.');
  }

  let lastError: Error | null = null;

  for (const candidate of candidates) {
    const credentials = buildCredentials(candidate.url, config.username, password);

    try {
      await testConnection(credentials);
      return { credentials, mode: candidate.mode };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Verbinding mislukt.');
    }
  }

  throw lastError ?? new Error('Geen verbinding met de NAS.');
}

export async function checkNasConnection(
  config: NasConfig,
  password: string,
): Promise<ConnectionStatus> {
  try {
    const { mode } = await connectWithFallback(config, password);
    return {
      mode,
      connected: true,
      message: mode === 'local' ? 'Verbonden via thuisnetwerk' : 'Verbonden via internet',
    };
  } catch (error) {
    return {
      mode: 'offline',
      connected: false,
      message: error instanceof Error ? error.message : 'Offline',
    };
  }
}

export async function fetchNotesFromNas(
  config: NasConfig,
  password: string,
): Promise<{ notes: Note[]; status: ConnectionStatus }> {
  const { credentials, mode } = await connectWithFallback(config, password);
  await ensureDirectory(credentials, config.folder);

  const files = await listFiles(credentials, config.folder);
  const noteFiles = files.filter((file) => file.name.startsWith(NOTE_PREFIX));

  const notes = await Promise.all(
    noteFiles.map(async (file) => {
      const content = await readTextFile(credentials, file.path);
      const id = file.name.replace(NOTE_PREFIX, '').replace(NOTE_SUFFIX, '');
      return parseNote(content, id);
    }),
  );

  const validNotes = notes.filter((note): note is Note => note !== null);

  return {
    notes: validNotes.sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    ),
    status: {
      mode,
      connected: true,
      message: mode === 'local' ? 'Verbonden via thuisnetwerk' : 'Verbonden via internet',
    },
  };
}

export async function saveNoteToNas(
  config: NasConfig,
  password: string,
  noteId: string | null,
  draft: NoteDraft,
): Promise<{ note: Note; status: ConnectionStatus }> {
  const { credentials, mode } = await connectWithFallback(config, password);
  await ensureDirectory(credentials, config.folder);

  const id = noteId ?? createNoteId();
  const note: Note = {
    id,
    title: draft.title.trim() || 'Zonder titel',
    body: draft.body,
    updatedAt: new Date().toISOString(),
  };

  await writeTextFile(
    credentials,
    noteFilePath(config.folder, id),
    JSON.stringify(note, null, 2),
  );

  return {
    note,
    status: {
      mode,
      connected: true,
      message: mode === 'local' ? 'Opgeslagen op NAS (thuis)' : 'Opgeslagen op NAS (extern)',
    },
  };
}

export async function deleteNoteFromNas(
  config: NasConfig,
  password: string,
  noteId: string,
): Promise<ConnectionStatus> {
  const { credentials, mode } = await connectWithFallback(config, password);
  await deleteFile(credentials, noteFilePath(config.folder, noteId));

  return {
    mode,
    connected: true,
    message: mode === 'local' ? 'Verwijderd van NAS (thuis)' : 'Verwijderd van NAS (extern)',
  };
}
