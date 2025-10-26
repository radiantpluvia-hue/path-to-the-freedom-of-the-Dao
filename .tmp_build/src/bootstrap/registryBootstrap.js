"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initializeRegistry;
const registry_1 = require("../data/registry");
const daos_json_1 = __importDefault(require("../data/daos.json"));
const laws_json_1 = __importDefault(require("../data/laws.json"));
const cultivation_archetypes_json_1 = __importDefault(require("../data/cultivation_archetypes.json"));
const cultivation_pathways_json_1 = __importDefault(require("../data/cultivation_pathways.json"));
// register minimal datasets under namespaces so other systems can access them
registry_1.Registry.register('daos', daos_json_1.default);
registry_1.Registry.register('laws', laws_json_1.default);
registry_1.Registry.register('archetypes', cultivation_archetypes_json_1.default);
registry_1.Registry.register('pathways', cultivation_pathways_json_1.default);
function initializeRegistry() { }
