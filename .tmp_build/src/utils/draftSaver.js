"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDraft = saveDraft;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function saveDraft(seed, kind, options) {
    const draftsDir = path_1.default.resolve(process.cwd(), 'data', 'drafts');
    if (!fs_1.default.existsSync(draftsDir))
        fs_1.default.mkdirSync(draftsDir, { recursive: true });
    const filename = `${kind}_${seed.id || seed.name || 'unnamed'}.json`;
    const filePath = path_1.default.join(draftsDir, filename);
    if (fs_1.default.existsSync(filePath) && !options?.overwrite) {
        // avoid overwriting
        throw new Error('Draft already exists: ' + filePath);
    }
    await fs_1.default.promises.writeFile(filePath, JSON.stringify(seed, null, 2), 'utf-8');
    return filePath;
}
exports.default = saveDraft;
