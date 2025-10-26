const LOCALES: Record<string, Record<string, string>> = {} as any;

function loadLocale(_code = 'en') {
  // Try dynamic import of locale JSON; populate asynchronously and keep synchronous fallback empty
  try {
    import('@/data/locale/en.json')
      .then(m => { LOCALES['en'] = (m as any).default || (m as any) || {}; })
      .catch(() => { LOCALES['en'] = {}; });
  } catch (e) {
    LOCALES['en'] = {};
  }
}

export function t(key: string, fallback?: string) {
  if (!LOCALES['en']) loadLocale('en');
  return (LOCALES['en'] && LOCALES['en'][key]) || fallback || key;
}

export default { t };
