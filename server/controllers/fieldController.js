import db from '../config/db.js';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

export const updateLineup = async (req, res) => {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1]; 
        
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      // Decode the token to get the userId using the secret from the config file
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId; // Assuming the token payload contains userId
      
      const { formation, totalBudget, playerLineup, roundNum } = req.body;
   
      // Convert playerLineup to a JSON string before storing in the database
      const playerLineupString = JSON.stringify(JSON.parse(playerLineup));
      
      // Perform database update operation for teams table
      await db.query(
        'UPDATE teams SET formation = $1, player_lineup = $2, total_budget = $3 WHERE user_id = $4 AND round_num = $5',
        [JSON.stringify(formation), playerLineupString, totalBudget, userId, roundNum]
      );
  
      // Send a response indicating success
      res.status(200).json({
        message: 'Team state updated successfully',
        teamState: { user_id: userId, formation, player_lineup: playerLineup, total_budget: totalBudget },
      });
    } catch (error) {
      console.error('Error updating team state:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };
    
  export const getUserLineup = async (req, res) => {
    try {
        const { userId } = req.body;
        const { viewId } = req.body;
        const { roundNum } = req.body

        let queryId = userId

        if (viewId) {
          queryId = viewId
        }

      // Perform the database query to get user lineup information
      const result = await db.query('SELECT formation, player_lineup, total_budget, points FROM teams WHERE user_id = $1 AND round_num = $2', [queryId, roundNum]);
        
      if (result.rows.length > 0) {
        const { formation, player_lineup, total_budget, points } = result.rows[0];
  
        res.json({ formation, playerLineup: JSON.stringify(player_lineup), totalBudget: total_budget, points });
      } else {
        res.status(404).json({ error: 'User lineup not found' });
      }
    } catch (error) {
      console.error('Error fetching user lineup:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };

 
  export const getRoundStatus = async (req, res) => {

    try {
      const query = 'SELECT * FROM round_status;';
      const result = await db.query(query);
  
      // Check if data was retrieved
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No round status found.' });
      }
      
      // Return the data to the frontend
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching round status:', error.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };


  export const insertTeamTracker = async (req, res) => {
    try {
      const { currentRoundNum } = req.body;
     
      // Step 1: Fetch all rows from the teams table
      const { rows } = await db.query('SELECT * FROM teams ORDER BY round_num DESC');
      
      if (rows.length === 0) {
        return res.status(200).json({ message: 'No teams found in the teams table' });
      }
  
      // Step 2: Determine the highest round_num
      const maxRoundNum = rows[0].round_num;
      const maxRoundRows = rows.filter(row => row.round_num === maxRoundNum);
  
      // Step 3: Compare currentRoundNum with maxRoundNum
      if (currentRoundNum > maxRoundNum) {
        // Step 4: Insert new rows with the new round_num
        for (const row of maxRoundRows) {

          const playerLineupJson = typeof row.player_lineup === 'string' ? row.player_lineup : JSON.stringify(row.player_lineup);
          const formationJson = typeof row.formation === 'string' ? row.formation : JSON.stringify(row.formation);
  
        
          await db.query(
            'INSERT INTO teams (user_id, formation, player_lineup, total_budget, round_num, points) VALUES ($1, $2, $3, $4, $5, $6)',
            [row.user_id, formationJson, playerLineupJson, row.total_budget, currentRoundNum, 0]
          );
        }
        res.status(200).json({ message: 'Teams successfully inserted for the new round' });
      } else {
        res.status(200).json({ message: 'No update needed' });
      }
  
    } catch (error) {
      console.error('Error inserting teams:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const storeChangeStatus = async (req, res) => {
    try {
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      // Decode the token to get the userId using the secret from the config file
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId; // Assuming the token payload contains userId
  
      // Receive deleteCount, changeCount, and roundNum from the request body
      const { deleteCount, changeCount, roundNum } = req.body;
  
      // Update the teams table with the change count, delete count, and round number for the user
      await db.query(
        'UPDATE teams SET delete_count = $1, change_count = $2 WHERE user_id = $3 AND round_num = $4',
        [deleteCount, changeCount, userId, roundNum]
      );
  
      // Send a response indicating success
      res.status(200).json({
        message: 'Change status stored successfully',
      });
    } catch (error) {
      console.error('Error storing change status:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };
  

  export const fetchChangeStatus = async (req, res) => {
    try {
  
      const { currentRoundNum }= req.params;

      const roundNum = currentRoundNum
      
      // Extract the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      // Decode the token to get the userId using the secret from the config file
      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId; // Assuming the token payload contains userId
  
      // Query the teams table to get change_count and delete_count for the user and round_num
      const result = await db.query(
        'SELECT change_count, delete_count FROM teams WHERE user_id = $1 AND round_num = $2',
        [userId, roundNum]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No change status found for this user and round number.' });
      }
  
      const { change_count, delete_count } = result.rows[0];
  
      // Send the retrieved counts back in the response
      res.status(200).json({ change_count, delete_count });
    } catch (error) {
      console.error('Error fetching change status:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };
  