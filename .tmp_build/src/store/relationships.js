"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRelationshipsStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const rng_1 = require("../utils/rng");
exports.useRelationshipsStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    relationships: [],
    includeRival: false,
    addRelationship: (rel) => {
        const newRel = {
            ...rel,
            affinity: rel.affinity ?? 0,
            id: `rel_${Date.now()}_${Math.floor((0, rng_1.getRng)()() * 0x100000).toString(36).substr(0, 7)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        set((state) => ({
            relationships: [...state.relationships, newRel],
        }));
    },
    updateRelationship: (id, updates) => {
        set((state) => ({
            relationships: state.relationships.map((rel) => rel.id === id
                ? { ...rel, ...updates, updatedAt: Date.now() }
                : rel),
        }));
    },
    removeRelationship: (id) => {
        set((state) => ({
            relationships: state.relationships.filter((rel) => rel.id !== id),
        }));
    },
    getRelationshipsByCategory: (category) => {
        return get().relationships.filter((rel) => rel.category === category);
    },
    searchRelationships: (query) => {
        const q = query.toLowerCase();
        return get().relationships.filter((rel) => rel.name.toLowerCase().includes(q) ||
            (rel.notes && rel.notes.toLowerCase().includes(q)));
    },
    syncRivals: (rivals) => {
        if (!get().includeRival)
            return;
        const existingRivalIds = new Set(get().relationships
            .filter((rel) => rel.category === 'Rival')
            .map((rel) => rel.id));
        const rivalRels = rivals.map((rival) => ({
            id: `rival_${rival.id}`,
            name: rival.name || 'Unknown Rival',
            category: 'Rival',
            description: `Rival: ${rival.description || 'A rival cultivator'}`,
            notes: `Level: ${rival.level || 'Unknown'}, Realm: ${rival.realm || 'Unknown'}`,
            affinity: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }));
        set((state) => ({
            relationships: [
                ...state.relationships.filter((rel) => !existingRivalIds.has(rel.id)),
                ...rivalRels,
            ],
        }));
    },
    setIncludeRival: (include) => {
        set({ includeRival: include });
        if (!include) {
            // Remove rival relationships when toggled off
            set((state) => ({
                relationships: state.relationships.filter((rel) => rel.category !== 'Rival'),
            }));
        }
        else {
            // Optionally sync rivals if available
            try {
                const rivals = window.gameStore?.rivalSystem?.getAllRivals() || [];
                get().syncRivals(rivals);
            }
            catch {
                // Ignore if not available
            }
        }
    },
}), {
    name: 'relationships-storage',
    partialize: (state) => ({
        relationships: state.relationships,
        includeRival: state.includeRival,
    }),
}));
