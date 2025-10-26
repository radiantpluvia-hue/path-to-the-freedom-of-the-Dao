Encounter Template Schema

This document describes the encounter narrative template schema used by the game's encounter branching system.

Top-level fields
- id: string (unique template id)
- title: string (display title)
- body: string (narrative body shown to the player)
- choices: array of choice objects
- ai: optional object with AI hints
- techniques, hp, atk, def, speed: optional combat tuning fields
- reward: optional reward object

Choice object fields
- id: string (unique within template)
- text: string (button label)
- consequence: one of 'combat' | 'peace' | 'reward' | 'escape'
- nextTemplateId: optional string (id of template to transition to)
- requires: optional gating object (see below)
- reward: optional reward object to apply immediately

Requires object
- skill: string (skill id) and minLevel: number
- itemId: string (requires player to have an item with this id)
- minYuan: number (requires player to have at least this amount)
- flags: object mapping world/story flags to required values (e.g., { discovered_ruins: true })
- questState: { id: string; status: 'not_started'|'active'|'completed' } - gate on quest progress
- chance: number 0..1 - probabilistic gating (uses seeded runtime RNG when available)

Reward object
- yuan: number
- item: { id: string, name?: string, qty?: number }
- cost: optional cost object (e.g., { yuan: 5 }) applied before reward

AI hints
- preferredTechniques: string[] (ids of techniques to prioritize)
- openingBias: boolean (suggests aggressive opening behavior)

Examples

{ "id": "merchant_deal", "title": "A Merchant", "body": "A merchant offers you a trinket.", "choices": [ { "id": "buy", "text": "Buy the trinket", "consequence": "reward", "requires": { "minYuan": 10 }, "reward": { "item": { "id": "trinket_01", "name": "Mysterious Trinket" }, "yuan": 0 } }, { "id": "decline", "text": "Decline", "consequence": "escape" } ] }

Notes
- Templates are loaded by calling `initEncounterNarratives()` at app startup. See `src/data/encounterNarratives.ts`.
- `EncounterModal` displays the current template by reading `player.activeEncounter.branchState.currentTemplateId` (falls back to `player.activeEncounter.encounterId`).
- When choices are chosen, `branchState.choiceHistory` is appended and `currentTemplateId` may update to `nextTemplateId`.
- For deterministic testing of chance-based requires, use `makeSeededRng`/`setRuntimeRng`.

If you want a generator or validation script for templates, I can add a schema JSON and a small validator next.