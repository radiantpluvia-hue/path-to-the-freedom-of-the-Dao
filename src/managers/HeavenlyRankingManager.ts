// File: src/managers/HeavenlyRankingManager.ts
import { HEAVENLY_RANKING } from '../config/heavenlyDao';
import { makeEntryFromEntity } from '../utils/scoring';
import type { HeavenlyDaoState, HeavenlyRankingSeason, HeavenlyRankEntry } from '../types/heavenly';

/**
 * Notes:
 * - This manager is kept intentionally simple and synchronous.
 * - Hook runSeason() into your world tick scheduler when the world year >= nextSeasonStart.
 * - Replace repo-specific persistence functions with your game's save/load.
 */

const defaultState: HeavenlyDaoState = {
  currentSeason: null,
  archive: [],
};

// Provide global state object (replace with your game's gameState store)
export const heavenlyState: HeavenlyDaoState = defaultState;

/**
 * getEligibleEntities() should be implemented to query your game state
 * and return an array of scoring entities that meet the realm threshold.
 * Replace the placeholder with your game's entity query.
 */
export type EntityProvider = () => Promise<any[]> | any[];

// set by caller (injection for testing)
export let entityProvider: EntityProvider | null = null;

export function setEntityProvider(provider: EntityProvider) {
  entityProvider = provider;
}

export function getEntitiesForRanking() {
  if (!entityProvider) return [];
  const arr = entityProvider();
  return Array.isArray(arr) ? arr : [];
}

export function runSeason(currentYear: number) {
  const provider = getEntitiesForRanking();
  const seasonId = `season-${currentYear}`;
  const start = currentYear;
  const end = currentYear + HEAVENLY_RANKING.RANKING_CYCLE_YEARS;
  // collect + score
  const rawEntries: HeavenlyRankEntry[] = provider
    .filter((e: any) => {
      // Accept only entities at or above MIN_REALM_FOR_RANKING
      // Replace this check with your realm comparison logic
      const realm = e.realm ?? '';
      return realm && realm.startsWith('immortal'); // simple guard; change as needed
    })
    .map((e: any) => makeEntryFromEntity(e));
  // sort composite
  rawEntries.sort((a, b) => b.compositeScore - a.compositeScore);
  const top = rawEntries.slice(0, HEAVENLY_RANKING.MAX_ENTRIES);
  const season: HeavenlyRankingSeason = {
    seasonId,
    seasonStartYear: start,
    seasonEndYear: end,
    entries: top,
    publishedAt: Date.now(),
  };
  // persist
  heavenlyState.currentSeason = season;
  // broadcast (replace with your broadcast manager)
  broadcastToImmortalRealms(createPublishMessage(season));
  return season;
}

export function createPublishMessage(season: HeavenlyRankingSeason) {
  const top5 = season.entries.slice(0, 5).map((e, i) => `${i + 1}) ${e.name}`).join(' | ');
  return `WORLD-BROADCAST: The Heavenly Dao Rankings for ${season.seasonId} have been inscribed. Top 5: ${top5}`;
}

export function broadcastToImmortalRealms(message: string) {
  // Replace with your world's broadcast system for immortal realms
  console.info('[HEAVENLY BROADCAST]', message);
}

/**
 * Immediate replacement when a ranked entity is defeated.
 * Call this from your combat resolution logic.
 */
export function onEntityDefeated(defeatedId: string, attackerEntity: any) {
  const season = heavenlyState.currentSeason;
  if (!season) return false;
  // only attackers from immortal realms qualify
  if (!attackerEntity.realm || !attackerEntity.realm.startsWith('immortal')) return false;
  const idx = season.entries.findIndex(e => e.id === defeatedId);
  if (idx === -1) return false; // only react if defeated was ranked
  const newEntry = makeEntryFromEntity(attackerEntity);
  // replace in-place (keeps slot semantics) then re-sort + trim
  season.entries[idx] = newEntry;
  season.entries.sort((a, b) => b.compositeScore - a.compositeScore);
  season.entries = season.entries.slice(0, HEAVENLY_RANKING.MAX_ENTRIES);
  broadcastToImmortalRealms(`HEAVENLY BROADCAST: ${newEntry.name} has seized the place of ${defeatedId} on the Heavenly Dao Rankings!`);
  return true;
}

/**
 * Called on season end to distribute top-10 rewards and archive the season.
 * Replace reward delivery functions with your game logic.
 */
export function onSeasonEnd() {
  const season = heavenlyState.currentSeason;
  if (!season) return;
  const top10 = season.entries.slice(0, HEAVENLY_RANKING.TOP_REWARD_THRESHOLD);
  top10.forEach((entry, idx) => {
    // only reward players (customize for NPCs/sects)
    if (entry.type === 'player') {
      // replace with your player lookup + reward apply
      console.info(`Granting rewards to player ${entry.name} for rank #${idx + 1}`);
      grantTopRankRewards(entry, idx + 1, season.seasonId);
    } else {
      // optionally create reaction events for NPCs / sects
      createFactionReactionEvents(entry);
    }
  });

  // archive
  heavenlyState.archive.push(season);
  heavenlyState.currentSeason = null;
  broadcastToImmortalRealms(`HEAVENLY DECREE: Season ${season.seasonId} has ended; top cultivators rewarded.`);
}

function grantTopRankRewards(entry: HeavenlyRankEntry, rank: number, seasonId: string) {
  // TODO: implement actual reward logic; placeholders below
  // e.g., add titles, DaoXP, shards, temporary edicts
  console.info(`(placeholder) Grant rewards to ${entry.name} for season ${seasonId} rank ${rank}`);
}

function createFactionReactionEvents(entry: HeavenlyRankEntry) {
  // TODO: use your EventPool to create NPC/sect reactions
  console.info(`(placeholder) Create faction reaction for ${entry.name}`);
}
