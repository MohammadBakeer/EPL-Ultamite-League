import axios from 'axios';

const roundNum = 2

const storeTotalPoints = async (table) => {
  const token = sessionStorage.getItem('authToken');
  try {
    const response = await axios.post('http://localhost:3000/api/storeTotalPoints', {
      table,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Success:', response.data.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const storeRoundPoints = async (roundPoints) => {
  const token = sessionStorage.getItem('authToken');
  try {
    const response = await axios.post('http://localhost:3000/api/storeRoundPoints', {
      roundPoints,
      roundNum
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Success:', response.data.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
};


const calculateRoundPoints = async (table) => {
  const token = sessionStorage.getItem('authToken');
  
  try {
    const response = await axios.get('http://localhost:3000/api/getPrevTotal', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
    player.points = points;

    if (player.lastName === 'Haaland') {
      player.points += 60;
    }

  });

  const roundPoints = await calculateRoundPoints(table)
  const haalandPoints = roundPoints.find(player => player.lastName === 'Haaland');
  console.log("Haaland roundPoints: ", haalandPoints);
  storeRoundPoints(roundPoints)
  storeTotalPoints(table)
  
  return {
    table,
  };
};
