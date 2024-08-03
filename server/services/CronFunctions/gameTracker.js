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


  export const fetchSchedule = async () => {
    const url = 'https://api.sportmonks.com/v3/football/schedules/seasons/23614?api_token=D21slCxRSvhnGAtf67pIuf2bF59ceCnEIa0P6xQEq4sNTGaBYpyIz86YPDkL';
      console.log("hi");
    try {
      const response = await axios.get(url);
      const data = response.data;
  
      // Accessing rounds and creating an array of fixtures for each round
      const roundsArray = data.data.map(round => {
        return round.rounds.map(roundDetail => {
          return roundDetail.fixtures.map(fixture => ({
            name: fixture.name,
            starting_at: fixture.starting_at,
            fixture_id: fixture.id,
            round_num: roundDetail.name
          }));
        });
      });
  
      // Flatten the roundsArray to log each fixture's details
      const flattenedFixtures = roundsArray.flat(2); // Flattens the array to 2 levels deep
      flattenedFixtures.forEach(fixture => {
        console.log(`Match: ${fixture.name}, Starts At: ${fixture.starting_at}, Fixture ID: ${fixture.fixture_id}, Round: ${fixture.round_num}`);
      });
    } catch (error) {
      console.error('Error fetching data from the Fantasy Premier League API:', error.message);
    }
  };