"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PHILO_AFFINITY_TRIGGERS = exports.DEMO_NARRATIVE_TRIGGER = void 0;
exports.DEMO_NARRATIVE_TRIGGER = {
    id: 'demo_trigger_1',
    type: 'state_based',
    conditions: { level: 1 },
    eventGenerators: [
        {
            id: 'demo_generator_1',
            type: 'template_based',
            templates: [
                {
                    id: 'narr_demo_1',
                    title: "Heaven's Whisper",
                    description: 'A subtle whisper on the wind hints at opportunities in your path.',
                    choices: [
                        {
                            id: 'accept',
                            text: 'Heed the whisper',
                            karmaEffect: 5,
                            destinyEffects: [],
                            consequences: { stats: { insight: 5 } },
                            narrative: 'You feel a faint stirring of the Dao.'
                        }
                    ],
                    baseEffects: {},
                    variables: []
                }
            ],
            parameters: {},
            weight: 1
        }
    ],
    priority: 10
};
exports.default = exports.DEMO_NARRATIVE_TRIGGER;
exports.PHILO_AFFINITY_TRIGGERS = [
    {
        id: 'philo_affinity_positive',
        type: 'destiny',
        conditions: { level: 1 },
        affinityBias: 'positive',
        eventGenerators: [
            {
                id: 'philo_pos_gen',
                type: 'template_based',
                templates: [
                    {
                        id: 'philo_help_opportunity',
                        title: 'A Quiet Need',
                        description: 'You find a small family struggling; helping them might strengthen your ties to the world.',
                        choices: [
                            { id: 'help', text: 'Help them', karmaEffect: 3, destinyEffects: [], consequences: { stats: { destinyAffinity: 1, daoComprehension: 1 }, flags: { helped_family: true } } },
                            { id: 'ignore', text: 'Move on', karmaEffect: -1, destinyEffects: [], consequences: { karma: -1 } }
                        ],
                        baseEffects: {},
                        variables: []
                    }
                ],
                parameters: {},
                weight: 1
            }
        ],
        priority: 20
    },
    {
        id: 'philo_affinity_negative',
        type: 'destiny',
        conditions: { level: 1 },
        affinityBias: 'negative',
        eventGenerators: [
            {
                id: 'philo_neg_gen',
                type: 'template_based',
                templates: [
                    {
                        id: 'philo_ruthless_opportunity',
                        title: 'Edge of Power',
                        description: 'A mercenary offers to teach you efficient methods; some shortcuts may cost compassion.',
                        choices: [
                            { id: 'accept', text: 'Accept the training', karmaEffect: -2, destinyEffects: [], consequences: { stats: { destinyAffinity: -1, combatSkills: 1 }, flags: { trained_by_mercenary: true } } },
                            { id: 'decline', text: 'Decline', karmaEffect: 1, destinyEffects: [], consequences: { karma: 1 } }
                        ],
                        baseEffects: {},
                        variables: []
                    }
                ],
                parameters: {},
                weight: 1
            }
        ],
        priority: 20
    }
];
