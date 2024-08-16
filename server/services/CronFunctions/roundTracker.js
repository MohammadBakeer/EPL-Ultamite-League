import axios from 'axios';
import db from '../../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

export const fetchRoundStatus = async () => {
  const url = `https://api.sportmonks.com/v3/football/rounds/seasons/23614?api_token=${process.env.API_TOKEN}`;

  try {
    const response = await axios.get(url);
    const data = response.data.data; // Assuming the data array is within the `data` field of the response

    const parsedData = data.map(round => ({
      name: parseInt(round.name, 10),
      finished: round.finished,
      is_current: round.is_current,
      starting_at: new Date(round.starting_at),
      ending_at: new Date(round.ending_at)
    }));

    const sortedData = parsedData.sort((a, b) => a.name - b.name);

    await storeRoundStatus(sortedData); // Wait for this to complete first

    const currentRoundNum = await fetchRoundDBStatus(); // Now fetch the round number

    await insertTeam(currentRoundNum); // Finally insert the team

  } catch (error) {
    console.error('Error fetching data from the Fantasy Premier League API:', error.message);
  }
};

const storeRoundStatus = async (rounds) => {
  try {
    for (const round of rounds) {
      const query = `
        INSERT INTO round_status (round_num, finished, is_current, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (round_num) DO UPDATE SET
          finished = EXCLUDED.finished,
          is_current = EXCLUDED.is_current,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date;
      `;
      const values = [
        round.name,
        round.finished,
        round.is_current,
        round.starting_at,
        round.ending_at
      ];

      await db.query(query, values);
    }
  } catch (error) {
    console.error('Error storing data in the database:', error.message);
  }
};

const insertTeam = async (currentRoundNum) => {
  try {
    const response = await fetch('https://epl-ultimate-league-production.up.railway.app/api/insertTeamTracker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentRoundNum,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Team inserted successfully:', data);
    } else {
      console.error('Failed to insert team:', response.statusText);
    }
  } catch (error) {
    console.error('Error inserting team:', error.message);
  }
};

// Function to fetch round status from the database
const fetchRoundDBStatus = async () => {
  try {
    const response = await fetch('https://epl-ultimate-league-production.up.railway.app/api/getRoundDBStatus', {
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
