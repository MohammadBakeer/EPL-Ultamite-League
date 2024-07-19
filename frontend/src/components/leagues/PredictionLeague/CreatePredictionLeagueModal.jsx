// CreateLeagueModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { decodeJWT } from '../../../jwtUtils/';
import '../../../styles/FantasyLeague.css'


const CreateLeagueModal = ({ onClose, selectedBadge }) => {
  const [leagueName, setLeagueName] = useState('');
  const [startRound, setStartRound] = useState(1);

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const handleCreateLeague = async (e) => {
    const roundNum = 2
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        'http://localhost:3000/api/createleague',
        {
          leagueName,
          ownerId: userId,
          startRound,
          leagueBadge: selectedBadge,
          roundNum
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      onClose(true); 
      console.log(response.data.message);
    
    } catch (error) {
      console.error('Error creating league:', error.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New League</h2>
        <form onSubmit={handleCreateLeague}>
          <label>
            League Name:
            <input
              type="text"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              maxLength={20}
              required
            />
          </label>
          <label>
            Points Start Round:
            <select
              value={startRound}
              onChange={(e) => setStartRound(Number(e.target.value))}
            >
              {Array.from({ length: 38 }, (_, index) => (
                <option key={index} value={index + 1}>
                  Round {index + 1}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLeagueModal;
