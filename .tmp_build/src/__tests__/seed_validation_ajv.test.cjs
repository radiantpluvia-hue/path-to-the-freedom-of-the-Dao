"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seedValidator_1 = require("@/utils/seedValidator");
const draftSaver_1 = require("@/utils/draftSaver");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('seed validator + draft saver', () => {
    const tmpDir = path_1.default.resolve(process.cwd(), 'data', 'drafts');
    beforeAll(() => {
        if (!fs_1.default.existsSync(tmpDir))
            fs_1.default.mkdirSync(tmpDir, { recursive: true });
    });
    afterAll(() => {
        // cleanup created drafts
        try {
            const files = fs_1.default.readdirSync(tmpDir);
            for (const f of files)
                fs_1.default.unlinkSync(path_1.default.join(tmpDir, f));
        }
        catch (e) { }
    });
    it('validates a good item seed', () => {
        const item = { id: 'i1', name: 'Iron Sword', rarity: 'common', description: 'Sharp' };
        const errs = (0, seedValidator_1.validateSeed)(item, 'items');
        expect(errs.length).toBe(0);
    });
    it('rejects a bad item seed', () => {
        const item = { name: 'NoId' };
        const errs = (0, seedValidator_1.validateSeed)(item, 'items');
        expect(errs.length).toBeGreaterThan(0);
    });
    it('saves a draft file', async () => {
        const item = { id: 'i2', name: 'Draft Sword', rarity: 'uncommon' };
        const p = await (0, draftSaver_1.saveDraft)(item, 'items', { overwrite: true });
        expect(fs_1.default.existsSync(p)).toBe(true);
        const content = JSON.parse(fs_1.default.readFileSync(p, 'utf-8'));
        expect(content.id).toBe('i2');
    });
});
