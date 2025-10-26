"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentorTeachingsLoader = exports.MentorTeachingsLoader = void 0;
const scalingSystem_1 = require("./scalingSystem");
// Import all mentor teaching data
const fang_yuan_teachings_json_1 = __importDefault(require("./mentor_teachings/fang_yuan_teachings.json"));
const fu_yao_teachings_json_1 = __importDefault(require("./mentor_teachings/fu_yao_teachings.json"));
const han_jue_teachings_json_1 = __importDefault(require("./mentor_teachings/han_jue_teachings.json"));
const han_li_teachings_json_1 = __importDefault(require("./mentor_teachings/han_li_teachings.json"));
const lan_wangji_teachings_json_1 = __importDefault(require("./mentor_teachings/lan_wangji_teachings.json"));
const meng_hao_teachings_json_1 = __importDefault(require("./mentor_teachings/meng_hao_teachings.json"));
const su_ming_teachings_json_1 = __importDefault(require("./mentor_teachings/su_ming_teachings.json"));
const xiao_yan_teachings_json_1 = __importDefault(require("./mentor_teachings/xiao_yan_teachings.json"));
class MentorTeachingsLoader {
    constructor() {
        this.teachings = new Map();
        this.teachingTrees = [];
        this.loadAllTeachings();
        this.buildTeachingTrees();
    }
    loadAllTeachings() {
        // Load Fang Yuan teachings
        fang_yuan_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        // Load Fu Yao teachings
        fu_yao_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        // Load other mentors...
        han_jue_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        han_li_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        lan_wangji_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        meng_hao_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        su_ming_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
        xiao_yan_teachings_json_1.default.forEach(teaching => {
            const migrated = this.migrateLegacyKeys(teaching);
            this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
        });
    }
    /**
     * Migrate legacy keys present in JSON data to their current equivalents.
     * Currently maps:
     * - `hermitCurse` -> `seclusionCurse`
     * This is intentionally conservative and only touches a few known locations
     * (top-level, prerequisites, reward, failureConsequence) to avoid altering
     * lore fields or other nested structures unintentionally.
     */
    migrateLegacyKeys(raw) {
        const copy = { ...raw };
        // Top-level key migration
        if (copy.hermitCurse !== undefined && copy.seclusionCurse === undefined) {
            copy.seclusionCurse = copy.hermitCurse;
            delete copy.hermitCurse;
        }
        // Nested migrations for common containers
        ['prerequisites', 'reward', 'failureConsequence'].forEach(container => {
            if (copy[container] && typeof copy[container] === 'object') {
                if (copy[container].hermitCurse !== undefined && copy[container].seclusionCurse === undefined) {
                    copy[container].seclusionCurse = copy[container].hermitCurse;
                    delete copy[container].hermitCurse;
                }
            }
        });
        return copy;
    }
    convertToMentorTeaching(rawTeaching) {
        const teachingNumber = parseInt(rawTeaching.id.split('_').pop() || '1');
        return {
            id: rawTeaching.id,
            title: rawTeaching.title,
            description: rawTeaching.description,
            challenge: {
                type: this.mapChallengeType(rawTeaching.challenge?.type),
                difficulty: this.mapDifficulty(rawTeaching.challenge?.difficulty, teachingNumber),
                requirements: rawTeaching.challenge?.requirements || "Complete the challenge",
                restriction: rawTeaching.challenge?.restriction || "No restrictions",
                timeLimit: this.calculateTimeLimit(rawTeaching.challenge?.difficulty, teachingNumber),
                successThreshold: this.calculateSuccessThreshold(rawTeaching.challenge?.difficulty, teachingNumber)
            },
            reward: rawTeaching.reward || {},
            failureConsequence: rawTeaching.failureConsequence || {},
            prerequisites: rawTeaching.prerequisites || {}
        };
    }
    mapChallengeType(rawType) {
        const typeMappings = {
            'moral_choice': 'puzzle_solving',
            'betrayal_quest': 'resource_management',
            'complex_scheme': 'puzzle_solving',
            'manipulation_mastery': 'resource_management',
            'prophecy_mastery': 'memory_test',
            'isolation_trial': 'meditation_challenge',
            'efficiency_mastery': 'qi_control_test',
            'delayed_gratification': 'resource_management',
            'enemy_harvesting': 'resource_management',
            'ultimate_betrayal': 'puzzle_solving',
            'rebellion_mastery': 'rebellion_mastery',
            'transformation_trial': 'transformation_trial'
        };
        return typeMappings[rawType] || 'qi_control_test';
    }
    mapDifficulty(rawDifficulty, teachingNumber) {
        if (rawDifficulty) {
            return rawDifficulty;
        }
        const difficulties = ['easy', 'medium', 'hard', 'extreme', "D", 'mythical', "B"];
        return difficulties[Math.min(teachingNumber - 1, difficulties.length - 1)];
    }
    calculateTimeLimit(difficulty, teachingNumber) {
        const baseTimes = {
            easy: 300,
            medium: 240,
            hard: 180,
            extreme: 120,
            legendary: 90,
            mythical: 60,
            transcendent: 45,
            impossible: 30
        };
        return baseTimes[difficulty] || (300 - (teachingNumber * 30));
    }
    calculateSuccessThreshold(difficulty, teachingNumber) {
        const baseThresholds = {
            easy: 60,
            medium: 70,
            hard: 75,
            extreme: 80,
            legendary: 85,
            mythical: 90,
            transcendent: 95,
            impossible: 100
        };
        return baseThresholds[difficulty] || (60 + (teachingNumber * 5));
    }
    buildTeachingTrees() {
        const mentors = ['fang_yuan', 'fu_yao', 'lan_wangji', 'su_ming', 'han_li', 'xiao_yan', 'meng_hao', 'han_jue'];
        mentors.forEach(mentorId => {
            const mentorTeachings = Array.from(this.teachings.values())
                .filter(teaching => teaching.id.startsWith(mentorId))
                .sort((a, b) => {
                const aNum = parseInt(a.id.split('_').pop() || '0');
                const bNum = parseInt(b.id.split('_').pop() || '0');
                return aNum - bNum;
            });
            const nodes = mentorTeachings.map((teaching, index) => ({
                teachingId: teaching.id,
                position: { x: index * 120, y: 0 },
                // Prefer explicit dependencies when present; otherwise fall back to linear connection
                connections: (teaching.prerequisites?.requiredTeachings && teaching.prerequisites.requiredTeachings.length > 0)
                    ? teaching.prerequisites.requiredTeachings
                    : (index < mentorTeachings.length - 1 ? [mentorTeachings[index + 1].id] : []),
                unlockRequirements: teaching.prerequisites || {}
            }));
            this.teachingTrees.push({
                id: `${mentorId}_tree`,
                mentorId,
                teachings: nodes,
                prerequisites: { mentorAffinity: { [mentorId]: 5 } }
            });
        });
    }
    getTeachingById(teachingId) {
        return this.teachings.get(teachingId);
    }
    // Realm-scaled accessors
    getTeachingByIdScaled(teachingId, realm) {
        const t = this.teachings.get(teachingId);
        if (!t)
            return undefined;
        return {
            ...t,
            reward: (0, scalingSystem_1.scaleTeachingReward)(t.reward || {}, realm)
        };
    }
    getTeachingsForMentor(mentorId) {
        return Array.from(this.teachings.values())
            .filter(teaching => teaching.id.startsWith(mentorId));
    }
    getTeachingsForMentorScaled(mentorId, realm) {
        return this.getTeachingsForMentor(mentorId).map(t => ({
            ...t,
            reward: (0, scalingSystem_1.scaleTeachingReward)(t.reward || {}, realm)
        }));
    }
    getTeachingTree(mentorId) {
        return this.teachingTrees.find(tree => tree.mentorId === mentorId);
    }
    getAllTeachingTrees() {
        return this.teachingTrees;
    }
}
exports.MentorTeachingsLoader = MentorTeachingsLoader;
exports.mentorTeachingsLoader = new MentorTeachingsLoader();
