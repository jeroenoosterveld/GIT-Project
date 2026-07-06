import { BUILD_VERSION } from '../constants/buildVersion';

const BASE_PATH = '/Memory-game';

export async function fetchLatestVersion(): Promise<string | null> {
  if (typeof fetch === 'undefined') {
    return null;
  }

  try {
    const response = await fetch(`${BASE_PATH}/version.txt?_=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const latest = (await response.text()).trim();
    return latest || null;
  } catch {
    return null;
  }
}

export function isUpdateAvailable(latestVersion: string | null): boolean {
  return Boolean(latestVersion && latestVersion !== BUILD_VERSION);
}

export function applyUpdate(latestVersion: string) {
  const target = new URL(`${BASE_PATH}/`, window.location.origin);
  target.searchParams.set('v', latestVersion);
  target.searchParams.set('_', String(Date.now()));
  window.location.assign(target.toString());
}

export { BUILD_VERSION };
