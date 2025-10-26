"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.template_rival_offer = template_rival_offer;
exports.template_rival_test = template_rival_test;
exports.materializeTemplateAsDialogue = materializeTemplateAsDialogue;
/**
 * Simple template: rivalry_offer
 * Parameters:
 * - rivalId: string speaker id (e.g. 'rival_zhou')
 * - situation: short situational text
 * - stakes: what is being wagered
 */
function template_rival_offer(rivalId, situation, stakes) {
    const dialogue = {
        id: `tmpl_rival_offer_${rivalId}_${Date.now()}`,
        title: 'Rival - Offer',
        lines: [
            { speaker: rivalId, text: `${situation} — I offer you a wager: ${stakes}.` }
        ],
        tags: ['rival', 'template', 'offer']
    };
    const choices = [
        { id: 'accept', text: 'Accept the wager', effect: { stat: 'reputation', delta: 2 } },
        { id: 'decline', text: 'Refuse politely', effect: { stat: 'pride', delta: -1 } },
        { id: 'counter', text: 'Counter with a harsher bet', effect: 'open_counter' }
    ];
    return { dialogue, choices };
}
/**
 * Simple template: rivalry_choice_test
 * Provides a short taunt and three choices: aggressive, defensive, evasive.
 */
function template_rival_test(rivalId, taunt) {
    const now = Date.now();
    const dialogue = {
        id: `tmpl_rival_test_${rivalId}_${now}`,
        title: 'Rival - Test',
        lines: [{ speaker: rivalId, text: taunt }],
        tags: ['rival', 'template', 'test']
    };
    const choices = [
        { id: 'aggressive', text: 'Answer with aggression', effect: { stat: 'strength', delta: 1 } },
        { id: 'defensive', text: 'Hold and defend', effect: { stat: 'defense', delta: 1 } },
        { id: 'evasive', text: 'Step aside and bait', effect: { stat: 'agility', delta: 1 } }
    ];
    return { dialogue, choices };
}
/**
 * Helper to materialize a RivalTemplateOutput into a flat Dialogue that includes choice lines as narrator options.
 * This is useful for simple UIs that cannot render choice buttons directly from the template.
 */
function materializeTemplateAsDialogue(output) {
    const choiceLines = output.choices.map((c, idx) => ({ speaker: 'narrator', text: `${idx + 1}. ${c.text}` }));
    return {
        id: `${output.dialogue.id}_materialized`,
        title: `${output.dialogue.title} (materialized)`,
        lines: [...output.dialogue.lines, ...choiceLines],
        tags: [...(output.dialogue.tags || []), 'materialized']
    };
}
exports.default = {
    template_rival_offer,
    template_rival_test,
    materializeTemplateAsDialogue
};
