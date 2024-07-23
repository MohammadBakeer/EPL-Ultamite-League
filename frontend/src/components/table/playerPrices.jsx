import axios from 'axios'

//Save this somewhere for later use. Change this after points calculation is made to give price changes based off points
export const calculatePlayerPrice = (table) => {

    table.forEach((player) => {
        let price = 0;

        switch (player.position) {
            case 'FWD':
                price += player.goalsScored * 1.3;
                price += player.assists * 0.7;
                price += player.cleanSheets * 0.1;
                price += player.goalsConceded * -0.1;
                price += player.yellowCards * -0.2;
                price += player.redCards * -0.4;
                price += Math.floor(player.minutes / 90) * 0.1;
                break;
            case 'MID':
                price += player.goalsScored * 1.0;
                price += player.assists * 0.8;
                price += player.cleanSheets * 0.4;
                price += player.goalsConceded * -0.2;
                price += player.yellowCards * -0.1;
                price += player.redCards * -0.4;
                price += Math.floor(player.minutes / 90) * 0.2;
                break;
            case 'DEF':
                price += player.goalsScored * 0.7;
                price += player.assists * 0.4;
                price += player.cleanSheets * 0.7;
                price += player.goalsConceded * -0.3;
                price += player.yellowCards * -0.2;
                price += player.redCards * -0.4;
                price += Math.floor(player.minutes / 90) * 0.6;
                break;
            case 'GK':
                price += player.cleanSheets * 1.2;
                price += player.goalsConceded * -0.8;
                price += player.penaltiesSaved * 0.7;
                price += player.saves * 0.4;
                price += Math.floor(player.minutes / 90) * 0.3;
                break;
            default:
                break;
        }

        // Apply the pricing formula
        const minPrice = 4;
        const maxPrice = 14;
        const basePrice = 4;

        price = basePrice + (price / 50) * (maxPrice - minPrice);
        price = Math.max(minPrice, Math.min(maxPrice, price));

        player.price = Math.round(price);
 

            // Adjustments based on specific players or teams
            if (player.lastName === 'Borges Fernandes') {
                player.price += 4; // Add 4 points to Bruno Fernandes' price
            } else if (player.club === 'Liverpool') {
                player.price += 2; // Add 2 points to all Liverpool players' prices
            } else if (player.club === 'Man City') {
                player.price += 1; // Add 1 point to all Manchester City players' prices
            } else if (player.club === 'Arsenal') {
                player.price += 1; // Add 1 point to all Arsenal players' prices
            }
            else if (player.club === 'Man Utd'){
                player.price += 1
            }
            else if(player.lastName === 'Onana' && player.firstName === 'Amadou'){
                player.price += 6
            }
             
            if(player.position ==='GK'){
                player.price = player.price - 1
            }
            
            if (player.lastName === 'Onana'){
                player.price = player.price -3
            }
            
            if (player.lastName === 'Vicario'){
                player.price = player.price +2
            }
            if (player.firstName === 'Son'){
                player.price = player.price +2
            }
            if (player.lastName === 'Trossard'){
                player.price = player.price -1
            }
            if (player.lastName === 'Haaland'){
                player.price = player.price +2
            }
            
    });


    return {
        table: table,
    };
}

// Add a get request at the beginning so I don't have to calculate total price every time.
export const updatePlayerPrices = async (playerData) => {

      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/api/playerPrices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ table: playerData }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to store player prices');
        }
        return response.json();
      })
      .then(data => {
        console.log('Success:', data.message);
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
    }

  