// CreateLeagueModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { decodeJWT } from '../../../jwtUtils/';
import '../../../styles/League.css'


const CreateLeagueModal = ({ onClose, selectedBadge }) => {
  const [leagueName, setLeagueName] = useState('');
  const [roundNum, setRoundNum] = useState(null)
  const [blockChanges, setBlockChanges] = useState(false)

  console.log(roundNum);
  console.log(blockChanges);
  
  const decodedToken = decodeJWT();
  const userId = decodedToken.userId;

  const fetchRoundStatus = async () => {
  
    const token = sessionStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/api/getRoundStatus', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    
    const currentDate = new Date();
  
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num
  
      // Find the maximum round_num
      const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
      const currentRound = maxRoundNum + 1
      // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found
      setRoundNum(maxRoundNum > 0 ? maxRoundNum + 1 : 1);

      const currentRoundObject = data.find(round => round.round_num === currentRound);

      if (currentRoundObject) {
        const { is_current, start_date, finished } = currentRoundObject;
        const startDate = new Date(start_date);
        
        if (is_current || (startDate <= currentDate && !finished)) {
          setBlockChanges(true)

        } else {
          setBlockChanges(false)
        }
      }
  };

  useEffect(() => {
    fetchRoundStatus();
  }, []);

  const handleCreateLeague = async (e) => {
    
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axios.post(
        'http://localhost:3000/api/createleague',
        {
          leagueName,
          ownerId: userId,
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
