
import db from '../config/db.js'; // Adjust the path to your database config
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

// Define and export the function to get games by round number
export const getGamesByRoundNumber = async (req, res) => {

  const { roundNum } = req.params; // Extract round number from URL params


  try {
    // Example SQL query to fetch games where round_num matches
    const query = `SELECT * FROM games WHERE round_num = $1`;

    const results = await db.query(query, [roundNum]);
 
    const games = results.rows;

    // Return the fetched games data as JSON response
    res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




export const storeGlobalPredictions = async (req, res) => {
  const { team1Score, team2Score, roundNum, gameId } = req.body;
 
  const token = req.headers.authorization?.split(' ')[1]; 
        
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const decoded = jwt.verify(token, config.jwtSecret);
  const userId = decoded.userId; // Assuming the token payload contains userId


  try {
    const query = `
      INSERT INTO global_predictions (user_id, team_1_result, team_2_result, round_num, game_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const results = await db.query(query, [ userId, team1Score, team2Score, roundNum, gameId]);
    const prediction = results.rows[0];

    // Return the saved prediction data as JSON response
    res.status(200).json(prediction);
  } catch (error) {
    console.error('Error storing prediction:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getRoundPredictions = async (req, res) => {

    const { roundNum } = req.params; 

    const token = req.headers.authorization?.split(' ')[1]; 
        
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  
  const decoded = jwt.verify(token, config.jwtSecret);
  const userId = decoded.userId; // Assuming the token payload contains userId

  try { 
    const query = `SELECT team_1_result, team_2_result, game_id, round_num, user_id 
    FROM global_predictions 
    WHERE round_num = $1 AND user_id = $2`;

    const results = await db.query(query, [roundNum, userId]);
 
    const games = results.rows;

    res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }

}

export const deleteGlobalPrediciton = async (req, res) => {

    const { gameId } = req.params;
        console.log(gameId);
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId; // Assuming the token payload contains userId

      console.log(userId);
  
      const query = 'DELETE FROM global_predictions WHERE game_id = $1 AND user_id = $2';
      await db.query(query, [gameId, userId]);
  
      res.status(200).json({ message: 'Prediction deleted successfully' });
    } catch (error) {
      console.error('Error deleting prediction:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }

}


