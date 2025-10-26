import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export const DeathScreen: React.FC = () => {
  const { reincarnate } = useGameStore();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#ff6b6b' }}>
        You Have Died
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px' }}>
        Your journey in this life has come to an end. But in the world of cultivation, death is not the end.
        You have the opportunity to reincarnate with new attributes and continue your path to immortality.
      </p>
      <button
        onClick={reincarnate}
        style={{
          padding: '15px 30px',
          fontSize: '1.2rem',
          backgroundColor: '#4ecdc4',
          color: 'black',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45b7aa'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4ecdc4'}
      >
        Reincarnate
      </button>
    </div>
  );
};
