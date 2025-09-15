
// Act 7 – Eternal Ascension
export const act7Monologue = {
  overview: `The final trial before leaving the mortal plane.\n\nAct 7 is the ultimate ascension arc, where the player’s Dao has reached a state the mortal world can no longer contain. The tribulation is a war against the will of Heaven itself. Enemies are cosmic, storms world-ending, and every choice shapes your legacy.`,

  monologue: `The heavens tremble, the earth groans, and reality itself begins to bend under the weight of your existence. Your Dao has reached a state that the mortal world can no longer contain. Every breath you take ripples through the fabric of this realm. But ascension is not a gift—it is a war against the very will of Heaven.\n\nThose who reach this stage are rare. Those who survive it… rarer still.\n\nYour enemies are no longer just rival sects or petty clans. The tribulation awaiting you is older than time, forged from the rage of countless failed ascensions. The moment you begin, the world will rise against you—storms that cut flesh, fire that burns Qi, illusions meant to shatter your Dao-heart.\n\nWill you seize eternity… or be reduced to ash in the annals of forgotten cultivators?`,

  themes: [
    'Ultimate Tribulation: Realm 30 → Ascension',
    'Dao Fusion: Merge all mastered Daos into one Eternal Dao (optional but powerful)',
    'Final Rival Encounter: Rival attempts their own ascension, can interfere with yours',
    'Heaven’s Wrath Scaling: Damage and illusions scale dynamically based on player’s cultivation path',
    'Epilogue Determinants: Choices, relationships, and past actions determine your ending'
  ],

  systems: [
    'Ascension Tribulation Resolver: Multiple stages—Heavenly Lightning, Void Fire, Space Collapse, Illusory Dao Trials. Each stage has a time limit; failure to resolve before it expires counts as a strike. Three strikes = death (permanent ending or reincarnation option).',
    'Eternal Dao Fusion UI: Lets player merge all learned Daos into one. Bonuses depend on path synergy (e.g., Sword + Wind + Space = “Void Edge Dao”).',
    'Final Rival Mechanic: Rival attempts to ascend at the same time, can either duel you mid-tribulation or be ignored (but will appear in ending).',
    'Legacy Unlocks: Manuals, bloodlines, physiques unlocked for future playthroughs based on choices in this act.'
  ],

  events: [
    // 1–5: Heavenly Omens
    'Sky cracks with golden light, vision of a Celestial Immortal judging your worth',
    'The sun flickers like a candle before going black for a full day',
    'Oceans rise unnaturally high, revealing ancient ruins of a forgotten sect',
    'Dream of all your past mentors appearing to guide—or warn—you',
    'The world’s Qi begins flowing toward you uncontrollably',
    // 6–10: Rival Interference
    'Rival confronts you, warning you to abandon ascension',
    'Rival sabotages your Qi channels mid-cultivation',
    'Duel in the collapsing Void Realm mid-tribulation',
    'Rival asks for alliance to survive Heaven’s Wrath together',
    'Rival’s death cry echoes during your ascension, shaking your Dao-heart',
    // 11–15: Illusory Dao Trials
    'Hall of Mirrors showing 10,000 versions of you—choose the real self',
    'Hallucination where all your friends betray you',
    'You must fight your greatest past victory again—stronger this time',
    'You relive your weakest moment in cultivation, risk losing willpower',
    'Dao-heart test: surrender immortality for mortal peace',
    // 16–20: Nature’s Rebellion
    'Volcano erupts in your path, spewing molten Qi',
    'A flood of spirit beasts attacks',
    'The sky rains meteors imbued with soul-burning flames',
    'Tornado of lightning and fire descends',
    'The ground collapses into an endless abyss',
    // 21–25: Heaven’s Wrath Peak
    'Thunderbolt the size of a mountain falls',
    'Pillar of divine light attempts to rip your soul away',
    'Giant celestial hand tries to crush you into the earth',
    'Black sun rises, draining all Qi from the world',
    'Space itself begins to tear into ribbons',
    // 26–30: Resolution & Epilogue Hooks
    'Final heavenly lightning—survive or perish',
    'Chance to pull someone with you into ascension',
    'Opportunity to seal your rival’s fate forever',
    'Last choice to abandon ascension for love, revenge, or mortality',
    'Gateway to the Upper Realm opens—walk through, or stay'
  ],

  endingMonologue: {
    success: `The storm parts. The fire fades. The illusions shatter. You stand, unbroken, atop a pillar of light that pierces the void.\n\nYour mortal shell dissolves into pure Qi, carrying your Dao beyond the sky. The mortal world is now but a memory—faded, yet eternal in your heart.\n\nAhead lies the true path. The Great Dao stretches endlessly before you.`,
    failure: `The storm consumes you. The fire burns through your meridians. Your Dao collapses, crushed under the weight of Heaven’s will.\n\nAs darkness closes in, you feel no regret—only the bittersweet truth that you reached further than most would dare.\n\nYour name will be whispered in awe… and in warning.`
  }
};
