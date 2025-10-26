"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmortalEmperorConsciousness = void 0;
exports.createSampleConsciousnessFor = createSampleConsciousnessFor;
class ImmortalEmperorConsciousness {
    // mentalWorldTrial: runs a trial of the emperor's mind against the user
    // implemented as an actual method to avoid instance shadowing issues
    constructor(payload) {
        this.emperorName = payload.emperorName;
        this.originalEra = payload.originalEra;
        this.personality = payload.personality || {};
        this.consciousnessLevel = payload.consciousnessLevel ?? 0.1;
        this.memoriesUnlocked = payload.memoriesUnlocked ?? [];
        this.techniquesAvailable = payload.techniquesAvailable ?? [];
        this.willpowerStrength = payload.willpowerStrength ?? 100;
        this.state = 'dormant';
    }
    // Quick eligibility check: returns whether the item will even attempt to engage
    isCompatible(userCultivation, userTalent) {
        // Basic rule: require a non-trivial cultivation or talent to awaken
        return userCultivation >= 50 || userTalent >= 50;
    }
    // Attempt to awaken the consciousness. Returns feedback text and boolean success
    attemptAwaken(userCultivation, userTalent, respectLevel = 0) {
        if (!this.isCompatible(userCultivation, userTalent)) {
            return { success: false, message: `${this.emperorName} scoffs at your weakness.` };
        }
        // Respect increases chance; personality.proud increases required respect
        const pride = this.personality.proud ?? 0.5;
        const threshold = 0.2 + (pride * 0.5);
        const power = Math.min(1, (userCultivation / 1000) + (userTalent / 1000) + respectLevel);
        if (power >= threshold) {
            this.state = 'awakening';
            // small growth
            this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.1 + (power * 0.2));
            // grant a small technique if available
            if (this.techniquesAvailable.length && !this.techniquesAvailable[0]) {
                // noop
            }
            return { success: true, message: `${this.emperorName} studies you and begins to awaken.` };
        }
        // failure causes mockery or dormancy
        return { success: false, message: `${this.emperorName} remains indifferent.` };
    }
    // Conditional grant of power during a situation
    grantConditionalPower(userAction, context = {}) {
        // Simple rule: grant power on defensive acts or when user shows humility
        if (userAction === 'defend' || context.humble) {
            // small temporary boost proportional to consciousnessLevel
            const strength = Math.round(this.willpowerStrength * (0.1 + this.consciousnessLevel * 0.4));
            return { granted: true, description: `A surge of ${strength} will manifests from ${this.emperorName}.` };
        }
        return { granted: false };
    }
    // When the user visits an important location, memory fragments may unlock
    reactToLocation(locationTag) {
        if (this.memoriesUnlocked.includes(locationTag))
            return null;
        if (locationTag === this.originalEra || locationTag.includes(this.originalEra.split(' ')[0])) {
            this.memoriesUnlocked.push(locationTag);
            this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.05);
            return `${this.emperorName} shares a memory of ${locationTag}.`;
        }
        return null;
    }
    // Mental-world trial: user attempts mental trials against emperor will
    mentalWorldTrial(userMentalStrength) {
        const difficulty = 50 + Math.round(this.consciousnessLevel * 100);
        const passed = userMentalStrength >= difficulty;
        if (passed) {
            this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.1);
            const mem = `trial_${Date.now()}`;
            this.memoriesUnlocked.push(mem);
            return { passed: true, description: `You pass the emperor's trial and unlock memory ${mem}.`, memory: mem };
        }
        const backlash = Math.max(0, 10 + Math.round((difficulty - userMentalStrength) / 2));
        return { passed: false, description: `You fail and suffer mental backlash of ${backlash}.`, backlash };
    }
}
exports.ImmortalEmperorConsciousness = ImmortalEmperorConsciousness;
// Lightweight exported helpers to keep codebase centered
function createSampleConsciousnessFor(emperorName, era) {
    return new ImmortalEmperorConsciousness({ emperorName, originalEra: era, personality: { proud: 0.8, demanding: 0.6 } });
}
// (mentalWorldTrial implemented as class method)
