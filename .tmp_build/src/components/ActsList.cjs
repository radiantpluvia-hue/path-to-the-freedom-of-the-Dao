"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActsList = void 0;
const ArcsList_1 = __importDefault(require("./ArcsList"));
// ActsList kept for compatibility. Re-export ArcsList so existing imports continue to work.
exports.ActsList = ArcsList_1.default;
exports.default = exports.ActsList;
