// cron.js

import axios from 'axios';
import db from '../config/db.js';
import { calculatePoints } from './CronFunctions/playerPoints.js';
import { teamRoundPoints } from './CronFunctions/matchingRoundPoints.js'


const currentRound = 2
/*
// Function to fetch player stats from the API
async function fetchPlayerStats() {
  const playerResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
  const playerData = playerResponse.data.elements;

  const playerStats = {};

  playerData.forEach(player => {
    const playerName = `${player.first_name} ${player.second_name}`;
    playerStats[playerName] = {
      goals_scored: player.goals_scored,
      assists: player.assists,
      clean_sheets: player.clean_sheets,
      goals_conceded: player.goals_conceded,
      penalties_saved: player.penalties_saved,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards,
      saves: player.saves,
      minutes: player.minutes
    };
  });
  return playerStats;
}

// Function to update team data with the latest player stats
async function updateTeamData(playerStats) {
  const teamsResult = await db.query('SELECT * FROM teams');
  const teams = teamsResult.rows; // Use .rows to get the actual data from the query result

  for (const team of teams) {
    let totalPoints = 0;

    team.player_lineup.forEach(player => {
      const playerName = `${player.firstName} ${player.lastName}`;

      if (playerName in playerStats) {
        const stats = playerStats[playerName];
        player.goalsScored = stats.goals_scored;
        player.assists = stats.assists;
        player.cleanSheets = stats.clean_sheets;
        player.goalsConceded = stats.goals_conceded;
        player.penaltiesSaved = stats.penalties_saved;
        player.yellowCards = stats.yellow_cards;
        player.redCards = stats.red_cards;
        player.saves = stats.saves;
        player.minutes = stats.minutes;

        let points = 0;
        let price = 0; // Assuming a default value for price

        // Calculate points based on player's position
        switch (player.position) {
          case 'FWD':
            points += player.goalsScored * 14;
            points += player.assists * 10;
            points += player.cleanSheets * 4;
            points += player.goalsConceded * -1;
            points += player.yellowCards * -5;
            points += player.redCards * -15;
            points += Math.floor(player.minutes / 90) * 10;
            break;
          case 'MID':
            points += player.goalsScored * 18;
            points += player.assists * 10;
            points += player.cleanSheets * 6;
            points += player.goalsConceded * -3;
            points += player.yellowCards * -2;
            points += player.redCards * -8;
            points += Math.floor(player.minutes / 90) * 10;
            break;
          case 'DEF':
            points += player.goalsScored * 20;
            points += player.assists * 15;
            points += player.cleanSheets * 18;
            points += player.goalsConceded * -5;
            points += player.yellowCards * -2;
            points += player.redCards * -8;
            points += Math.floor(player.minutes / 90) * 15;
            break;
          case 'GK':
            points += player.cleanSheets * 25;
            points += player.goalsConceded * -10;
            points += player.penaltiesSaved * 50;
            points += player.saves * 4;
            points += Math.floor(player.minutes / 90) * 10;
            break;
          default:
            break;
        }

        let additionalPrice = Math.floor(points / 50) * 25;
        price += additionalPrice;
        player.points = points;
        player.price = price;

        totalPoints += points;
      }
    });
    // Update total_points column in the database for this team
    const playerLineupJson = JSON.stringify(team.player_lineup);
    await db.query('UPDATE teams SET player_lineup = $1, total_points = $2 WHERE user_id = $3', [playerLineupJson, totalPoints, team.user_id]);
  }
}

// Main function to execute the data synchronization
async function synchronizeData() {
  try {
    console.log('Starting data synchronization...');

    // Step 1: Fetch latest player data from the API
    const playerStats = await fetchPlayerStats();

    // Step 2: Retrieve and update team data with the latest player stats
    await updateTeamData(playerStats);

    console.log('Data synchronization complete.');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  }
}
*/

const mapPosition = (positionId) => {
  switch (positionId) {
    case 1:
      return 'GK';
    case 2:
      return 'DEF';
    case 3:
      return 'MID';
    case 4:
      return 'FWD';
    default:
      return 'Unknown';
  }
};

async function buildPlayerData(){

  const fetchData = async () => {
    try {
       
        const playerResponse = await fetch('http://localhost:3000/api/playerNames', {
          
        });
        const playerData = await playerResponse.json();
       
        const teamResponse = await fetch('http://localhost:3000/api/teams', {
            
        });
        const teamData = await teamResponse.json();

        const updatedTable = playerData.playerNames.map((player) => {
            const { firstName, lastName, teamId, positionId, ...stats } = player;
            const matchingTeam = teamData.team.find((team) => team.id === teamId);
               
            if (matchingTeam) {
                return {
                    firstName,
                    lastName,
                    club: matchingTeam.club,
                    position: mapPosition(positionId),
                    price: '',
                    points: '',
                    roundPoints: 0, 
                    ...stats,
                };
            } else {
                console.warn(`No matching team found for player with teamId ${teamId}`);
                return null;
            }
        });

        calculatePoints(updatedTable)

    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};


fetchData();
teamRoundPoints(currentRound)
}



export { buildPlayerData };

