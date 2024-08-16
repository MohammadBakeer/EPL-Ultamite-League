// cron.js

import axios from 'axios';
import db from '../config/db.js';
import cron from 'node-cron';
import { calculatePoints } from './CronFunctions/playerPoints.js';
import { teamRoundPoints } from './CronFunctions/matchingRoundPoints.js'
import { fetchRoundStatus } from './CronFunctions/roundTracker.js'
import { liveGameTracker } from './CronFunctions/gameTracker.js';



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

const fetchRoundLive = async () => {
  console.log("hi from live");
  try {
    const response = await fetch('http://localhost:3000/api/getRoundDBStatus', {
      method: 'GET',
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    const finishedRounds = data
      .filter(round => round.finished)
      .map(round => round.round_num);

    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1;

    const currentRoundObject = data.find(round => round.round_num === currentRound);
    const currentDate = new Date();
    let roundLive = false;

    if (currentRoundObject) {
      const { is_current, start_date, finished } = currentRoundObject;
      const startDate = new Date(start_date);

      if (is_current || (startDate <= currentDate && !finished)) {
        roundLive = true;
      }
    }

    console.log(`Current Round: ${currentRound}, Round Live: ${roundLive}`);

    return { currentRound, roundLive };
  } catch (error) {
    console.error('Error fetching round status from the database:', error.message);
  }
};


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
      const playerResponse = await fetch('http://localhost:3000/api/playerNames');
      const playerData = await playerResponse.json();

      const teamResponse = await fetch('http://localhost:3000/api/teams');
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

      calculatePoints(updatedTable);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  await fetchData();
  const currentRound = await fetchRoundDBStatus();

  teamRoundPoints(currentRound);
}


cron.schedule('*/60 * * * * *', buildPlayerData);

cron.schedule('0 */6 * * *', fetchRoundStatus);


// cron.schedule('*/20 * * * * *', async () => {
//   const { currentRound, roundLive } = await fetchRoundLive();
//   if (roundLive) {
//     console.log('Round is live. Tracking live games...');
//     liveGameTracker(currentRound);
//   } else {
//     console.log('No live round.');
// });



// Fetch Live updates cron will be set to run every 5 minutes once blockChanges is true and then when Live is true it will run every 10 seconds. Once no lives it will go 
















