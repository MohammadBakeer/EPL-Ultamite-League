
import db from '../config/db.js'; // Adjust the path to your database config
import config from '../config/config.js';
import jwt from 'jsonwebtoken';


export const storeGlobalPredictions = async (req, res) => {
    const { team1Score, team2Score, roundNum, gameId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }
  
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    const userId = decoded.userId; // Assuming the token payload contains userId
  
    try {
      // Check the number of predictions for the user in this round
      const countQuery = `
        SELECT COUNT(*) FROM global_predictions WHERE user_id = $1 AND round_num = $2
      `;
      const countResult = await db.query(countQuery, [userId, roundNum]);
      const predictionCount = parseInt(countResult.rows[0].count, 10);
  
      if (predictionCount >= 3) {
        return res.status(400).json({ error: 'Can only make 3 predictions per round' });
      }
  
      // Check if the prediction already exists
      const checkQuery = `
        SELECT * FROM global_predictions WHERE user_id = $1 AND game_id = $2
      `;
      const checkResult = await db.query(checkQuery, [userId, gameId]);
  
      let prediction;
      if (checkResult.rows.length > 0) {
        // Prediction exists, update it
        const updateQuery = `
          UPDATE global_predictions
          SET team_1_result = $1, team_2_result = $2, round_num = $3
          WHERE user_id = $4 AND game_id = $5
          RETURNING *
        `;
        const updateResult = await db.query(updateQuery, [team1Score, team2Score, roundNum, userId, gameId]);
        prediction = updateResult.rows[0];
      } else {
        // Prediction does not exist, insert a new one
        const insertQuery = `
          INSERT INTO global_predictions (user_id, team_1_result, team_2_result, round_num, game_id)
          VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const insertResult = await db.query(insertQuery, [userId, team1Score, team2Score, roundNum, gameId]);
        prediction = insertResult.rows[0];
      }
  
      // Return the saved prediction data as JSON response
      res.status(200).json(prediction);
    } catch (error) {
      console.error('Error storing prediction:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

export const deleteGlobalPrediction = async (req, res) => {

    const { gameId } = req.params;
     
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId; // Assuming the token payload contains userId

      const query = 'DELETE FROM global_predictions WHERE game_id = $1 AND user_id = $2';
      await db.query(query, [gameId, userId]);
  
      res.status(200).json({ message: 'Prediction deleted successfully' });
    } catch (error) {
      console.error('Error deleting prediction:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }

}


export const fetchAllGlobalPredictions = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    // Verify the token (if needed for authorization)
    jwt.verify(token, config.jwtSecret);

    // Fetch all records from the global_prediction_members table
    const query = 'SELECT * FROM global_prediction_members';
    const result = await db.query(query);
    
    // Extract user_ids from the result
    const userIds = result.rows.map(row => row.user_id);

    if (userIds.length === 0) {
      return res.status(200).json([]); // No records found
    }

    // Query the users table to get team_names for the extracted user_ids
    const userQuery = `
      SELECT user_id, team_name 
      FROM users 
      WHERE user_id = ANY($1::int[])
    `;
    const userResult = await db.query(userQuery, [userIds]);

    // Create a map of user_id to team_name for quick lookup
    const userMap = userResult.rows.reduce((map, user) => {
      map[user.user_id] = user.team_name;
      return map;
    }, {});

    // Combine the results
    const combinedResults = result.rows.map(row => ({
      user_id: row.user_id,
      team_name: userMap[row.user_id], 
      league_points: row.league_points,
    }));
  

    // Send the combined result
    res.status(200).json(combinedResults);
  } catch (error) {
    console.error('Error fetching global predictions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
