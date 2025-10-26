"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Unified canonical TrainModal is implemented in `src/ui/trainModal.tsx`.
// Re-export it here so older imports for this path continue to work.
const trainModal_1 = __importDefault(require("@/ui/trainModal"));
exports.default = trainModal_1.default;
