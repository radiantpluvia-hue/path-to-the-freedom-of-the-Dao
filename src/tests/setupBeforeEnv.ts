// Early test setup: run before modules are loaded. Provide no-op shims for media APIs
// so jsdom doesn't emit 'Not implemented' console errors when components mount.
try {
  // Guard for non-jsdom environments
  if (typeof global !== 'undefined' && (global as any).window) {
    // Create minimal HTMLMediaElement shims if missing
    try {
      if (typeof (global as any).HTMLMediaElement !== 'undefined') {
        const proto = (global as any).HTMLMediaElement.prototype;
        if (!proto.play || typeof proto.play !== 'function') {
          proto.play = function () { return Promise.resolve(); };
        }
        if (!proto.pause || typeof proto.pause !== 'function') {
          proto.pause = function () { /* noop */ };
        }
        if (!proto.load || typeof proto.load !== 'function') {
          proto.load = function () { /* noop */ };
        }
      }
    } catch (e) {
      // swallow any errors — tests should still run
    }
  }
} catch (e) {
  // ignore
}

// Also silence jsdom's "Not implemented" console errors for media methods by
// filtering console.error messages that match the jsdom not-implemented pattern.
// This is less invasive than changing component code and prevents noisy test
// output caused by jsdom's internal stubs.
try {
  if (typeof console !== 'undefined') {
    const origConsoleError = console.error.bind(console);
    (global as any).__origConsoleError = origConsoleError;
    console.error = (...args: any[]) => {
      try {
        const first = args && args[0];
        if (typeof first === 'string' && first.includes('Not implemented: HTMLMediaElement.prototype')) {
          // swallow these specific jsdom not-implemented errors
          return;
        }
        // sometimes jest prints Error objects; check message property
        if (first && first.message && typeof first.message === 'string' && first.message.includes('Not implemented: HTMLMediaElement.prototype')) {
          return;
        }
      } catch (e) {
        // ignore filter errors and fall through to original
      }
      origConsoleError(...args);
    };
  }
} catch (e) {
  // ignore
}
