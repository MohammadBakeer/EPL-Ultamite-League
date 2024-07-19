import React from 'react';
import Badges from '../../../images/badges/exportBadges.js'; // Adjust the path as per your project structure
import '../../../styles/FantasyLeague.css';

const LeagueBadgeModal = ({ onClose, onSelectBadge }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h4>Select a badge for your league</h4>
        <div className="badge-container">
          {Object.entries(Badges).map(([badgeName, badgeSrc]) => (
            <div key={badgeName} className="badge-item" onClick={() => onSelectBadge(badgeName)}>
              <img src={badgeSrc} alt={`${badgeName} Badge`} className="badge-image" />
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default LeagueBadgeModal;
