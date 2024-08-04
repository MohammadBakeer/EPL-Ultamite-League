import axios from 'axios';
import db from '../../config/db.js';


const fetchRoundDBStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/getRoundDBStatus', {
        method: 'GET',
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
    
      const finishedRounds = data
        .filter(round => round.finished) // Filter objects with finished as true
        .map(round => round.round_num); // Map to round_num
  
      // Find the maximum round_num
      const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
      const currentRound = maxRoundNum + 1; // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found
  
      return currentRound;
    } catch (error) {
      console.error('Error fetching round status from the database:', error.message);
    }
  };

// This will have the live matches sports monk endpoint