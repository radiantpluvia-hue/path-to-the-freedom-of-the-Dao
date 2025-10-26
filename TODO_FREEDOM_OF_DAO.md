# TODO: Freedom of Dao — Procedural Chronicle

Status: Open

Design goal: Create a procedural, generational Xianxia sandbox where the player shapes their destiny and each playthrough generates a unique "Chronicle of [Player Name]".

If already completed: mark individual checklist items as `- [x]` and add a one-line note linking to the implementing files.

Core concepts and tasks

- Life & Progression
  - [ ] Life Phases instead of Acts
    - Mortal → Cultivator → Legendary cultivator → Earth Immortal → Immortal → Heaven Immortal→ Freedom Immortal→ Freedom Sage → Great Dao Sage→  Zenith Cultivator → Zenith Heaven cultivator →Transcendent → Reincarnation
    - Each phase dynamically generates events and challenges
  - [x] Life Phases instead of Acts — implemented (minimal LifePhase/LifeArc runtime, phase transitions, snapshots).
    - Implemented: src/systems/LifePhaseSystem.ts, src/systems/LifeArcSystem.ts, src/store/useGameStore.ts (lifePhase initialization & snapshot), src/tests/LifePhasePersistence.test.ts

- Procedural Sandbox World
  - [x] Regions, sects, ruins, and realms to explore — implemented (world/event packs + domain/sect data/UI).
    - Implemented: src/systems/SectSystem.ts, src/components/DomainPanel.tsx, sandbox_events.json, murim_events.json
  - [x] Random encounters and inheritances — implemented (event packs + LifeArc/NarrativeEngine/Legacy remnant flow).
    - Implemented: src/events/executors/* (eventExecutors_act*.ts), src/systems/NarrativeEngine.ts, src/systems/LegacySystem.ts
  - [x] Player actions: meditate, travel, duel, recruit, trade, etc. — implemented (executors + store helpers + UI hooks).
    - Implemented: utils/eventExecutors_act2.ts / act3.ts, src/store/useGameStore.ts (travelTo, reincarnate, sect recruitment), src/components/DomainPanel.tsx

- Generational Legacy System
  - [x] Death isn’t the end — reincarnation passes on traits, bloodlines, karma (basic reincarnation flow and legacy remnants exist).
    - Implemented: src/store/useGameStore.ts (reincarnate logic), src/systems/LegacySystem.ts, src/systems/NarrativeEngine.ts (karma/legacyRemnants), src/systems/LifePhaseSystem.ts
  - [x] Build families, disciples, and sects that persist across lives — partially implemented (sect/faction systems and RivalSystem supporting evolution/persistence).
    - Implemented: src/systems/SectSystem.ts, src/systems/RivalSystem.ts, src/store/useGameStore.ts (sect/faction persistence)

- Procedural Narrative / Cultivation Chronicle
  - [x] Dynamic text generation based on choices and fate — implemented (LifePhase/LifeArc renderNovel + narrative templates).
    - Implemented: src/systems/LifePhaseSystem.ts, src/systems/narrativeTemplates.ts, src/components/ui/LifeNovelModal.tsx
  - [x] Each playthrough becomes a unique novel — implemented (novel rendering & lifePhase snapshot saved to saves).
    - Implemented: src/components/ui/LifeNovelModal.tsx, src/systems/LifePhaseSystem.ts
  - [x] Exportable as a “Chronicle of [Player Name]” — partially implemented (render -> UI available; explicit file-export helper can be added; lifePhase snapshot saved).
    - Implemented: src/components/ui/LifeNovelModal.tsx, src/systems/SaveLoadSystem.ts (lifePhaseSnapshot)

- Living World Simulation
  - [x] NPCs cultivate, die, and ascend — functionality present via RivalSystem evolution and life-phase events (partial; continuous NPC life-simulation can be extended).
    - Implemented: src/systems/RivalSystem.ts, utils/act7_monologue.ts, src/store/useGameStore.ts (death/reincarnation hooks)
  - [x] Sects rise and fall — implemented (SectSystem + combat/sect war handling).
    - Implemented: src/systems/SectSystem.ts, src/systems/CombatSystem.ts
  - [x] Heaven sends calamities and wars — implemented (HeavenlyDaoSystem + act7 tribulation/tribulationResolver flow).
    - Implemented: src/systems/HeavenlyDaoSystem.ts, utils/tribulationResolver.ts, utils/act7_monologue.ts
  - [x] Player can interact or ignore — implemented (event choices & branching everywhere: events, missions, domain actions).
    - Implemented: src/events/*.json, src/events/executors/*, src/store/useGameStore.ts

- Choice & Consequence
  - [x] Every decision changes karma, Dao alignment, and destiny — implemented (karmaHistory, narrative consequences, dao fields updated by events).
    - Implemented: src/systems/NarrativeEngine.ts (karmaHistory), src/store/useGameStore.ts (karma, daoPrinciple, daoComprehension)
  - [x] Randomized outcomes ensure each playthrough differs — implemented (RNG-driven content packs & event generators).
    - Implemented: event executor registries, RNG helpers, src/events/executors/eventExecutors_registry.ts

- Dao Philosophy System
  - [x] Player’s Dao evolves with choices — implemented (daoPrinciple/daoComprehension/daoHeart + HeavenlyDaoSystem influence).
    - Implemented: src/systems/HeavenlyDaoSystem.ts, src/store/useGameStore.ts, utils/mentorExecutors.ts
  - [x] Dao path determines powers, events, and endings — implemented (event gating & narrative hooks reference dao state and influence outcomes).
    - Implemented: meetsPrereqs.ts (prereq checks), narrativeTemplates.ts, LifePhase event recording

- Dynamic Endgames
  - [x] Reach Immortality — implemented (cultivation realms, forced ascension to immortal world and ascension executor).
    - Implemented: src/data/cultivationRealms.ts, src/store/useGameStore.ts (forced ascension injection), src/events/executors/eventExecutors_global.ts, tests/ascension.test.ts
  - [ ] Create a Universe / Overthrow Heaven / Break Samsara / Achieve True Dao — conceptual endgames present in narrative text and placeholders (partial; event content and finalization remain to be expanded).

Implementation notes / next steps

- Mark completed items: Run a quick audit across the repo to detect which features already exist (sects, reincarnation, generational data, export functions). If an item is implemented, mark it done and list the source files.

- Prioritize the next coding task: once audit is complete, pick the highest-priority unimplemented item and start an incremental, test-driven implementation (small, mergeable changes). Suggested first coding tasks:
  1. Persisted "life phase" state and phase transitions (PlayerState + Save/Load migration + tests)
 2. Simple sect model (create/join/leave) in store with tests and a tiny UI panel
 3. Generational seed on reincarnation (inherit traits + simple reincarnation flow)

- Export/Chronicle: Implement a small exporter that serializes a playthrough summary (player name, key events, major achievements) to Markdown. Useful early and low-risk.

Notes
- This file is intentionally high-level. Break each checklist item into concrete sub-tasks when converting to issues or PRs.
- If you'd like, I can run a quick repo scan and mark which sub-items are already implemented, then begin coding the first unimplemented item with tests and docs.

---
*Created automatically per user request.*

## Philosophical Phase Essences (design additions)

- [ ] Life Phases instead of Acts  
  Each phase adds new gameplay verbs, power rules, and narrative tone.

  - Mortal (凡人) — Bound by fate, seeking meaning
    *Focus:* survival, fate, discovery
    *Unlocks:* insights, mortal professions, first mentors

  - Cultivator (修士) — Seeker of the Dao
    *Focus:* comprehension, tribulations, ambition
    *Unlocks:* Dao path selection, rival arcs, sect politics

  - Legendary Cultivator (传说修士) — One whose name shakes the world
    *Focus:* reputation, legacy
    *Unlocks:* domain management, disciples, sect creation

  - Earth Immortal (地仙) — A fragment of Heaven on Earth
    *Focus:* laws, elemental mastery, transcending mortality
    *Unlocks:* weather control, elemental Dao insights

  - Immortal (天仙) — Pierces Heaven’s veil
    *Focus:* dimensional travel, cosmic insight
    *Unlocks:* access to Immortal Realms, fate weaving

  - Freedom Immortal (逍遥仙) — Free from heaven’s yoke
    *Focus:* rebellion, rewriting destiny
    *Unlocks:* interact with HeavenlyDaoSystem directly

  - Great Dao Sage (大道圣者) — One whose words shape reality
    *Focus:* world creation, time control
    *Unlocks:* build new universes, shape karma directly

  - Zenith Cultivator (极境修士) — Beyond comprehension
    *Focus:* metaphysics, existence itself
    *Unlocks:* rewrite reality laws

  - Transcendent (超脱者) — Beyond the Dao
    *Focus:* omniscience, endgame events
    *Unlocks:* meta-sandbox (change fundamental rules)

  - Reincarnation (轮回) — The Endless Cycle
    *Focus:* reflection, karmic balance
    *Unlocks:* reincarnation legacies, karmic echoes

This turns progression into a storytelling and gameplay arc generator — each tier changes player verbs and the narrative tone.

## World Evolution Hooks (per-phase world changes)

- [ ] World Evolution
  - Each ascension resets, alters, or expands the world
  - Mortal → Cultivator: unlocks local map features, new NPC tiers
  - Cultivator → Immortal: adds heavenly realms, parallel dimensions, and immortal NPC strata
  - Immortal → Transcendent: enable "Heaven Editor" sandbox (world-building tools)

These hooks keep the universe evolving and reactive to player ascension.

## Meta-Progression / Reincarnation Cycle
- [ ] Karma Tree System — permanent upgrades earned by karmic actions across runs
- [ ] Descendant System — descendants inherit diluted bloodlines and random traits
- [ ] Chronicle Merge — past life stories become in-universe myths in future runs

## Narrative Chronicle Enhancements
- [ ] Life Chronicle Export — export entire playthrough as markdown story (implemented: exporter + UI hook)
- [ ] "Heaven's Narrator" AI — dynamic voice that comments on player's deeds
- [ ] Chronicle Merge — generations link to a continuous saga (e.g., "The House of Lin Tian")

## Freedom Systems
- [ ] Sect Creation — custom name, emblem, philosophy, unique Dao code
- [ ] Universe Founding — player can seed new universes as endgame
- [ ] Narrative Editor — late game allows rewriting past events ("Change Fate")

