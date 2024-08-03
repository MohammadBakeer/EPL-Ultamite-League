// JoinLeagueModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { decodeJWT } from '../../../jwtUtils/';
import '../../../styles/League.css'

const JoinLeagueModal = ({ onClose }) => {
  const [leagueCode, setLeagueCode] = useState('');

  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const handleJoinLeague = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        'http://localhost:3000/api/joinleague',
        {
          userId,
          leagueCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(response.data.message);
      onClose(true); 
    } catch (error) {
      console.error('Error joining league:', error.message);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Join League</h2>
        <form onSubmit={handleJoinLeague}>
          <label>
            League Code:
            <input
              type="text"
              value={leagueCode}
              onChange={(e) => setLeagueCode(e.target.value)}
            />
          </label>
          <button type="submit">Join</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinLeagueModal;
