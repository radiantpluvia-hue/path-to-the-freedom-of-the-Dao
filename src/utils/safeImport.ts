export async function safeImport<T = any>(importer: () => Promise<T>): Promise<T | null> {
  try {
    const m = await importer();
    // Prefer default export when present
    return (m as any).default || (m as any);
  } catch (e) {
    return null;
  }
}
