"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorySystem = void 0;
const QuestSystem_1 = require("./QuestSystem");
const playtestScaling_1 = require("../utils/playtestScaling");
const raceBackgrounds_1 = require("../data/raceBackgrounds");
const realmHelpers_1 = require("../utils/realmHelpers");
class StorySystem {
    constructor() {
        this.acts = new Map();
        this.activeEvents = new Map();
        // Try loading acts from JSON files at the project root when running in Node (dev scripts).
        // We avoid importing Node modules at module top-level to keep the client bundle free of them.
        if (typeof window === 'undefined') {
            try {
                // Require Node-only helpers conditionally
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const path = require('path');
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { loadActsFromJson } = require('@/utils/storyLoader');
                const rootDir = path.resolve(__dirname, '../../');
                const loadedActs = loadActsFromJson(rootDir);
                if (loadedActs && loadedActs.size > 0) {
                    this.acts = loadedActs;
                    return;
                }
            }
            catch (e) {
                // ignore: fall back to defaults in browser or if loading fails
            }
        }
        // Fallback: initialize default acts for browser runtime
        this.initializeDefaultActs();
    }
    initializeDefaultActs() {
        // Act 1: Beginning Cultivation
        const act1 = {
            id: 'act1',
            title: 'The Path Begins',
            description: 'Your journey into the world of cultivation starts here.',
            mainQuests: [
                {
                    id: 'first_cultivation',
                    title: 'First Steps on the Dao',
                    description: 'Begin your cultivation journey by reaching the Qi Gathering realm.',
                    status: 'active',
                    objectives: [
                        {
                            id: 'reach_qi_gathering',
                            type: 'REACH_REALM',
                            description: 'Reach Qi Gathering realm',
                            target: 'realm',
                            value: 'Qi Gathering',
                            isCompleted: false
                        }
                    ]
                },
                {
                    id: 'join_sect',
                    title: 'Find Your Place',
                    description: 'Join a sect to gain access to resources and teachings.',
                    status: 'inactive',
                    objectives: [
                        {
                            id: 'sect_membership',
                            type: 'HAVE_STAT',
                            description: 'Join any sect',
                            target: 'sect',
                            value: 'any',
                            isCompleted: false
                        }
                    ]
                }
            ],
            sideQuests: [
                {
                    id: 'first_rival',
                    title: 'A Challenger Appears',
                    description: 'Defeat your first rival to establish your reputation.',
                    status: 'inactive',
                    objectives: [
                        {
                            id: 'defeat_first_rival',
                            type: 'DEFEAT_RIVAL',
                            description: 'Defeat any rival',
                            target: 'any',
                            value: 1,
                            isCompleted: false
                        }
                    ]
                }
            ],
            events: [
                {
                    id: 'mysterious_encounter',
                    title: 'Mysterious Encounter',
                    description: 'A hooded figure approaches you with an offer...',
                    conditions: { level: 5 },
                    choices: [
                        {
                            id: 'accept_offer',
                            text: 'Accept the mysterious offer',
                            consequences: {
                                karma: -10,
                                stats: { insight: 20 },
                                flags: { mysterious_ally: true }
                            }
                        },
                        {
                            id: 'decline_offer',
                            text: 'Politely decline',
                            consequences: {
                                karma: 5,
                                stats: { patience: 10 }
                            }
                        }
                    ]
                }
            ]
        };
        this.acts.set('act1', act1);
    }
    // Get current act
    getCurrentAct(gameState) {
        return this.acts.get(gameState.story.currentAct) || null;
    }
    // Return a personalized act merged with race/background-specific events and a side-story placeholder.
    getPersonalizedAct(gameState) {
        const base = this.getCurrentAct(gameState);
        if (!base)
            return null;
        // Deep-clone base act to avoid mutating originals
        const act = JSON.parse(JSON.stringify(base));
        const playerRace = gameState.player.race || 'Unknown';
        const playerBackground = gameState.player.background || 'Unknown';
        // Merge race-specific events
        if (act.raceEvents && act.raceEvents[playerRace]) {
            act.events = act.events.concat(act.raceEvents[playerRace]);
        }
        else {
            // Auto-generate a lightweight placeholder event based on race/background data
            const raceDefs = raceBackgrounds_1.RACE_BACKGROUNDS[playerRace];
            if (raceDefs && raceDefs.length > 0) {
                const bg = raceDefs[0];
                const raceEvent = {
                    id: `${act.id}_${playerRace.toLowerCase()}_intro`,
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
        }
        else {
            const raceDefs = raceBackgrounds_1.RACE_BACKGROUNDS[playerRace];
            let bgDef = undefined;
            if (raceDefs && raceDefs.length > 0) {
                bgDef = raceDefs.find((b) => b.id === playerBackground) || raceDefs[0];
            }
            if (bgDef) {
                const bgEvent = {
                    id: `${act.id}_${(playerBackground || 'background').toLowerCase()}_path`,
                    title: `${(bgDef && bgDef.name) || 'Background Path'}`,
                    description: `Your background influences this chapter: ${(bgDef && bgDef.description) || ''}`,
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
        // Ensure there's a placeholder side quest if none are provided
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
    // Get all available acts
    getAvailableActs(gameState) {
        return Array.from(this.acts.values()).filter(act => this.isActUnlocked(act, gameState));
    }
    // Check if an act is unlocked
    isActUnlocked(act, gameState) {
        if (!act.unlockConditions)
            return true;
        const { player, story } = gameState;
        const conditions = act.unlockConditions;
        if (conditions.previousAct && story.currentAct !== conditions.previousAct) {
            return false;
        }
        if (conditions.level && player.level < conditions.level) {
            return false;
        }
        if (conditions.realm && (0, realmHelpers_1.getRealmKeyFromPlayer)(player) !== conditions.realm) {
            return false;
        }
        return true;
    }
    // Progress to next act
    progressToNextAct(gameState) {
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return false;
        // Check if all main quests are completed
        const allMainQuestsComplete = currentAct.mainQuests.every(quest => quest.status === 'completed');
        if (!allMainQuestsComplete)
            return false;
        // Find next act (simplified - just increment act number)
        const currentActNum = parseInt(currentAct.id.replace('act', ''));
        const nextActId = `act${currentActNum + 1}`;
        if (this.acts.has(nextActId)) {
            gameState.story.currentAct = nextActId;
            return true;
        }
        return false;
    }
    // Check and update quest completion
    checkQuestCompletion(gameState) {
        const completedQuestIds = (0, QuestSystem_1.checkQuestCompletion)(gameState);
        // Update quest statuses
        const currentAct = this.getCurrentAct(gameState);
        if (currentAct) {
            [...currentAct.mainQuests, ...currentAct.sideQuests].forEach(quest => {
                if (completedQuestIds.includes(quest.id) && quest.status === 'active') {
                    quest.status = 'completed';
                    gameState.story.completedQuests.push(quest.id);
                    // Trigger quest completion effects
                    this.onQuestComplete(quest, gameState);
                }
            });
        }
        return completedQuestIds;
    }
    // Handle quest completion effects
    onQuestComplete(quest, gameState) {
        // Unlock next quests in sequence
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return;
        // Simple progression: activate next inactive quest
        const nextQuest = [...currentAct.mainQuests, ...currentAct.sideQuests]
            .find(q => q.status === 'inactive');
        if (nextQuest) {
            nextQuest.status = 'active';
        }
        // Check if we can progress to next act
        this.progressToNextAct(gameState);
    }
    // Get available story events
    getAvailableEvents(gameState) {
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return [];
        return currentAct.events.filter(event => this.isEventAvailable(event, gameState));
    }
    // Check if a story event is available
    isEventAvailable(event, gameState) {
        if (!event.conditions)
            return true;
        const { player, story } = gameState;
        const conditions = event.conditions;
        if (conditions.realm && (0, realmHelpers_1.getRealmKeyFromPlayer)(player) !== conditions.realm)
            return false;
        if (conditions.level && player.level < conditions.level)
            return false;
        if (conditions.sect && player.sect !== conditions.sect)
            return false;
        if (conditions.questCompleted && !story.completedQuests.includes(conditions.questCompleted))
            return false;
        if (conditions.flags) {
            for (const [flag, value] of Object.entries(conditions.flags)) {
                if (story.storyFlags[flag] !== value)
                    return false;
            }
        }
        return true;
    }
    // Trigger a story event
    triggerEvent(eventId, gameState) {
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return null;
        const event = currentAct.events.find(e => e.id === eventId);
        if (!event || !this.isEventAvailable(event, gameState))
            return null;
        // Execute event trigger effects
        if (event.onTrigger) {
            event.onTrigger(gameState);
        }
        this.activeEvents.set(eventId, event);
        return event;
    }
    // Make a story choice
    makeChoice(eventId, choiceId, gameState) {
        const event = this.activeEvents.get(eventId);
        if (!event)
            return false;
        const choice = event.choices.find(c => c.id === choiceId);
        if (!choice)
            return false;
        // Check choice conditions
        if (!this.isChoiceAvailable(choice, gameState))
            return false;
        // Apply choice consequences
        this.applyChoiceConsequences(choice, gameState);
        // Remove event from active events
        this.activeEvents.delete(eventId);
        return true;
    }
    // Check if a choice is available
    isChoiceAvailable(choice, gameState) {
        if (!choice.conditions)
            return true;
        const { player } = gameState;
        const conditions = choice.conditions;
        if (conditions.stat) {
            const statValue = player[conditions.stat.name];
            if (typeof statValue !== 'number' || statValue < conditions.stat.min) {
                return false;
            }
        }
        if (conditions.skill) {
            const skill = player.skills[conditions.skill.name];
            if (!skill || skill.level < conditions.skill.min) {
                return false;
            }
        }
        if (conditions.item) {
            const itemCount = player.inventory
                .filter(item => item.id === conditions.item.id)
                .reduce((sum, item) => sum + (item.quantity || 1), 0);
            if (itemCount < conditions.item.quantity) {
                return false;
            }
        }
        if (conditions.karma && player.karma < conditions.karma) {
            return false;
        }
        return true;
    }
    // Apply choice consequences
    applyChoiceConsequences(choice, gameState) {
        const { player, story } = gameState;
        // Apply minimal playtest scaling to dynamic event consequences
        const consequences = playtestScaling_1.PlaytestScaling.applyScaledEffects(choice.consequences, { source: 'event' });
        // Apply stat changes
        if (consequences.stats) {
            for (const [stat, value] of Object.entries(consequences.stats)) {
                player[stat] = (player[stat] || 0) + value;
            }
        }
        // Apply skill changes
        if (consequences.skills) {
            for (const [skillName, value] of Object.entries(consequences.skills)) {
                if (!player.skills[skillName]) {
                    player.skills[skillName] = { level: 0, exp: 0, expToNext: 100 };
                }
                player.skills[skillName].level += value;
            }
        }
        // Apply item changes (quantities are not scaled by PlaytestScaling)
        if (consequences.items) {
            consequences.items.forEach((item) => {
                const existingItem = player.inventory.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity = (existingItem.quantity || 1) + item.quantity;
                }
                else {
                    player.inventory.push({
                        id: item.id,
                        name: item.id, // Should be looked up from item database
                        description: '',
                        quantity: item.quantity
                    });
                }
            });
        }
        // Apply other consequences
        if (typeof consequences.karma === 'number') {
            player.karma = (player.karma || 0) + consequences.karma;
        }
        if (typeof consequences.sectReputation === 'number') {
            const sect = player.sect || 'unknown_sect';
            player.sectReputations[sect] = (player.sectReputations[sect] || 0) + consequences.sectReputation;
        }
        // Set story flags
        if (consequences.flags) {
            Object.assign(story.storyFlags, consequences.flags);
        }
        // Handle quest operations
        if (consequences.questStart) {
            // Activate a quest
            const currentAct = this.getCurrentAct(gameState);
            if (currentAct) {
                const quest = [...currentAct.mainQuests, ...currentAct.sideQuests]
                    .find(q => q.id === consequences.questStart);
                if (quest) {
                    quest.status = 'active';
                }
            }
        }
        if (consequences.questComplete) {
            // Complete a quest
            const currentAct = this.getCurrentAct(gameState);
            if (currentAct) {
                const quest = [...currentAct.mainQuests, ...currentAct.sideQuests]
                    .find(q => q.id === consequences.questComplete);
                if (quest) {
                    quest.status = 'completed';
                    story.completedQuests.push(quest.id);
                }
            }
        }
        if (consequences.eventTrigger) {
            // Trigger another event
            this.triggerEvent(consequences.eventTrigger, gameState);
        }
    }
    // Get active quests for current act
    getActiveQuests(gameState) {
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return [];
        return [...currentAct.mainQuests, ...currentAct.sideQuests]
            .filter(quest => quest.status === 'active');
    }
    // Get completed quests for current act
    getCompletedQuests(gameState) {
        const currentAct = this.getCurrentAct(gameState);
        if (!currentAct)
            return [];
        return [...currentAct.mainQuests, ...currentAct.sideQuests]
            .filter(quest => quest.status === 'completed');
    }
    // Add a new quest dynamically
    addQuest(actId, quest, isMainQuest = false) {
        const act = this.acts.get(actId);
        if (!act)
            return false;
        if (isMainQuest) {
            act.mainQuests.push(quest);
        }
        else {
            act.sideQuests.push(quest);
        }
        return true;
    }
    // Add a new story event dynamically
    addEvent(actId, event) {
        const act = this.acts.get(actId);
        if (!act)
            return false;
        act.events.push(event);
        return true;
    }
}
exports.StorySystem = StorySystem;
