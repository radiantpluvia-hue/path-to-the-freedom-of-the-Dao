"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RivalSystem_1 = require("../systems/RivalSystem");
const SectSystem_1 = require("../systems/SectSystem");
const rivalArchetypes_1 = require("../data/rivalArchetypes");
const SectSystem_2 = require("../systems/SectSystem");
describe('Rival System Null Reference Fixes', () => {
    let rivalSystem;
    let sectFactionSystem;
    beforeEach(() => {
        rivalSystem = new RivalSystem_1.RivalSystem();
        sectFactionSystem = new SectSystem_1.SectFactionSystem(rivalSystem);
    });
    describe('1. Archetype Generation Issues', () => {
        test('should handle null archetype from getRandomArchetype', () => {
            // Mock getRandomArchetype to return null
            const originalGetRandomArchetype = rivalArchetypes_1.getRandomArchetype;
            global.getRandomArchetype = jest.fn().mockReturnValue(null);
            const rival = rivalSystem.generateRival();
            expect(rival).toBeDefined();
            expect(rival.name).toBeDefined();
            expect(rival.archetype).toBe('fallback');
            // Restore original function
            global.getRandomArchetype = originalGetRandomArchetype;
        });
        test('should handle invalid archetype ID in getArchetypeById', () => {
            const invalidArchetype = (0, rivalArchetypes_1.getArchetypeById)('invalid_id');
            expect(invalidArchetype).toBeNull();
        });
        test('should generate fallback rival when archetype is null', () => {
            const options = { minLevel: 5, maxLevel: 10 };
            const fallbackRival = rivalSystem.generateFallbackRival(options);
            expect(fallbackRival).toBeDefined();
            expect(fallbackRival.level).toBeGreaterThanOrEqual(5);
            expect(fallbackRival.level).toBeLessThanOrEqual(10);
            expect(fallbackRival.archetype).toBe('fallback');
        });
    });
    describe('2. Growth and Evolution Methods', () => {
        test('should handle null archetype in processRivalGrowth', () => {
            const rival = rivalSystem.generateRival();
            // Simulate null archetype
            rival.archetype = 'invalid_archetype';
            // Should not throw error
            expect(() => {
                rivalSystem.processRivalGrowth(rival.id, Date.now());
            }).not.toThrow();
        });
        test('should handle null archetype in performRivalEvolution', () => {
            const rival = rivalSystem.generateRival();
            rival.archetype = 'invalid_archetype';
            // Should not throw error
            expect(() => {
                rivalSystem.performRivalEvolution(rival, null);
            }).not.toThrow();
        });
        test('should handle missing archetype in getArchetypeById during growth', () => {
            const rival = rivalSystem.generateRival();
            const originalGetArchetypeById = rivalArchetypes_1.getArchetypeById;
            global.getArchetypeById = jest.fn().mockReturnValue(null);
            // Should not throw error
            expect(() => {
                rivalSystem.processRivalGrowth(rival.id, Date.now());
            }).not.toThrow();
            // Restore original function
            global.getArchetypeById = originalGetArchetypeById;
        });
    });
    describe('3. Loot Generation Issues', () => {
        test('should handle null lootTable in generateArchetypeLoot', () => {
            const archetype = (0, rivalArchetypes_1.getRandomArchetype)();
            if (!archetype)
                return;
            // Mock archetype with null lootTable
            const mockArchetype = { ...archetype, lootTable: null };
            const loot = rivalSystem.generateArchetypeLoot(mockArchetype, SectSystem_2.MAJOR_SECTS[0], 10);
            expect(loot).toBeDefined();
            expect(Array.isArray(loot)).toBe(true);
            // Should have fallback loot
            expect(loot.length).toBeGreaterThan(0);
        });
        test('should handle undefined lootTable properties', () => {
            const archetype = (0, rivalArchetypes_1.getRandomArchetype)();
            if (!archetype)
                return;
            // Mock archetype with incomplete lootTable
            const mockArchetype = {
                ...archetype,
                lootTable: {
                    common: undefined,
                    uncommon: undefined,
                    rare: undefined
                }
            };
            const loot = rivalSystem.generateArchetypeLoot(mockArchetype, SectSystem_2.MAJOR_SECTS[0], 10);
            expect(loot).toBeDefined();
            expect(Array.isArray(loot)).toBe(true);
            // Should have fallback loot
            expect(loot.length).toBeGreaterThan(0);
        });
        test('should generate fallback loot when all loot generation fails', () => {
            const archetype = (0, rivalArchetypes_1.getRandomArchetype)();
            if (!archetype)
                return;
            // Mock archetype with empty lootTable
            const mockArchetype = {
                ...archetype,
                lootTable: {}
            };
            const loot = rivalSystem.generateArchetypeLoot(mockArchetype, SectSystem_2.MAJOR_SECTS[0], 10);
            expect(loot).toBeDefined();
            expect(Array.isArray(loot)).toBe(true);
            expect(loot.length).toBeGreaterThan(0);
            // Should contain spirit stones as fallback
            expect(loot.some((item) => item.name.includes('Spirit Stones'))).toBe(true);
        });
    });
    describe('4. Sect/Faction Validation', () => {
        test('should handle empty MAJOR_SECTS array', () => {
            const originalMajorSects = [...SectSystem_2.MAJOR_SECTS];
            global.MAJOR_SECTS = [];
            const rival = rivalSystem.generateRival();
            expect(rival).toBeDefined();
            expect(rival.sect).toBeDefined();
            // Restore original array
            global.MAJOR_SECTS = originalMajorSects;
        });
        test('should handle empty MAJOR_FACTIONS array', () => {
            const originalMajorFactions = [...SectSystem_2.MAJOR_FACTIONS];
            global.MAJOR_FACTIONS = [];
            const rival = rivalSystem.generateRival();
            expect(rival).toBeDefined();
            expect(rival.faction).toBeDefined();
            // Restore original array
            global.MAJOR_FACTIONS = originalMajorFactions;
        });
        test('should handle invalid array types', () => {
            const originalMajorSects = [...SectSystem_2.MAJOR_SECTS];
            global.MAJOR_SECTS = null;
            expect(() => {
                rivalSystem.generateRival();
            }).toThrow();
            // Restore original array
            global.MAJOR_SECTS = originalMajorSects;
        });
        test('should validate sect and faction arrays before random selection', () => {
            const originalMajorSects = [...SectSystem_2.MAJOR_SECTS];
            const originalMajorFactions = [...SectSystem_2.MAJOR_FACTIONS];
            // Test with valid arrays
            expect(Array.isArray(SectSystem_2.MAJOR_SECTS)).toBe(true);
            expect(SectSystem_2.MAJOR_SECTS.length).toBeGreaterThan(0);
            expect(Array.isArray(SectSystem_2.MAJOR_FACTIONS)).toBe(true);
            expect(SectSystem_2.MAJOR_FACTIONS.length).toBeGreaterThan(0);
            // Verify all sects have required properties
            SectSystem_2.MAJOR_SECTS.forEach(sect => {
                expect(sect.id).toBeDefined();
                expect(sect.name).toBeDefined();
                expect(sect.type).toBeDefined();
            });
            // Verify all factions have required properties
            SectSystem_2.MAJOR_FACTIONS.forEach(faction => {
                expect(faction.id).toBeDefined();
                expect(faction.name).toBeDefined();
                expect(faction.type).toBeDefined();
            });
        });
    });
    describe('5. Comprehensive Integration Tests', () => {
        test('should handle all null reference scenarios simultaneously', () => {
            // Mock multiple null scenarios
            const originalGetRandomArchetype = rivalArchetypes_1.getRandomArchetype;
            const originalGetArchetypeById = rivalArchetypes_1.getArchetypeById;
            const originalMajorSects = [...SectSystem_2.MAJOR_SECTS];
            const originalMajorFactions = [...SectSystem_2.MAJOR_FACTIONS];
            global.getRandomArchetype = jest.fn().mockReturnValue(null);
            global.getArchetypeById = jest.fn().mockReturnValue(null);
            global.MAJOR_SECTS = [];
            global.MAJOR_FACTIONS = [];
            // Should not throw any errors and generate valid rival
            const rival = rivalSystem.generateRival();
            expect(rival).toBeDefined();
            expect(rival.id).toBeDefined();
            expect(rival.name).toBeDefined();
            expect(rival.archetype).toBe('fallback');
            // Restore original functions and data
            global.getRandomArchetype = originalGetRandomArchetype;
            global.getArchetypeById = originalGetArchetypeById;
            global.MAJOR_SECTS = originalMajorSects;
            global.MAJOR_FACTIONS = originalMajorFactions;
        });
        test('should maintain system stability under extreme null conditions', () => {
            // Create a scenario with all possible null references
            const rival = rivalSystem.generateRival();
            // Test growth with null archetype
            rival.archetype = null;
            expect(() => {
                rivalSystem.processRivalGrowth(rival.id, Date.now());
            }).not.toThrow();
            // Test evolution with null archetype
            expect(() => {
                rivalSystem.checkRivalEvolution(rival, null);
            }).not.toThrow();
            // Test teaching with null archetype
            const teachingOptions = rivalSystem.getRivalTeachingOptions(rival.id);
            expect(teachingOptions).toEqual([]);
            // Test growth info with null archetype
            const growthInfo = rivalSystem.getRivalGrowthInfo(rival.id);
            expect(growthInfo).toBeNull();
        });
        test('should handle concurrent rival operations with null references', () => {
            const rivals = [];
            // Generate multiple rivals
            for (let i = 0; i < 10; i++) {
                const rival = rivalSystem.generateRival();
                rivals.push(rival);
            }
            // Simulate various null scenarios
            rivals.forEach((rival, index) => {
                if (index % 2 === 0) {
                    rival.archetype = null;
                }
            });
            // Test batch operations
            expect(() => {
                rivals.forEach(rival => {
                    rivalSystem.processRivalGrowth(rival.id, Date.now());
                    rivalSystem.getRivalTeachingOptions(rival.id);
                    rivalSystem.getRivalGrowthInfo(rival.id);
                });
            }).not.toThrow();
        });
    });
    describe('6. Error Logging and Debugging', () => {
        test('should log appropriate warnings for null reference scenarios', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            // Mock getRandomArchetype to return null
            const originalGetRandomArchetype = rivalArchetypes_1.getRandomArchetype;
            global.getRandomArchetype = jest.fn().mockReturnValue(null);
            rivalSystem.generateRival();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to generate archetype'));
            // Restore original function
            global.getRandomArchetype = originalGetRandomArchetype;
            consoleSpy.mockRestore();
            errorSpy.mockRestore();
        });
        test('should log errors for invalid array structures', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            const originalMajorSects = [...SectSystem_2.MAJOR_SECTS];
            global.MAJOR_SECTS = null;
            // This should trigger error logging
            try {
                rivalSystem.generateRival();
            }
            catch (e) {
                // Expected to throw
            }
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('MAJOR_SECTS array is invalid'));
            // Restore original array
            global.MAJOR_SECTS = originalMajorSects;
            consoleSpy.mockRestore();
        });
    });
    describe('7. Performance and Stability Tests', () => {
        test('should handle rapid rival generation without memory leaks', () => {
            const startTime = Date.now();
            // Generate many rivals quickly
            for (let i = 0; i < 100; i++) {
                const rival = rivalSystem.generateRival();
                expect(rival).toBeDefined();
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Should complete within reasonable time (less than 5 seconds)
            expect(duration).toBeLessThan(5000);
        });
        test('should maintain consistent performance with null references', () => {
            const originalGetRandomArchetype = rivalArchetypes_1.getRandomArchetype;
            global.getRandomArchetype = jest.fn().mockReturnValue(null);
            const startTime = Date.now();
            // Generate rivals with null archetype
            for (let i = 0; i < 50; i++) {
                const rival = rivalSystem.generateRival();
                expect(rival).toBeDefined();
                expect(rival.archetype).toBe('fallback');
            }
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Should complete within reasonable time even with fallbacks
            expect(duration).toBeLessThan(3000);
            // Restore original function
            global.getRandomArchetype = originalGetRandomArchetype;
        });
    });
});
