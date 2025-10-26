import EventBus from '../system/EventBus';
import { rivalSystem as _rivalSystem } from '../systems/systemSingletons';
void _rivalSystem;
import Analytics from '../systems/Analytics';
import LawSystem from '../systems/LawSystem';

// Concrete handlers: analytics recorder and law/dao reaction hooks. RivalSystem
// singleton is available for future richer integrations.
EventBus.on('territoryCaptured', (payload) => {
  try { Analytics.record('territoryCaptured', payload); } catch (e) { /* ignore */ }
  try { LawSystem.onTerritoryCaptured(payload); } catch (e) { /* ignore */ }
  // RivalSystem integration could be added here when payload contains rival ids
});

EventBus.on('influenceApplied', (payload) => {
  try { Analytics.record('influenceApplied', payload); } catch (e) { /* ignore */ }
});

EventBus.on('influenceDecayed', (payload) => {
  try { Analytics.record('influenceDecayed', payload); } catch (e) { /* ignore */ }
});

export default function initEventListeners() { /* marker */ }
