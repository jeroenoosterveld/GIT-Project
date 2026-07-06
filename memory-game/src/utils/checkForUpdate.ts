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

export async function applyUpdate(latestVersion: string) {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  const url = new URL(window.location.href);
  url.searchParams.set('v', latestVersion);
  window.location.replace(url.toString());
}

export { BUILD_VERSION };
