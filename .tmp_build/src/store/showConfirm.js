"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showConfirm = showConfirm;
const useGameStore_1 = require("./useGameStore");
const confirmRegistry_1 = __importDefault(require("./confirmRegistry"));
const rng_1 = require("../utils/rng");
function showConfirm(payload) {
    const id = `confirm_${Date.now()}_${Math.floor((0, rng_1.getRng)()() * 10000)}`;
    return new Promise((resolve) => {
        confirmRegistry_1.default.registerConfirmHandler(id, () => resolve(true), () => resolve(false));
        useGameStore_1.useGameStore.getState().setUIProperty('activeConfirm', {
            id,
            title: payload.title,
            message: payload.message,
            confirmLabel: payload.confirmLabel,
            cancelLabel: payload.cancelLabel,
        });
    });
}
exports.default = showConfirm;
