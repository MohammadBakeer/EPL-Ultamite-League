
// Function to calculate points and price for each player
export const calculatePoints = (table) => {
    table.forEach((player) => {
      let points = 0;
      let price = player.price || 0; // Assuming a default value for price
  
      // Calculate points and price based on player's position
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
  
  
      player.points = points;
      player.price = price;
    });

    return {
      table,
    };
  };
  