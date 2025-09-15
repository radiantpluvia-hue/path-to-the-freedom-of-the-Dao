import React from 'react';
import { useGameStore } from '@/store/useGameStore';

const SkillEvolutionTest: React.FC = () => {
  const { player, gainSkillExp, evolveSkill, addEventLog } = useGameStore();

  const testSkillEvolution = () => {
    // Test weaponMastery evolution
    const weaponMastery = player.skills.weaponMastery;

    if (weaponMastery && weaponMastery.level >= 5) {
      // Try to evolve to Sword Qi
      evolveSkill('weaponMastery', 'Sword Qi');
    } else if (weaponMastery) {
      // Add enough exp to reach level 5
      const expNeeded = weaponMastery.expToNext * 5 - weaponMastery.exp;
      gainSkillExp('weaponMastery', expNeeded);
      addEventLog(`Added ${expNeeded} exp to weaponMastery to test evolution!`);
    }
  };

  const testInvalidEvolution = () => {
    // Test invalid evolution path
    evolveSkill('weaponMastery', 'Invalid Path');
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Skill Evolution Test</h3>
      <div>
        <strong>Weapon Mastery:</strong> Level {player.skills.weaponMastery?.level || 'N/A'}, 
        EXP: {player.skills.weaponMastery?.exp || 0}/{player.skills.weaponMastery?.expToNext || 0}
      </div>
      <div>
        <strong>Sword Qi:</strong> {player.skills.sword_qi ? `Level ${player.skills.sword_qi.level}` : 'Not evolved yet'}
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={testSkillEvolution} style={{ marginRight: '10px' }}>
          Test Evolution
        </button>
        <button onClick={testInvalidEvolution} style={{ backgroundColor: '#ff6b6b' }}>
          Test Invalid Evolution
        </button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Note: Evolution becomes available at level 5, 10, 15, 20, 25, or 30
      </div>
    </div>
  );
};

export default SkillEvolutionTest;
