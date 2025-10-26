Testing: injecting relicRegistry and store mocks

This project prefers dependency-injection for test determinism. The runtime still falls back to the real `relicRegistry` module, but tests can inject a mock to avoid fiddling with require caches.

What to inject

- Components
  - `InventoryPanel` accepts props: `injectedUseGameStore?: any` and `injectedRelicRegistry?: any`.
  - `MarketPanel` accepts prop: `injectedRelicRegistry?: any`.

- Systems (static injection methods added)
  - `MarketSystem.injectRelicRegistry(mock)`
  - `SaveLoadSystem.injectRelicRegistry(mock)`
  - `EnhancedQuestSystem.injectRelicRegistry(mock)`

Recommended Jest setup patterns

1) If a system or module constructs instances at import-time, inject the mock BEFORE importing the module under test. Example (safe when using CommonJS `require`):

```js
// my.test.js
const mockRelic = {
  findRelic: jest.fn(),
  isRelicClaimed: jest.fn(),
  listRelics: jest.fn(),
  claimRelic: jest.fn(),
  claimRelicAndGet: jest.fn(),
  equipRelicOnPlayer: jest.fn(),
  forceEquipRelicReplacingMythic: jest.fn(),
  relicToEquipment: jest.fn()
};

const MarketSystem = require('../src/systems/MarketSystem').MarketSystem;
MarketSystem.injectRelicRegistry(mockRelic);

// Now require modules that instantiate MarketSystem or run tests
const { createGame } = require('../src/game');
// ... proceed with tests
```

2) For React component tests, pass `injectedRelicRegistry` and `injectedUseGameStore` directly when rendering:

```tsx
import React from 'react';
import { render } from '@testing-library/react';
import { InventoryPanel } from '../src/components/game/InventoryPanel';

const mockRelic = { findRelic: jest.fn(), equipRelicOnPlayer: jest.fn() };
const mockStoreHook = (selector) => selector(mockStoreState);
// also provide helper methods on mockStoreHook if your test needs them
mockStoreHook.getState = () => mockStoreState;
mockStoreHook.setState = (s) => Object.assign(mockStoreState, s);

render(<InventoryPanel injectedUseGameStore={mockStoreHook} injectedRelicRegistry={mockRelic} />);
```

3) When tests need to reset the relic registry state, use the real module's helpers (existing tests still use these):

```js
const RelicRegistry = require('../src/systems/relicRegistry');
RelicRegistry.loadRelicRegistryState({ claimed: [] });
```

Notes

- The injection helpers are intentionally additive and low-risk: code still works in the browser / runtime because every use falls back to the original `require('./relicRegistry')` if no injection is present.
- Prefer passing injected props to components when possible. Use the static injectors for systems that are constructed at import/initialization time.

If you want, I can add a small test example under `src/tests/__fixtures__` demonstrating a full mocked relic flow. Let me know.