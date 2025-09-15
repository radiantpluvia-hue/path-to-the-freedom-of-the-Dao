import React from 'react';

interface ReactionTestProps {
  difficulty?: string;
  onComplete?: (result?: any) => void;
}

const ReactionTest: React.FC<ReactionTestProps> = ({ difficulty = 'medium' }) => {
  return (
    <div className="mini-game reaction-test">
      <h3>Reaction Test (scaffold)</h3>
      <p>Placeholder reaction mini-game. Difficulty: {difficulty}</p>
    </div>
  );
};

export default ReactionTest;
