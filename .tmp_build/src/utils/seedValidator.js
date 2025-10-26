"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSeed = validateSeed;
const ajv_1 = __importDefault(require("ajv"));
const item_schema_json_1 = __importDefault(require("@/data/schemas/item.schema.json"));
const manual_schema_json_1 = __importDefault(require("@/data/schemas/manual.schema.json"));
const passive_schema_json_1 = __importDefault(require("@/data/schemas/passive.schema.json"));
const event_schema_json_1 = __importDefault(require("@/data/schemas/event.schema.json"));
const ajv = new ajv_1.default({ allErrors: true, strict: false });
const validators = {
    items: ajv.compile(item_schema_json_1.default),
    manuals: ajv.compile(manual_schema_json_1.default),
    passives: ajv.compile(passive_schema_json_1.default),
    events: ajv.compile(event_schema_json_1.default),
};
function validateSeed(seed, kind) {
    const v = validators[kind];
    if (!v)
        return [`No schema for kind=${kind}`];
    const ok = v(seed);
    if (ok)
        return [];
    return (v.errors || []).map(e => `${e.instancePath} ${e.message}`);
}
exports.default = validateSeed;
