"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_DATA = exports.TALENT_DATA = exports.REALM_DATA = void 0;
exports.getRealmById = getRealmById;
exports.getRealmByName = getRealmByName;
exports.getTalentById = getTalentById;
exports.assignRandomTalent = assignRandomTalent;
exports.REALM_DATA = [
    { id: 0, name: 'Mortal', lifespan: 80, breakthroughQi: 100 },
    { id: 1, name: 'Qi Refinement', lifespan: 150, breakthroughQi: 1000 },
    { id: 2, name: 'Foundation Establishment', lifespan: 300, breakthroughQi: 10000 },
    { id: 3, name: 'Golden Core', lifespan: 1000, breakthroughQi: 100000 },
    { id: 4, name: 'Nascent Soul', lifespan: 5000, breakthroughQi: 1000000 },
    { id: 5, name: 'Soul Formation', lifespan: 25000, breakthroughQi: 10000000 },
    { id: 6, name: 'Void Amalgamation', lifespan: 100000, breakthroughQi: 100000000 },
    { id: 7, name: 'Body Integration', lifespan: 500000, breakthroughQi: 500000000 },
    { id: 8, name: 'Mahayana', lifespan: 1000000, breakthroughQi: 1000000000 },
    { id: 9, name: 'Loose Immortal', lifespan: 10000000, breakthroughQi: Infinity },
    // Further realms can be added here, e.g., Heavenly Immortal, True Immortal, etc.
];
/**
 * A helper function to get realm data by its ID.
 * @param realmId The ID of the realm.
 * @returns The realm data object, or null if not found.
 */
function getRealmById(realmId) {
    return exports.REALM_DATA.find(realm => realm.id === realmId) || null;
}
/**
 * A helper function to get realm data by its name.
 * @param name The name of the realm.
 * @returns The realm data object, or null if not found.
 */
function getRealmByName(name) {
    return exports.REALM_DATA.find(realm => realm.name === name) || null;
}
exports.TALENT_DATA = [
    { id: 'mortal', name: 'Mortal', description: 'Standard aptitude, the path of diligence.', cultivationMultiplier: 1.0, breakthroughBonus: 0, rarity: 'common' },
    { id: 'earthly', name: 'Earthly Spirit', description: 'A strong connection to the world, accelerating Qi absorption.', cultivationMultiplier: 1.2, breakthroughBonus: 0.05, rarity: 'uncommon' },
    { id: 'heavenly', name: 'Heavenly Physique', description: 'Born under a lucky star, cultivation is as natural as breathing.', cultivationMultiplier: 1.5, breakthroughBonus: 0.10, rarity: 'rare' },
    { id: 'divine', name: 'Divine Root', description: 'A one-in-a-million prodigy with a direct line to the Dao.', cultivationMultiplier: 2.0, breakthroughBonus: 0.20, rarity: 'epic' },
    { id: 'dao_body', name: 'Innate Dao Body', description: 'The Dao itself manifests in your form. A legend whispered through the ages.', cultivationMultiplier: 3.0, breakthroughBonus: 0.35, rarity: 'legendary' },
];
/**
 * A helper function to get talent data by its ID.
 * @param talentId The ID of the talent.
 * @returns The talent data object, or null if not found.
 */
function getTalentById(talentId) {
    return exports.TALENT_DATA.find(talent => talent.id === talentId) || null;
}
/**
 * Assigns a random talent to a player based on rarity.
 * This should be called during character creation.
 * @param player The player object to modify.
 */
function assignRandomTalent(player) {
    const roll = Math.random() * 100;
    let chosenTalentId;
    if (roll < 50) {
        chosenTalentId = 'mortal';
    } // 50%
    else if (roll < 80) {
        chosenTalentId = 'earthly';
    } // 30%
    else if (roll < 95) {
        chosenTalentId = 'heavenly';
    } // 15%
    else if (roll < 99) {
        chosenTalentId = 'divine';
    } // 4%
    else {
        chosenTalentId = 'dao_body';
    } // 1%
    player.talentId = chosenTalentId;
}
// --- Event Data ---
exports.EVENT_DATA = [
    {
        id: 'mysterious_merchant',
        title: 'A Mysterious Merchant',
        description: 'An old merchant with an otherworldly aura offers you a peculiar item. "Only for those who walk the common path," he mutters.',
        requirements: {
            talentId: 'mortal', // Only for players with the 'Mortal' talent
        },
        weight: 10, // This event is quite common for players with the 'Mortal' talent.
        choices: [
            {
                text: 'Purchase the dusty old scroll.',
                effects: { spiritStones: { low: -50 }, daoHeart: 10, specialItem: 'scroll_of_diligence' },
            },
            {
                text: 'Politely decline the offer.',
                effects: { cunning: 2 },
                narrative: 'You wisely decide to save your spirit stones for another day.',
            },
        ],
    },
    {
        id: 'celestial_omen',
        title: 'A Celestial Omen',
        description: 'While meditating, you feel a resonance with the heavens. A faint celestial script appears in your mind, offering a glimpse into a profound secret.',
        requirements: {
            talentId: 'heavenly', // Only for players with the 'Heavenly Physique' talent
        },
        weight: 3, // This is a rarer, special event.
        choices: [
            {
                text: 'Focus your mind and read the script.',
                effects: { daoComprehension: 50, karma: 5 },
            },
            {
                text: 'Dismiss it as an illusion.',
                effects: { daoHeart: 2 },
            },
        ],
    },
];
