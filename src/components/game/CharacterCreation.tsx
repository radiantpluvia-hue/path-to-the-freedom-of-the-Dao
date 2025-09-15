import { useState } from 'react';
import { RACE_BACKGROUNDS } from '@/data/raceBackgrounds';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/core/Button';
import { Background } from '@/types';
import { runtimeRng } from '@/utils/seededRng';

export function CharacterCreation() {
  const { startGame } = useGameStore();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [race, setRace] = useState('Human');
  const [background, setBackground] = useState<Background | null>(null);

  const races = Object.keys(RACE_BACKGROUNDS);
  const backgrounds = RACE_BACKGROUNDS[race] || [];

  const randomizeRace = () => {
  const randomRace = races[Math.floor(runtimeRng() * races.length)];
    setRace(randomRace);
    // When race changes, reset background
    setBackground(null);
  };

  const randomizeBackground = () => {
    if (backgrounds.length > 0) {
  const randomBackground = backgrounds[Math.floor(runtimeRng() * backgrounds.length)];
      setBackground(randomBackground);
    }
  };

  const handleRaceChange = (selectedRace: string) => {
    setRace(selectedRace);
    setBackground(null); // Reset background when race changes
  };

  const handleBackgroundChange = (backgroundId: string) => {
    const selectedBackground = backgrounds.find(bg => bg.id === backgroundId);
    setBackground(selectedBackground || null);
  };

  const handleCreateCharacter = () => {
    startGame({ name, gender: gender as 'Male' | 'Female', race, background });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#ffd700'; // gold
      case 'epic': return '#9b59b6'; // purple
      case 'rare': return '#007bff'; // blue
      case 'uncommon': return '#28a745'; // green
      case 'common': return '#6c757d'; // gray
      default: return '#ffffff'; // white
    }
  };



  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--dark), var(--darker))',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        background: 'var(--gradient-card)',
        border: '2px solid var(--primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: 'var(--shadow-glow)',
        backdropFilter: 'blur(10px)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: 'var(--primary)',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontFamily: 'var(--font-decorative)'
        }}>
          Create Your Character
        </h2>
        
        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gender:</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '1rem'
              }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Race:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                value={race} 
                onChange={(e) => handleRaceChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--dark)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                {races.map(raceOption => (
                  <option key={raceOption} value={raceOption}>
                    {raceOption}
                  </option>
                ))}
              </select>
              <Button onClick={randomizeRace} variant="secondary">Randomize</Button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Background:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select 
                value={background?.id || ''}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--dark)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select a background...</option>
                {backgrounds.map(bg => (
                  <option key={bg.id} value={bg.id}>
                    {bg.name} ({bg.rarity})
                  </option>
                ))}
              </select>
              <Button onClick={randomizeBackground} variant="secondary">Randomize</Button>
            </div>
          </div>

          {background && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ 
                  color: 'var(--primary)', 
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {background.name}
                  <span style={{
                    fontSize: '0.8rem',
                    color: getRarityColor(background.rarity),
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {background.rarity}
                  </span>
                </h3>
              </div>
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '12px',
                lineHeight: '1.4'
              }}>
                {background.description}
              </p>
              {background.effects && Object.keys(background.effects).length > 0 && (
                <div>
                  <h4 style={{ 
                    color: 'var(--accent)', 
                    margin: '0 0 8px 0',
                    fontSize: '0.9rem'
                  }}>
                    Starting Bonuses:
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gap: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {Object.entries(background.effects).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {background.weaponMastery && Object.keys(background.weaponMastery).length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ 
                    color: 'var(--accent)', 
                    margin: '0 0 8px 0',
                    fontSize: '0.9rem'
                  }}>
                    Weapon Mastery:
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gap: '3px',
                    fontSize: '0.85rem'
                  }}>
                    {Object.entries(background.weaponMastery).map(([weapon, mastery]) => (
                      <div key={weapon} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)' }}>
                          {weapon.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                          {mastery.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              onClick={handleCreateCharacter}
              disabled={!name || !background}
              style={{
                background: !name || !background 
                  ? 'var(--muted)' 
                  : 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: 'var(--dark)',
                border: '2px solid var(--primary)',
                borderRadius: '8px',
                padding: '16px 32px',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: !name || !background ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                opacity: !name || !background ? 0.6 : 1
              }}
            >
              Begin Your Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
