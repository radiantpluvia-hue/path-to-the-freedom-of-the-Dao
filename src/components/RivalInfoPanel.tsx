import React from 'react';

type Props = {
  rivalId?: string;
};

const RivalInfoPanel: React.FC<Props> = ({ rivalId }) => {
  return (
    <div className="rival-info-panel">
      <h4>Rival Info</h4>
      <p>ID: {rivalId || 'N/A'}</p>
      <p>Personality: (scaffold)</p>
    </div>
  );
};

export default RivalInfoPanel;
