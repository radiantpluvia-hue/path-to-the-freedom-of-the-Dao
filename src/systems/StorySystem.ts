import { GameState } from '../types';
import { logger } from '../utils/logger';
import type IStoryProvider from './IStoryProvider';
import { Quest, checkQuestCompletion } from './QuestSystem';
import { PlaytestScaling } from '../utils/playtestScaling';
import { RACE_BACKGROUNDS } from '../data/raceBackgrounds';
import { getRealmKeyFromPlayerSync } from '../utils/realmHelpersLoader';
import { REALM_ORDER } from '../data/cultivationRealms';
import { isActReleased } from '../config/release';

// Minimal type-compatible interfaces to avoid heavy imports here
// Allow optional tags/keywords so content can steer tone explicitly
export interface StoryEvent { id: string; title: string; description: string; choices: any[]; conditions?: any; executorId?: string; autoResolve?: boolean; onTrigger?: (gs: GameState) => void; minRealm?: string; maxRealm?: string; worldTypes?: string[]; tags?: string[]; keywords?: string[] }
export interface StoryChoice { id: string; text: string; consequences: any; conditions?: any; baseWeight?: number; affinityWeight?: number }
export interface StoryAct { id: string; title: string; description: string; mainQuests: Quest[]; sideQuests: Quest[]; events: StoryEvent[]; unlockConditions?: any; raceEvents?: Record<string, StoryEvent[]>; backgroundEvents?: Record<string, StoryEvent[]> }

export class StorySystem implements IStoryProvider {
  private acts: Map<string, StoryAct> = new Map();
  private activeEvents: Map<string, StoryEvent> = new Map();
  private diagnostics = { totalChecked: 0, filtered: 0, reasons: { worldType: 0, minRealm: 0, maxRealm: 0 }, samples: { worldType: [] as string[], minRealm: [] as string[], maxRealm: [] as string[] }, sampleCap: 10 };

  constructor() {
    if (typeof window === 'undefined') {
      (async () => {
        try {
          const loader = await import('@/utils/storyLoader');
          const nodeRequire: any = (typeof window === 'undefined' && typeof require === 'function') ? Function('return require')() : null;
          const path = nodeRequire ? nodeRequire('path') : null;
          const rootDir = path ? path.resolve(__dirname, '../../') : undefined;
          const loadFn = (loader as any).loadActsFromJson || ((loader as any).default && (loader as any).default.loadActsFromJson);
          const loadedActs = loadFn ? await loadFn(rootDir).catch(() => null) : null;
          if (loadedActs && loadedActs.size > 0) {
            const filtered = new Map<string, StoryAct>();
            for (const [id, act] of loadedActs.entries()) {
              if (isActReleased(id)) filtered.set(id, act as StoryAct);
            }
            this.acts = filtered;
            return;
          }
        } catch {
          // ignore
        }
      })();
    }

    this.initializeDefaultActs();
  }

  private initializeDefaultActs() {
    (async () => {
      try {
        const mod = await import('./storyDefaultActs');
        if (mod && typeof mod.loadDefaultActs === 'function') {
          const loaded = mod.loadDefaultActs();
          if (loaded && loaded instanceof Map) {
            this.acts = loaded as Map<string, StoryAct>;
            return;
          }
        }
      } catch (_e) {
        // ignore
      }
    })();
  }
  // Get current act
  getCurrentAct(gameState: GameState): StoryAct | null {
    
    return this.acts.get(gameState.story.currentAct) || null;
  }

  // Return a personalized act merged with race/background-specific events and a side-story placeholder.
  getPersonalizedAct(gameState: GameState): StoryAct | null {
    const base = this.getCurrentAct(gameState);
    if (!base) return null;

    const act: StoryAct = JSON.parse(JSON.stringify(base));
    const playerRace = (gameState.player as any).race || 'Unknown';
    const playerBackground = (gameState.player as any).background || 'Unknown';

    // Merge race-specific events
    if (act.raceEvents && act.raceEvents[playerRace]) {
      act.events = act.events.concat(act.raceEvents[playerRace]);
    } else {
      const raceDefs = (RACE_BACKGROUNDS as any)[playerRace];
      if (raceDefs && raceDefs.length > 0) {
        const bg = raceDefs[0];
        const raceEvent: StoryEvent = {
          id: `${act.id}_${String(playerRace).toLowerCase()}_intro`,
          title: `${playerRace} Origin`,
          description: `As a ${playerRace}, your origins shape how you approach the Dao. ${bg.description || ''}`,
          choices: [
            {
              id: 'continue',
              text: 'Continue',
              consequences: { flags: { [`${playerRace}_intro_seen`]: true } }
            }
          ]
        };
        act.events.push(raceEvent);
      }
    }

    // Merge background-specific events
    if (act.backgroundEvents && act.backgroundEvents[playerBackground]) {
      act.events = act.events.concat(act.backgroundEvents[playerBackground]);
    } else {
      const raceDefs = (RACE_BACKGROUNDS as any)[playerRace];
      const bgDef = raceDefs?.find((b: any) => b.id === playerBackground) || raceDefs?.[0];
      if (bgDef) {
        const bgEvent: StoryEvent = {
          id: `${act.id}_${String(playerBackground || 'background').toLowerCase()}_path`,
          title: `${bgDef?.name || 'Background Path'}`,
          description: `Your background influences this chapter: ${bgDef?.description || ''}`,
          choices: [
            {
              id: 'accept',
              text: 'Accept your path',
              consequences: { flags: { [`${playerBackground}_path_seen`]: true } }
            }
          ]
        };
        act.events.push(bgEvent);
      }
    }

    // Ensure side quest placeholder
    if (!act.sideQuests || act.sideQuests.length === 0) {
      act.sideQuests = [
        {
          id: 'side_placeholder',
          title: 'Side Stories (Placeholder)',
          description: 'A placeholder for side stories and optional content. Fill this with side quests later.',
          status: 'inactive',
          objectives: []
        }
      ];
    }

    return act;
  }

  // Released and unlocked acts
  getAvailableActs(gameState: GameState): StoryAct[] {
    return Array.from(this.acts.values()).filter(
      act => isActReleased(act.id) && this.isActUnlocked(act, gameState)
    );
  }

  // All acts for UI; unreleased ones remain visible but disabled with a label.
  getActsForUI(
    gameState: GameState
  ): Array<{ id: string; title: string; description: string; disabled: boolean }> {
    const list = Array.from(this.acts.values()).sort((a, b) => {
      const na = parseInt(a.id.replace(/\D+/g, ''), 10);
      const nb = parseInt(b.id.replace(/\D+/g, ''), 10);
      return (isNaN(na) ? 0 : na) - (isNaN(nb) ? 0 : nb);
    });

    return list.map(act => {
      const released = isActReleased(act.id);
      const unlocked = this.isActUnlocked(act, gameState);
      let description = act.description;

      if (!released) {
        description += ' [Coming soon]';
      } else if (!unlocked && act.unlockConditions) {
        const parts: string[] = [];
        if (act.unlockConditions.previousAct) parts.push(`after ${act.unlockConditions.previousAct}`);
        if (typeof act.unlockConditions.level === 'number') parts.push(`Level ${act.unlockConditions.level}+`);
        if (act.unlockConditions.realm) parts.push(`Realm: ${act.unlockConditions.realm}`);

        if (parts.length > 0) {
          const haveRealm = getRealmKeyFromPlayerSync(gameState.player as any);
          description += ` [Requires ${parts.join(', ')}. You are Level ${gameState.player.level ?? 0}, Realm ${haveRealm}, Current Act: ${gameState.story.currentAct}]`;
        }
      }

      return {
        id: act.id,
        title: act.title,
        description,
        disabled: !released || !unlocked
      };
    });
  }

  // Unlock logic
  private isActUnlocked(act: StoryAct, gameState: GameState): boolean {
    if (!act.unlockConditions) return true;

    const { player, story } = gameState;
    const conditions = act.unlockConditions;

  if (conditions.previousAct && story.currentAct !== conditions.previousAct) return false;
  if (conditions.level && (player.level ?? 0) < conditions.level) return false;
  if (conditions.realm && getRealmKeyFromPlayerSync(player as any) !== conditions.realm) return false;

    return true;
  }

  // Progression
  progressToNextAct(gameState: GameState): boolean {
    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) return false;

    const allMainQuestsComplete = currentAct.mainQuests.every(q => q.status === 'completed');
    if (!allMainQuestsComplete) return false;

    const currentActNum = parseInt(currentAct.id.replace(/\D+/g, ''), 10);
    const nextActId = `act${currentActNum + 1}`;

    if (this.acts.has(nextActId)) {
      gameState.story.currentAct = nextActId;
      return true;
    }
    return false;
  }

  // Quest completion
  checkQuestCompletion(gameState: GameState): string[] {
    const completedQuestIds = checkQuestCompletion(gameState);

    const currentAct = this.getCurrentAct(gameState);
    if (currentAct) {
      [...currentAct.mainQuests, ...currentAct.sideQuests].forEach(quest => {
        if (completedQuestIds.includes(quest.id) && quest.status === 'active') {
          quest.status = 'completed';
          if (!gameState.story.completedQuests.includes(quest.id)) {
            gameState.story.completedQuests.push(quest.id);
          }
          this.onQuestComplete(quest, gameState);
        }
      });
    }

    return completedQuestIds;
  }

  private onQuestComplete(quest: Quest, gameState: GameState): void {
    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) return;

    const nextQuest = [...currentAct.mainQuests, ...currentAct.sideQuests].find(q => q.status === 'inactive');
    if (nextQuest) nextQuest.status = 'active';

    this.progressToNextAct(gameState);
  }

  // Events
  getAvailableEvents(gameState: GameState): StoryEvent[] {
    // Safe integration: if a NarrativeEngine is present in systems, allow it to generate templates
    try {
      const narrativeEngine = (gameState as any).systems?.narrativeEngine || (gameState as any).narrativeEngine;
      if (narrativeEngine && typeof narrativeEngine.generateEventsForPlayer === 'function') {
        const generated = narrativeEngine.generateEventsForPlayer({ player: gameState.player, world: gameState.world, story: gameState.story, ui: gameState.ui, systems: gameState.systems });
        if (Array.isArray(generated) && generated.length > 0) {
          // Convert NarrativeTemplate-like objects into StoryEvent-compatible objects safely
          const converted = generated.map((t: any, idx: number) => {
            const id = t.id || `narrative_generated_${Date.now()}_${idx}`;
            return {
              id,
              title: t.title || t.name || 'Narrative Event',
              description: t.description || '',
              choices: (t.choices || []).map((c: any, ci: number) => ({ id: c.id || `c_${ci}`, text: c.text || (c.name || 'Choose'), consequences: c.consequences || {} })),
              // keep minimal fields expected by StoryEvent
            } as StoryEvent;
          }).filter((e: StoryEvent) => this.isEventAvailable(e, gameState));

          // If there is no current act, return generated events directly
          const currentAct = this.getCurrentAct(gameState);
          if (!currentAct) {
            if ((gameState.story as any)?.reactiveMode) return converted;
            return converted;
          }

          // reset diagnostics for this query
          this.resetDiagnostics();
          const baseEvents = currentAct.events.filter(e => this.isEventAvailable(e, gameState));
          return [...baseEvents, ...converted];
        }
      }
    } catch (err) {
      // Integration must be non-fatal — fall back to base events only
      // eslint-disable-next-line no-console
  logger.warn('NarrativeEngine integration failed:', err);
    }

    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) {
      // debug
      // eslint-disable-next-line no-console
  logger.warn('StorySystem.getAvailableEvents: no currentAct for', gameState.story && gameState.story.currentAct);
      return [];
    }

    // reset diagnostics for this query
    this.resetDiagnostics();
    const baseEvents = currentAct.events.filter(e => this.isEventAvailable(e, gameState));
    if ((baseEvents || []).length === 0) {
      // If there are no available events this is often expected (player not meeting
      // conditions). Lower the severity to info to avoid noisy warnings in normal
      // dev iteration. Developers can enable INFO/DEBUG logs via LOG_LEVEL or
      // DEBUG_LOGS to inspect diagnostics when needed.
      logger.info(`StorySystem.getAvailableEvents: no available events for act ${currentAct.id}. diagnostics:`, this.getDiagnosticsSummary());
    }

    // Apply light era-aware biasing: sort events using world.eventBias (dark/neutral/light)
    try {
      const bias = (gameState.world as any)?.eventBias as { dark: number; neutral: number; light: number } | undefined;
      if (bias && typeof bias.dark === 'number' && typeof bias.neutral === 'number' && typeof bias.light === 'number') {
        const scoreTone = (e: StoryEvent): 'dark' | 'neutral' | 'light' => {
          // 1) Prefer explicit tone tags if present
          const t = e.tags || e.keywords || [];
          const lower = Array.isArray(t) ? t.map(x => (x || '').toString().toLowerCase()) : [];
          if (lower.some(x => x === 'tone:dark' || x === 'dark')) return 'dark';
          if (lower.some(x => x === 'tone:light' || x === 'light')) return 'light';
          if (lower.some(x => x === 'tone:neutral' || x === 'neutral')) return 'neutral';

          // 2) Fall back to simple text heuristic when tags are missing
          const text = `${e.id || ''} ${e.title || ''} ${e.description || ''}`.toLowerCase();
          if (/demon|blood|shadow|assassin|bandit|curse|corrupt|dark/i.test(text)) return 'dark';
          if (/holy|spirit|spring|benevol|compassion|mercy|bless|light/i.test(text)) return 'light';
          return 'neutral';
        };
        const scored = baseEvents.map(ev => {
          const tone = scoreTone(ev);
          const w = tone === 'dark' ? bias.dark : tone === 'light' ? bias.light : bias.neutral;
          return { ev, w };
        });
        // Stable sort by weight desc
        const withIndex = scored.map((x, i) => ({ ...x, i }));
        withIndex.sort((a, b) => (b.w - a.w) || (a.i - b.i));
        return withIndex.map(x => x.ev);
      }
    } catch (e) {
      // non-fatal; fall back to base ordering
      logger.debug('Era bias sort skipped:', e as any);
    }
    return baseEvents;
  }

  private isEventAvailable(event: StoryEvent, gameState: GameState): boolean {
    this.diagnostics.totalChecked++;
  
    // Phase 1 world / realm gating
    try {
      const currentWorldType: 'murim' | 'cultivation' | 'immortal' = (gameState.world.currentWorldType as any) || 'murim';
      const currentActId = (gameState.story && (gameState.story as any).currentAct) || '';
      const envAllow = (() => {
        try {
          const v = (globalThis as any).__STORY_ALLOW_SANDBOX_EVENTS__ ?? (typeof process !== 'undefined' && (process as any).env && (process as any).env.STORY_ALLOW_SANDBOX_EVENTS);
          return v === '1' || v === 'true';
        } catch (e) {
          return false;
        }
      })();
      const skipRealmGating = envAllow || (typeof currentActId === 'string' && /_events$/.test(currentActId));
      const { minRealm, maxRealm, worldTypes } = event;
      // Realm ordering via REALM_ORDER
  // Use imported REALM_ORDER
  // (kept inside try to preserve original error handling semantics)
      const realmIndex = (r: string | undefined) => r ? REALM_ORDER.indexOf(r) : -1;
  const playerRealmKey = getRealmKeyFromPlayerSync(gameState.player as any);
      const playerIdx = realmIndex(playerRealmKey);
      if (!skipRealmGating) {
        if (minRealm) {
          const minIdx = realmIndex(minRealm);
          if (minIdx !== -1 && playerIdx !== -1 && playerIdx < minIdx) {
            this.diagnostics.filtered++; this.diagnostics.reasons.minRealm++;
            if (this.diagnostics.samples.minRealm.length < this.diagnostics.sampleCap) this.diagnostics.samples.minRealm.push(event.id);
            return false;
          }
        }
        if (maxRealm) {
          const maxIdx = realmIndex(maxRealm);
          if (maxIdx !== -1 && playerIdx !== -1 && playerIdx > maxIdx) {
            this.diagnostics.filtered++; this.diagnostics.reasons.maxRealm++;
            if (this.diagnostics.samples.maxRealm.length < this.diagnostics.sampleCap) this.diagnostics.samples.maxRealm.push(event.id);
            return false;
          }
        }
      }
      if (worldTypes && worldTypes.length > 0) {
        if (!worldTypes.includes(currentWorldType)) {
          // If event declares only immortal but we are mortal, reject; if we are immortal and event only mortal, reject.
          this.diagnostics.filtered++; this.diagnostics.reasons.worldType++;
          if (this.diagnostics.samples.worldType.length < this.diagnostics.sampleCap) this.diagnostics.samples.worldType.push(event.id);
          return false;
        }
      } else {
        // Default: mortal-only; exclude if in immortal world
        if (currentWorldType === 'immortal') { this.diagnostics.filtered++; this.diagnostics.reasons.worldType++; if (this.diagnostics.samples.worldType.length < this.diagnostics.sampleCap) this.diagnostics.samples.worldType.push(event.id); return false; }
      }
    } catch (err) {
      // Non-fatal: if gating logic errors, fall through to existing checks
      // eslint-disable-next-line no-console
  logger.warn('Event gating check failed:', err);
    }

    if (!event.conditions) return true;

    const { player, story } = gameState;
    const c = event.conditions;

  if (c.realm && getRealmKeyFromPlayerSync(player as any) !== c.realm) return false;
  if (c.level && (player.level ?? 0) < c.level) return false;
    if (c.sect && player.sect !== c.sect) return false;
    if (c.questCompleted && !story.completedQuests.includes(c.questCompleted)) return false;

    if (c.flags) {
      for (const [flag, value] of Object.entries(c.flags)) {
        if (story.storyFlags[flag] !== value) return false;
      }
    }

    return true;
  }

  // Phase 5 diagnostics API
  getDiagnosticsSummary() {
    const { totalChecked, filtered, reasons } = this.diagnostics;
    return {
      totalChecked,
      filtered,
      passed: totalChecked - filtered,
      reasons: { ...reasons },
      samples: { worldType: [...this.diagnostics.samples.worldType], minRealm: [...this.diagnostics.samples.minRealm], maxRealm: [...this.diagnostics.samples.maxRealm] }
    };
  }

  resetDiagnostics() {
    this.diagnostics.totalChecked = 0;
    this.diagnostics.filtered = 0;
    this.diagnostics.reasons.worldType = 0;
    this.diagnostics.reasons.minRealm = 0;
    this.diagnostics.reasons.maxRealm = 0;
    this.diagnostics.samples.worldType = [];
    this.diagnostics.samples.minRealm = [];
    this.diagnostics.samples.maxRealm = [];
  }

  triggerEvent(eventId: string, gameState: GameState): StoryEvent | null {
    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) return null;

    const event = currentAct.events.find(e => e.id === eventId);
    if (!event || !this.isEventAvailable(event, gameState)) return null;

    if (event.onTrigger) event.onTrigger(gameState);
    // If choices declare affinity/base weights, compute runtime ordering so UI shows biased options first.
    try {
      const playerAffinity = (gameState.player as any).destinyAffinity ?? 0;
      const hasWeights = event.choices && event.choices.some(c => typeof (c as any).baseWeight === 'number' || typeof (c as any).affinityWeight === 'number');
      if (hasWeights) {
        // Create a stable sort by computed weight (descending)
        const computed = event.choices.map(c => {
          const base = typeof (c as any).baseWeight === 'number' ? (c as any).baseWeight : 1;
          const aweight = typeof (c as any).affinityWeight === 'number' ? (c as any).affinityWeight : 0;
          const final = Math.max(base + aweight * playerAffinity, 0);
          return { c, final };
        });
        computed.sort((a, b) => b.final - a.final);
        // Replace choices with reordered array for the active event
        event.choices = computed.map(x => x.c as StoryChoice);
      }
    } catch (err) {
      // non-fatal
      // eslint-disable-next-line no-console
  logger.warn('Failed to compute affinity weights for event', eventId, err);
    }
    if (event.executorId) {
      // Use the async executor loader so the registry can dynamically import
      // only the module that contains the requested executor. This avoids
      // bundling all executors into a single large chunk.
      import('../events/executors/eventExecutors_registry')
        .then(async (mod) => {
          const getExecutorAsync = (mod as any).getExecutorAsync;
          const getExecutorSync = (mod as any).getExecutor;
          try {
            if (typeof getExecutorAsync === 'function') {
              const exec = await getExecutorAsync(event.executorId);
              if (exec) exec(gameState);
              return;
            }
            // fallback to sync getter if async loader not available
            const execSync = typeof getExecutorSync === 'function' ? getExecutorSync(event.executorId) : null;
            if (execSync) execSync(gameState);
          } catch (e) {
            logger.warn(`Failed to execute event ${eventId} with executor ${event.executorId}:`, e);
          }
        })
        .catch(e => {
          logger.warn(`Failed to import executor registry for event ${eventId}:`, e);
        });
    }
    // If event requests auto-resolve, pick a choice using affinity weights and apply it immediately
    if (event.autoResolve) {
      try {
        const playerAffinity = (gameState.player as any).destinyAffinity ?? 0;
        let chosen: any = null;
        try {
          // dynamic import to avoid bundler/load-order issues
          try {
            import('@/utils/eventSimulator').then(mod => {
              const chooser = (mod as any);
              if (chooser && typeof chooser.chooseByAffinity === 'function') {
                const ch = chooser.chooseByAffinity(event as any, playerAffinity);
                if (ch) {
                  chosen = ch;
                }
              }
            }).catch(() => { /* ignore */ });
            // Note: chosen may be set asynchronously; if it isn't available synchronously we fall through to no auto-resolve
          } catch (e) {
            // ignore
          }
        } catch (e) {
          // ignore
        }
        if (chosen) {
          // Find corresponding StoryChoice (by id)
          const sc = event.choices.find(ch => ch.id === (chosen as any).id) as StoryChoice | undefined;
          if (sc && this.isChoiceAvailable(sc, gameState)) {
            this.applyChoiceConsequences(sc, gameState);
            // No active event stored since it's immediately resolved
            return null;
          }
        }
      } catch (err) {
        // ignore any failures to auto-resolve
        // eslint-disable-next-line no-console
  logger.warn('Auto-resolve failed for event', eventId, err);
      }
    }

    this.activeEvents.set(eventId, event);
    return event;
  }

  makeChoice(eventId: string, choiceId: string, gameState: GameState): boolean {
    const event = this.activeEvents.get(eventId);
    if (!event) return false;

    const choice = event.choices.find(c => c.id === choiceId);
    if (!choice) return false;

    if (!this.isChoiceAvailable(choice, gameState)) return false;

    this.applyChoiceConsequences(choice, gameState);
    this.activeEvents.delete(eventId);
    return true;
  }

  private isChoiceAvailable(choice: StoryChoice, gameState: GameState): boolean {
    if (!choice.conditions) return true;

    const { player } = gameState;
    const c = choice.conditions;

    if (c.stat) {
      const statValue = (player as any)[c.stat.name];
      if (typeof statValue !== 'number' || statValue < c.stat.min) return false;
    }

    if (c.skill) {
      const skill = player.skills[c.skill.name];
      if (!skill || skill.level < c.skill.min) return false;
    }

    if (c.item) {
      const itemCond = c.item;
      const count = player.inventory
        .filter(i => i.id === itemCond.id)
        .reduce((sum, i) => sum + (i.quantity || 1), 0);
      if (count < itemCond.quantity) return false;
    }

    if (typeof c.karma === 'number' && (player.karma || 0) < c.karma) return false;

      return true;
  }

  private applyChoiceConsequences(choice: StoryChoice, gameState: GameState): void {
    const { player, story } = gameState;

    // Apply minimal playtest scaling to dynamic event consequences
    const consequences = PlaytestScaling.applyScaledEffects(choice.consequences as any, { source: 'event' });

    // Stats
    if (consequences.stats) {
      for (const [stat, value] of Object.entries(consequences.stats)) {
        const delta = Number(value) || 0;
        (player as any)[stat] = ((player as any)[stat] || 0) + delta;
      }
    }

    // Skills
    if (consequences.skills) {
      for (const [skillName, value] of Object.entries(consequences.skills)) {
        if (!player.skills[skillName]) {
          player.skills[skillName] = { level: 0, exp: 0, expToNext: 100 };
        }
        player.skills[skillName].level += Number(value) || 0;
        if (player.skills[skillName].level < 0) player.skills[skillName].level = 0;
      }
    }

    // Items
    if (Array.isArray(consequences.items)) {
      consequences.items.forEach((item: any) => {
        const qty = Number(item.quantity) || 0;
        if (qty === 0) return;
        const existingItem = player.inventory.find(i => i.id === item.id);
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + qty;
        } else if (qty > 0) {
          player.inventory.push({
            id: item.id,
            name: item.id,
            description: '',
            quantity: qty
          });
        } else {
          // negative qty with no existing item -> ignore
        }
      });
    }

    // Karma
    if (typeof consequences.karma === 'number') {
      player.karma = (player.karma || 0) + consequences.karma;
    }

    // Sect reputation (best-effort; only if structure exists)
    if (typeof consequences.sectReputation === 'number') {
      const anyPlayer = player as any;
      if (anyPlayer.reputation) {
        anyPlayer.reputation.sect = (anyPlayer.reputation.sect || 0) + consequences.sectReputation;
      }
    }

    // Flags
    if (consequences.flags) {
      story.storyFlags = { ...story.storyFlags, ...consequences.flags };
    }

    // Quest hooks
    if (consequences.questStart) {
      const q = (story.quests || []).find(q => q.id === consequences.questStart);
      if (q && q.status === 'inactive') q.status = 'active';
    }
    if (consequences.questComplete) {
      const q = (story.quests || []).find(q => q.id === consequences.questComplete);
      if (q) {
        q.status = 'completed';
        if (!story.completedQuests.includes(q.id)) {
          story.completedQuests.push(q.id);
        }
      }
    }

    // Optional follow-up event trigger
    if (consequences.eventTrigger) {
      try {
        this.triggerEvent(consequences.eventTrigger, gameState);
      } catch {
        // ignore silent failures for optional chaining
      }
    }
  }

  // Get active quests for current act
  getActiveQuests(gameState: GameState): Quest[] {
    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) return [];

    return [...currentAct.mainQuests, ...currentAct.sideQuests]
      .filter(quest => quest.status === 'active');
  }

  // Get completed quests for current act
  getCompletedQuests(gameState: GameState): Quest[] {
    const currentAct = this.getCurrentAct(gameState);
    if (!currentAct) return [];

    return [...currentAct.mainQuests, ...currentAct.sideQuests]
      .filter(quest => quest.status === 'completed');
  }

  // Add a new quest dynamically
  addQuest(actId: string, quest: Quest, isMainQuest = false): boolean {
    const act = this.acts.get(actId);
    if (!act) return false;

    if (isMainQuest) {
      act.mainQuests.push(quest);
    } else {
      act.sideQuests.push(quest);
    }

    return true;
  }

  // Add a new story event dynamically
  addEvent(actId: string, event: StoryEvent): boolean {
    let act = this.acts.get(actId);
    if (!act) {
      // create a minimal placeholder act so tests can add events dynamically
      act = { id: actId, title: actId, description: '', mainQuests: [], sideQuests: [], events: [] } as StoryAct;
      this.acts.set(actId, act);
    }

    act.events.push(event);
    return true;
  }
}
