// Simple test file for minigame system
// Note: Full React testing requires additional setup with testing-library

import { MiniGameSystem, difficultySettings, calculateScore } from '@/systems/MiniGameSystem';

describe('Minigame System - Basic Tests', () => {
  it('should expose expected difficulty settings', () => {
    expect(difficultySettings.easy.targetSize).toBe(40);
    expect(difficultySettings.medium.precisionMultiplier).toBe(1.2);
    expect(difficultySettings.hard.spawnRate).toBe(1000);
  });

  it('should calculate score correctly', () => {
    const score = calculateScore({ moves: 20, timeLeft: 180, timeLimit: 300, multiplier: 1.5 });
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(300);
  });

  it('should create and end a session', () => {
    const sys = new MiniGameSystem();
    const session = sys.startSession('reaction_test', 'medium', 42);
    expect(session.sessionId).toBeTruthy();
    expect(session.id).toBe('reaction_test');

    const result = sys.endSession(session, { moves: 30, timeLeft: 120, timeLimit: 300 });
    expect(result.score).toBeGreaterThan(0);
  });
});
