import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../core/Button';

export function TaiYungLore() {
  const { ui, taiYungLore, nextLore, skipLore } = useGameStore();
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentLoreText = taiYungLore[ui.currentLoreIndex] || '';

  useEffect(() => {
    setDisplayText('');
    setIsTyping(true);
    
    if (currentLoreText) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < currentLoreText.length) {
          setDisplayText(currentLoreText.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(timer);
        }
      }, 50); // Typing speed

      return () => clearInterval(timer);
    }
  }, [currentLoreText]);

  const handleNext = () => {
    if (isTyping) {
      // Skip typing animation
      setDisplayText(currentLoreText);
      setIsTyping(false);
    } else {
      nextLore();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e, #16213e)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      position: 'relative'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: '4rem',
          color: 'var(--primary)',
          fontFamily: 'var(--font-decorative)',
          textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
          marginBottom: '20px',
          letterSpacing: '2px'
        }}>
          太 虚
        </h1>
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-decorative)',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
          marginBottom: '10px'
        }}>
          Tai Yung
        </h2>
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic'
        }}>
          The Supreme Void
        </p>
      </div>

      {/* Lore Text */}
      <div style={{
        maxWidth: '800px',
        textAlign: 'center',
        marginBottom: '60px',
        zIndex: 1
      }}>
        <div style={{
          background: 'rgba(26, 26, 46, 0.8)',
          border: '2px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)',
          backdropFilter: 'blur(10px)',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p style={{
            fontSize: '1.4rem',
            lineHeight: '1.8',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-primary)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            whiteSpace: 'pre-line'
          }}>
            {displayText}
            {isTyping && (
              <span style={{
                opacity: 0,
                animation: 'blink 1s infinite',
                color: 'var(--primary)'
              }}>
                |
              </span>
            )}
          </p>
        </div>
      </div>


      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '40px',
        zIndex: 1
      }}>
        {taiYungLore.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: index <= ui.currentLoreIndex 
                ? 'var(--primary)' 
                : 'rgba(212, 175, 55, 0.3)',
              boxShadow: index <= ui.currentLoreIndex 
                ? '0 0 10px rgba(212, 175, 55, 0.5)' 
                : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '20px',
        zIndex: 1
      }}>
        <Button 
          onClick={handleNext}
          size="large"
        >
          {isTyping ? 'Skip Text' : ui.currentLoreIndex < taiYungLore.length - 1 ? 'Continue' : 'Begin Journey'}
        </Button>
        
        <Button 
          onClick={skipLore}
          variant="secondary"
          size="large"
        >
          Skip Lore
        </Button>
      </div>

      {/* Floating Particles Effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'var(--primary)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 10}s infinite linear`,
              boxShadow: '0 0 6px var(--primary)'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); }
          100% { transform: translateY(-100vh) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}