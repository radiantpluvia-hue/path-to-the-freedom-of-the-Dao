import { SaveLoadSystem } from '../src/systems/SaveLoadSystem';

describe('SaveLoadSystem migrations', () => {
	test('migrateLegacyKeys maps hermitPath -> seclusionPath and mentor id mapping', () => {
		const fakeSave: any = {
			gameState: {
				hermitPath: { practicing: true },
				hermitCurse: { severity: 2 },
				hermitStudyProgress: { sessions: 5 },
				mentorTeachings: [{ id: 'hermitCurse', value: 1, prerequisites: { hermitCurse: true } }],
				player: { hermitStatus: { withdrawn: true }, hermitStudyProgress: { sessions: 5 } }
			},
			gameVersion: '0.9.0',
			timestamp: Date.now()
		};

		SaveLoadSystem.migrateLegacyKeys(fakeSave);

		expect(fakeSave.gameState.seclusionPath).toEqual({ practicing: true });
		expect(fakeSave.gameState.mentorTeachings[0].id).toBe('seclusionCurse');
		expect(fakeSave.gameState.player.seclusionStatus).toEqual({ withdrawn: true });
	});

	test('migrateLegacyKeys preserves unknown keys and does not delete legacy keys', () => {
		const fakeSave: any = {
			gameState: {
				hermitPath: { practicing: true },
				legacyOnlyKey: { shouldStay: true },
				player: { hermitStatus: { withdrawn: true } }
			},
			gameVersion: '0.8.5',
			timestamp: Date.now()
		};

		SaveLoadSystem.migrateLegacyKeys(fakeSave);

		// unknown keys must be preserved
		expect(fakeSave.gameState.legacyOnlyKey).toEqual({ shouldStay: true });
		// old key is left in place but new key is also set
		expect(fakeSave.gameState.hermitPath).toBeDefined();
		expect(fakeSave.gameState.seclusionPath).toBeDefined();
	});

	test('migrateLegacyKeys only applies world defaults for legacy versions', () => {
		const legacySave: any = {
			gameState: {
				world: { year: 1, day: 1 }
			},
			gameVersion: '0.9.9',
			timestamp: Date.now()
		};

		const modernSave: any = {
			gameState: {
				world: { year: 1, day: 1 }
			},
			gameVersion: '1.0.0',
			timestamp: Date.now()
		};

		SaveLoadSystem.migrateLegacyKeys(legacySave);
		SaveLoadSystem.migrateLegacyKeys(modernSave);

		// legacy save should get a tick default inserted
		expect(legacySave.gameState.world.tick).toBeDefined();
		// modern save should NOT be mutated with tick
		expect(modernSave.gameState.world.tick).toBeUndefined();
	});
});

