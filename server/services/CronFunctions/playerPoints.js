
import axios from 'axios';

const fetchRoundDBStatus = async () => {

  try {
    const response = await fetch('https://epl-ultamite-league-production.up.railway.app/api/getRoundDBStatus', {
      method: 'GET',
    });
    console.log("from points: ",response);
    if (!response.ok) throw new Error(`HTTP error! Status from points: ${response.status}`);
    const data = await response.json();
  
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num

    // Find the maximum round_num
    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1; // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found

    return currentRound;
  } catch (error) {
    console.error('Error fetching round status from the database from points:', error.message);
  }
};


const storeTotalPoints = async (table) => {

  try {
    const response = await axios.post('https://epl-ultamite-league-production.up.railway.app/api/storeTotalPoints', {
      table,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });


  } catch (error) {
    console.error('Error:', error.message);
  }
};

const storeRoundPoints = async (roundPoints, roundNum) => {

  try {
    const response = await axios.post('https://epl-ultamite-league-production.up.railway.app/api/storeRoundPoints', {
      roundPoints,
      roundNum
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    
  } catch (error) {
    console.error('Error:', error.message);
  }

};


const calculateRoundPoints = async (table) => {

  
  try {
    const response = await axios.get('https://epl-ultamite-league-production.up.railway.app/api/getPrevTotal', {
     
    });

    const prevTotals = response.data; // Assuming this returns an array of objects with firstName, lastName, and previousTotal
  
    // Create a new array based on `table` with updated `roundPoints`
    const roundPoints = table.map((player) => {
      // Find the previous total for the current player by firstName and lastName
      const foundPlayer = prevTotals.find(p => p.firstName === player.firstName && p.lastName === player.lastName);
      
      // Get the totalPoints or default to 0
      const prevTotal = foundPlayer?.totalPoints || 0;

      return {
        ...player,
        roundPoints: player.points - prevTotal,
      };
    });
   
    return roundPoints;

  } catch (error) {
    console.error('Error fetching previous total points:', error.message);
    return table; // Return the original table in case of error
  }
};


//calculatePrice if a FWD has a price already greater than or equal to 9 they need 3000 points that round to go up .2 in price
//if a FWD has a price of less than or equal to 8 they need 2000 points that round to go up .2 in price
// if a FWD with a price that is 9 or over they will go down .2 if they get less than 2000 points
// if a FWD with a price less than or equal to 8 they will lose .2 in price if they get less than 500 points per round




// Function to calculate points for each player
export const calculatePoints = async (table) => {
 
  table.forEach((player) => {
    let points = 0;

    // Calculate points based on player's position
    switch (player.position) {
      case 'FWD':
          points += player.goalsScored * 1800; // 1.3 * 100
          points += player.assists * 1000; // 0.7 * 100
          points += player.cleanSheets * 100; // 0.1 * 100
          points += player.goalsConceded * -100; // -0.1 * 100
          points += player.yellowCards * -200; // -0.2 * 100
          points += player.redCards * -400; // -0.4 * 100
          points += Math.floor(player.minutes / 90) * 100; // 0.1 * 100
          break;
      case 'MID':
          points += player.goalsScored * 700; // 1.0 * 100
          points += player.assists * 1200; // 0.8 * 100
          points += player.cleanSheets * 400; // 0.4 * 100
          points += player.goalsConceded * -200; // -0.2 * 100
          points += player.yellowCards * -100; // -0.1 * 100
          points += player.redCards * -400; // -0.4 * 100
          points += Math.floor(player.minutes / 90) * 700; // 0.2 * 100
          break;
      case 'DEF':
          points += player.goalsScored * 1500; // 0.7 * 100
          points += player.assists * 400; // 0.4 * 100
          points += player.cleanSheets * 700; // 0.7 * 100
          points += player.goalsConceded * -300; // -0.3 * 100
          points += player.yellowCards * -20; // -0.2 * 100
          points += player.redCards * -200; // -0.4 * 100
          points += Math.floor(player.minutes / 90) * 800; // 0.6 * 100
          break;
      case 'GK':
          points += player.cleanSheets * 1400; // 1.2 * 100
          points += player.goalsConceded * -800; // -0.8 * 100
          points += player.penaltiesSaved * 700; // 0.7 * 100
          points += player.saves * 400; // 0.4 * 100
          points += Math.floor(player.minutes / 90) * 100; // 0.3 * 100
          break;
      default:
          break;
    }

    points += 4;

    player.points = points;
  });

  const currentRound = await fetchRoundDBStatus()
  const roundPoints = await calculateRoundPoints(table)
  storeRoundPoints(roundPoints, currentRound)
  storeTotalPoints(table)
  
  return {
    table,
  };
};

