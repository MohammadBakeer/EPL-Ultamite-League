
    import axios from 'axios';

    export const attachPrice = async (playerData) => {
      const token = sessionStorage.getItem('authToken');
    
      try {
        // Send the player data to the server to get prices attached
        const response = await fetch('https://epl-ultimate-league-server.up.railway.app/api/playerPrices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ table: playerData }),
        });
    
        if (!response.ok) {
          throw new Error('Failed to retrieve player prices');
        }
    
        // Receive the updated table with attached prices from the server
        const data = await response.json();
    
        // Return the updated player data with attached prices
        return data.table;
    
      } catch (error) {
        console.error('Error:', error.message);
        return []; // Handle error appropriately (e.g., return empty array or original data)
      }
    };
    