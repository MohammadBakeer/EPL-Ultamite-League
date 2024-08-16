import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const liveGameTracker = async () => {
  const url = `https://api.sportmonks.com/v3/football/livescores/latest?api_token=${process.env.SPORTMONKS_API_TOKEN}&include=scores`;

  try {
    // Make the API request
    const response = await axios.get(url);

    // Log the response data
    console.log('Live Game Data:', response.data);

    // You can add more logic here to process the live game data
  } catch (error) {
    // Handle any errors that occur during the API call
    console.error('Error fetching live game data:', error.message);
  }
};
