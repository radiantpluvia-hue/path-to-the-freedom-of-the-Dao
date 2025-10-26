let _relicRegistryCache: any = null;

export async function getRelicRegistry(): Promise<any> {
  if (_relicRegistryCache) return _relicRegistryCache;
  try {
    const mod = await import('./relicRegistry');
    _relicRegistryCache = mod;
    return _relicRegistryCache;
  } catch (e) {
    return null;
  }
}

export function getRelicRegistrySync(fallback?: any): any {
  // Prefer explicit injection
  if (fallback) return fallback;
  if (_relicRegistryCache) return _relicRegistryCache;
  return null;
}

export function clearRelicRegistryCache() { _relicRegistryCache = null; }
