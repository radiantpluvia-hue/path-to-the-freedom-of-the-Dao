import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getRng } from '../utils/rng';

export type RelationshipCategory = 'Friend' | 'Lover' | 'Mentor' | 'Rival';

export interface Relationship {
  id: string;
  name: string;
  category: RelationshipCategory;
  description?: string;
  notes?: string;
  affinity: number;
  createdAt: number;
  updatedAt: number;
}

export interface RelationshipsState {
  relationships: Relationship[];
  includeRival: boolean;
  addRelationship: (rel: Omit<Relationship, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
  getRelationshipsByCategory: (category: RelationshipCategory) => Relationship[];
  searchRelationships: (query: string) => Relationship[];
  syncRivals: (rivals: any[]) => void;
  setIncludeRival: (include: boolean) => void;
}

export const useRelationshipsStore = create<RelationshipsState>()(
  persist(
    (set, get) => ({
      relationships: [],
      includeRival: false,

      addRelationship: (rel) => {
        const newRel: Relationship = {
          ...rel,
          affinity: rel.affinity ?? 0,
          id: `rel_${Date.now()}_${Math.floor(getRng()()*0x100000).toString(36).substr(0,7)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          relationships: [...state.relationships, newRel],
        }));
      },

      updateRelationship: (id, updates) => {
        set((state) => ({
          relationships: state.relationships.map((rel) =>
            rel.id === id
              ? { ...rel, ...updates, updatedAt: Date.now() }
              : rel
          ),
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
        return get().relationships.filter(
          (rel) =>
            rel.name.toLowerCase().includes(q) ||
            (rel.notes && rel.notes.toLowerCase().includes(q))
        );
      },

      syncRivals: (rivals) => {
        if (!get().includeRival) return;

        const existingRivalIds = new Set(
          get().relationships
            .filter((rel) => rel.category === 'Rival')
            .map((rel) => rel.id)
        );

        const rivalRels: Relationship[] = rivals.map((rival: any) => ({
          id: `rival_${rival.id}`,
          name: rival.name || 'Unknown Rival',
          category: 'Rival' as RelationshipCategory,
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
        } else {
          // Optionally sync rivals if available
          try {
            const rivals = (window as any).gameStore?.rivalSystem?.getAllRivals() || [];
            get().syncRivals(rivals);
          } catch {
            // Ignore if not available
          }
        }
      },
    }),
    {
      name: 'relationships-storage',
      partialize: (state) => ({
        relationships: state.relationships,
        includeRival: state.includeRival,
      }),
    }
  )
);
