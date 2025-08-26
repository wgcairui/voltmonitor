import React from 'react';

const TitleBar: React.FC = () => {
  return (
    <div className="titlebar">
      <div className="titlebar-buttons">
        <div className="titlebar-button close"></div>
        <div className="titlebar-button minimize"></div>
        <div className="titlebar-button maximize"></div>
      </div>
      VoltMonitor
    </div>
  );
};

export default TitleBar;