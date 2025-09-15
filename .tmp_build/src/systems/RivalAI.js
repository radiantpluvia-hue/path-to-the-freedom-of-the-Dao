"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RivalAI = void 0;
class RivalAI {
    constructor(profile) {
        this.memories = [];
        this.profile = profile;
    }
    decideAction() {
        // Very simple stub: choose action based on personality
        switch (this.profile.personality) {
            case 'aggressive':
                return 'attack';
            case 'cunning':
                return 'feint';
            case 'defensive':
                return 'defend';
            default:
                return 'wait';
        }
    }
    remember(memory) {
        this.memories.push(memory);
        // keep last 50
        if (this.memories.length > 50)
            this.memories.shift();
    }
}
exports.RivalAI = RivalAI;
