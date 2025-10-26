import { mockUseGameStore } from '../tests/testUtils/mockUseGameStore';

describe('mission claim smoke test', () => {
	test('mock store exposes claimMissionRewards', () => {
		const { useGameStoreMock } = mockUseGameStore();
		expect(useGameStoreMock).toBeDefined();
		const view = (useGameStoreMock as any).getState();
		// claimMissionRewards should be a function available on the store view
		expect(typeof view.claimMissionRewards).toBe('function');
	});
});
