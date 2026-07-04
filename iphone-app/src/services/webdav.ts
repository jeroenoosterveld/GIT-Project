import { base64Encode } from '../utils/base64';
import { encodePath, joinUrl, normalizeBaseUrl } from '../utils/url';

export type WebDavCredentials = {
  baseUrl: string;
  username: string;
  password: string;
};

export type WebDavEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
};

type RequestOptions = {
  method: string;
  body?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

function authHeader(username: string, password: string): string {
  return `Basic ${base64Encode(`${username}:${password}`)}`;
}

async function webDavRequest(
  credentials: WebDavCredentials,
  path: string,
  options: RequestOptions,
): Promise<Response> {
  const url = joinUrl(credentials.baseUrl, encodePath(path));
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    return await fetch(url, {
      method: options.method,
      headers: {
        Authorization: authHeader(credentials.username, credentials.password),
        ...options.headers,
      },
      body: options.body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parsePropfindEntries(xml: string, basePath: string): WebDavEntry[] {
  const entries: WebDavEntry[] = [];
  const responseBlocks = xml.match(/<[^:>]*:?response[\s\S]*?<\/[^:>]*:?response>/gi) ?? [];

  for (const block of responseBlocks) {
    const hrefMatch = block.match(/<[^:>]*:?href>([^<]+)<\/[^:>]*:?href>/i);
    if (!hrefMatch) {
      continue;
    }

    const href = decodeURIComponent(hrefMatch[1].replace(/\/$/, ''));
    const normalizedBase = `/${basePath.replace(/^\/+/, '').replace(/\/+$/, '')}`;
    const hrefPath = href.startsWith('http')
      ? new URL(href).pathname.replace(/\/+$/, '')
      : href.replace(/\/+$/, '');

    if (hrefPath === normalizedBase || hrefPath.endsWith(normalizedBase)) {
      continue;
    }

    const name = hrefPath.split('/').pop() ?? '';
    if (!name) {
      continue;
    }

    const isDirectory = /<[^:>]*:?collection\s*\/>/i.test(block);
    entries.push({
      name,
      path: joinUrl(basePath, name),
      isDirectory,
    });
  }

  return entries;
}

export async function testConnection(credentials: WebDavCredentials): Promise<void> {
  const response = await webDavRequest(credentials, '', {
    method: 'PROPFIND',
    headers: {
      Depth: '0',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:displayname/></d:prop>
</d:propfind>`,
    timeoutMs: 10000,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Inloggegevens worden niet geaccepteerd.');
  }

  if (!response.ok && response.status !== 207) {
    throw new Error(`Verbinding mislukt (${response.status}).`);
  }
}

export async function ensureDirectory(
  credentials: WebDavCredentials,
  folderPath: string,
): Promise<void> {
  const response = await webDavRequest(credentials, folderPath, {
    method: 'MKCOL',
  });

  if (response.ok || response.status === 405 || response.status === 409) {
    return;
  }

  throw new Error(`Map aanmaken mislukt (${response.status}).`);
}

export async function listFiles(
  credentials: WebDavCredentials,
  folderPath: string,
): Promise<WebDavEntry[]> {
  const response = await webDavRequest(credentials, folderPath, {
    method: 'PROPFIND',
    headers: {
      Depth: '1',
      'Content-Type': 'application/xml',
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop><d:displayname/><d:resourcetype/></d:prop>
</d:propfind>`,
  });

  if (!response.ok && response.status !== 207) {
    throw new Error(`Bestanden ophalen mislukt (${response.status}).`);
  }

  const xml = await response.text();
  return parsePropfindEntries(xml, folderPath).filter((entry) => !entry.isDirectory);
}

export async function readTextFile(
  credentials: WebDavCredentials,
  filePath: string,
): Promise<string> {
  const response = await webDavRequest(credentials, filePath, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Bestand lezen mislukt (${response.status}).`);
  }

  return response.text();
}

export async function writeTextFile(
  credentials: WebDavCredentials,
  filePath: string,
  content: string,
): Promise<void> {
  const response = await webDavRequest(credentials, filePath, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: content,
  });

  if (!response.ok) {
    throw new Error(`Bestand opslaan mislukt (${response.status}).`);
  }
}

export async function deleteFile(
  credentials: WebDavCredentials,
  filePath: string,
): Promise<void> {
  const response = await webDavRequest(credentials, filePath, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Bestand verwijderen mislukt (${response.status}).`);
  }
}

export function buildCredentials(
  baseUrl: string,
  username: string,
  password: string,
): WebDavCredentials {
  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    username,
    password,
  };
}
