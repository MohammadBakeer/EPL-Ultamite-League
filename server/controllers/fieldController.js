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
      
      const { formation, totalBudget, totalPoints, playerLineup } = req.body;
  
      // Convert playerLineup to a JSON string before storing in the database
      const playerLineupString = JSON.stringify(JSON.parse(playerLineup));
  
      // Perform database update operation for teams table
      await db.query(
        'UPDATE teams SET formation = $1, player_lineup = $2, total_budget = $3, total_points = $4 WHERE user_id = $5',
        [JSON.stringify(formation), playerLineupString, totalBudget, totalPoints, userId]
      );
  
      // Send a response indicating success
      res.status(200).json({
        message: 'Team state updated successfully',
        teamState: { user_id: userId, formation, player_lineup: playerLineup, total_budget: totalBudget, total_points: totalPoints },
      });
    } catch (error) {
      console.error('Error updating team state:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };
    
  export const getUserLineup = async (req, res) => {
    try {
        const { userId } = req.body;
  
      // Perform the database query to get user lineup information
      const result = await db.query('SELECT formation, player_lineup, total_budget, total_points FROM teams WHERE user_id = $1', [userId]);
  
      if (result.rows.length > 0) {
        const { formation, player_lineup, total_budget, total_points } = result.rows[0];
  
        res.json({ formation, playerLineup: JSON.stringify(player_lineup), totalBudget: total_budget, totalPoints: total_points });
      } else {
        res.status(404).json({ error: 'User lineup not found' });
      }
    } catch (error) {
      console.error('Error fetching user lineup:', error.message);
      res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
  };

 
