# Copilot Task: Path to Dao — Implementation Plan

This file captures the Copilot task instructions provided by the designer and the ordered implementation plan.

Overview

- Focus: idle loop depth, meditation variants, breakthrough mechanics, disruption events, living event system, NPC relationships, lore discovery, and Dao resonance.
- Exclude: Idle-loop Risk/Reward Tension (7) and presentation polish (8).

High-level architecture

- WorldState
- IdleManager
- MeditationSubsystem
- BreakthroughChallenge
- EventManager
- RumorSystem
- NPCManager
- RelationshipManager
- LoreCodex

Data templates

- Meditation templates: `/data/meditations/*.json`
- Event templates: `/data/events/*.json`
- NPC templates: `/data/npcs/*.json`

Implementation Tasks (A-H)

A — WorldState & Infrastructure
B — IdleManager + MeditationSubsystem
C — BreakthroughChallenge (minigame)
D — Disruption Events for Idle Sessions
E — Living Event System & Event Chains
F — Rumor System
G — NPC & Relationship Realism
H — Lore Discovery & Codex

Next steps

1. Implement WorldState and IdleManager skeleton with meditation tick plumbing (Task A, then Task B).
2. Add meditation types and simple progress math.
3. Implement EventManager interrupts and stateful event chains.
4. Add BreakthroughChallenge skeleton and NPC idle progression.
5. Add RumorSystem and LoreCodex minimal implementations.

Testing & QA

- Unit tests for meditation math, event chains, and breakthrough probability.
- Integration smoke test: start idle session -> interrupt -> resolve -> verify outcomes.

Developer notes

- Keep all mutations through `WorldState.applyMutation(mutation)`.
- Use data-driven templates for meditations/events.
- Provide migration shims if state shape changes.

---

If you want me to start implementing Task A now, reply: "Start Task A" and I'll create `src/systems/worldState.ts`, wire it into the store, add basic unit tests, and continue to Task B. Otherwise tell me which task to start or which deliverable to prioritize.