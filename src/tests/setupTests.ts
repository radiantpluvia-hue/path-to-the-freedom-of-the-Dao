// Test setup: silence jsdom "Not implemented" warnings for media elements
// Some components call audio/video APIs which jsdom doesn't implement fully.
// Provide no-op implementations for commonly used methods so tests don't log errors.
/* eslint-disable no-undef */
try {
  // play should return a promise in modern browsers
  if (typeof HTMLMediaElement !== 'undefined') {
    // Only override if the implementation throws / is missing
    try { HTMLMediaElement.prototype.play = HTMLMediaElement.prototype.play || (function () { return Promise.resolve(); }); } catch (e) { /* ignore */ }
    try { HTMLMediaElement.prototype.pause = HTMLMediaElement.prototype.pause || function () { /* noop */ }; } catch (e) { /* ignore */ }
    try { HTMLMediaElement.prototype.load = HTMLMediaElement.prototype.load || function () { /* noop */ }; } catch (e) { /* ignore */ }
  }
} catch (e) {
  // Some runtimes may not have HTMLMediaElement; ignore in that case
}

// Helpful: hide console noise from other unimplemented APIs if needed
// You can add more shims here if additional jsdom warnings appear.
import '@testing-library/jest-dom';
