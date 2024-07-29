
import axios from 'axios';
import db from '../../config/db.js';

async function matchRoundPoints(players, teams, currentRound) {
  try {
      // Loop over each team
      for (const team of teams) {
          let teamPoints = 0;

          // Loop over each player in the team's lineup
          for (const player of team.player_lineup) {
              // Find the matching player in the players data by first and last name
              const matchedPlayer = players.find(p => 
                  p.firstName === player.firstName && p.lastName === player.lastName
              );

              // If a matching player is found, add their roundPoints to the team's points
              if (matchedPlayer) {
                  teamPoints += matchedPlayer.roundPoints;
              }
          }

          // Update the team's points in the database
          await db.query('UPDATE teams SET points = $1 WHERE user_id = $2 and round_num = $3', [teamPoints, team.user_id, currentRound]);
      }
  } catch (error) {
      console.error('Error in matchRoundPoints:', error.message);
  }
}



async function roundTeams(currentRound) {
    try {
      // Query to get rows where round_num matches currentRound
      const query = `
        SELECT * FROM teams
        WHERE round_num = $1
      `;
  
      // Execute the query
      const teamsResult = await db.query(query, [currentRound]);
  
      // Extract rows from the result
      const teams = teamsResult.rows; // Use .rows to get the actual data from the query result
  
      return teams

    } catch (error) {
      // Handle any errors
      console.error('Error fetching team data:', error.message);
    }
  }




export const teamRoundPoints = async (currentRound) => {

  try {
  
    // Make a GET request to the fetchPlayerRounds endpoint with currentRound as a query parameter
    const response = await axios.get(`http://localhost:3000/api/fetchPlayerRounds/${currentRound}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const players = response.data
    
    const teams = await roundTeams(currentRound)

    matchRoundPoints(players, teams, currentRound)

  } catch (error) {
    console.error('Error:', error.message);
  }
};

// fetch all teams rows. check if the highest value round num is = to current round num. if not. take the latest row for that team with the highest round num and replace that round num with current round num and insert a new row