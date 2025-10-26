"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EQUIPMENT_SLOTS = void 0;
exports.defaultEquipmentSnapshot = defaultEquipmentSnapshot;
exports.applyEquipmentBonuses = applyEquipmentBonuses;
exports.removeEquipmentBonuses = removeEquipmentBonuses;
// Minimal equipment system utilities: define slots and helpers to apply/remove equipment bonuses
exports.EQUIPMENT_SLOTS = ['mainHand', 'offHand', 'armor', 'accessory1', 'accessory2', 'mount', 'companion', 'innerCore'];
function defaultEquipmentSnapshot() {
    const obj = {};
    exports.EQUIPMENT_SLOTS.forEach(s => obj[s] = null);
    return obj;
}
const PassiveRegistry = __importStar(require("./passiveRegistry"));
function applyEquipmentBonuses(player, item) {
    if (!item)
        return player;
    let p = { ...player };
    // apply stat bonuses
    if (item.stats) {
        p.stats = { ...(p.stats || {}) };
        Object.entries(item.stats).forEach(([k, v]) => {
            p.stats[k] = (p.stats[k] || 0) + Number(v || 0);
        });
    }
    // apply passives if present
    if (Array.isArray(item.passives)) {
        item.passives.forEach(pid => {
            p = PassiveRegistry.applyPassiveToPlayer(p, pid);
        });
    }
    return p;
}
function removeEquipmentBonuses(player, item) {
    if (!item)
        return player;
    let p = { ...player };
    // remove stat bonuses
    if (item.stats) {
        p.stats = { ...(p.stats || {}) };
        Object.entries(item.stats).forEach(([k, v]) => {
            p.stats[k] = (p.stats[k] || 0) - Number(v || 0);
        });
    }
    // remove passives if present
    if (Array.isArray(item.passives)) {
        item.passives.forEach(pid => {
            p = PassiveRegistry.removePassiveFromPlayer(p, pid);
        });
    }
    return p;
}
exports.default = {
    EQUIPMENT_SLOTS: exports.EQUIPMENT_SLOTS,
    defaultEquipmentSnapshot,
    applyEquipmentBonuses,
    removeEquipmentBonuses
};
