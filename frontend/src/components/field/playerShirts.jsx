// src/components/PlayerShirts.jsx
import React from 'react';
import PropTypes from 'prop-types';
import shirtImages from '../../images/shirts/exportShirts.js';  // Import the images object
import defaultShirt from '../../images/shirts/default-shirt.png'

// DefaultShirt Component
const DefaultShirt = () => {
  return (
    <div className="default-shirt-container">
      <img src= {defaultShirt} className="default-shirt" alt="default-shirt" />
    </div>
  );
};

// PlayerShirt Component
const PlayerShirt = ({ player, onRemove, isHomePage }) => {
  const handleRemove = () => {
    onRemove(player);
  };

  const playerName = player.lastName.length > 16 ? player.firstName : player.lastName;

  return (
    <div className="real-player-shirt-container">
      <div className="real-shirt-container-1">
        <div className="real-shirt-container-2">
          {isHomePage && (
            <div className="information-player">
              <svg width="11" height="11" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="12" height="12" transform="translate(0 0.00158691)" fill="#ECC435" />
                <rect x="5" y="2.00159" width="2" height="2" fill="white" />
                <rect x="5" y="5.00159" width="2" height="5" fill="white" />
              </svg>
            </div>
          )}
          <div className="real-shirt">
            <img src={shirtImages[player.club]} alt={`${player.club} shirt`} className="club-shirt" />
          </div>
          {isHomePage && (
            <div className="close-player" onClick={handleRemove}>
              <svg width="11" height="11" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="12" height="12.0016" fill="#ECC435" />
                <rect width="2.26273" height="9.05092" transform="matrix(0.707103 0.707111 -0.707103 0.707111 8.40015 2.00159)" fill="white" />
                <rect width="1.98588" height="9.05092" transform="matrix(-0.707103 0.707111 -0.707103 -0.707111 9.8042 8.40002)" fill="white" />
              </svg>
            </div>
          )}
        </div>
        <div className="real-shirt-container-2-name">
          {playerName}
        </div>
      </div>
    </div>
  );
};

PlayerShirt.propTypes = {
  player: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  isHomePage: PropTypes.bool.isRequired,
};

export { DefaultShirt, PlayerShirt };
