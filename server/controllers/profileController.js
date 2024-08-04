import db from '../config/db.js'; // Adjust the path to your database config
import config from '../config/config.js'; // Adjust the path to your configuration
import jwt from 'jsonwebtoken';

export const fetchUserProfile = async (req, res) => {
  try {
    // Extract the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId; // Assuming the token payload contains userId

    // Query the database for the user's profile
    const result = await db.query('SELECT team_name, phone_number, address FROM users WHERE user_id = $1', [userId]);

    // Check if the user was found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user's profile data
    const userProfile = result.rows[0];
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateUserProfile = async (req, res) => {
    try {
      // Extract the token from the authorization header
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }
  
      // Verify and decode the token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      const userId = decoded.userId; // Assuming the token payload contains userId
  
      // Extract the data from the request body
      const { phone_number, address } = req.body;
  
      if (!phone_number && !address) {
        return res.status(400).json({ error: 'No fields to update' });
      }
  
      // Update the user's profile in the database
      const updateFields = [];
      const values = [];
      
      if (phone_number) {
        updateFields.push(`phone_number = $${updateFields.length + 1}`);
        values.push(phone_number);
      }
  
      if (address) {
        updateFields.push(`address = $${updateFields.length + 1}`);
        values.push(address);
      }
  
      values.push(userId);
  
      const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = $${values.length}`;
  
      await db.query(updateQuery, values);
  
      // Send success response
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  export const deleteUserProfile = async (req, res) => {
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
        // Start transaction
        await db.query('BEGIN');

        // Step 1: Delete entries from tables where user_id is referenced
        await db.query('DELETE FROM private_prediction_choose_cards WHERE owner_id = $1', [userId]);
        await db.query('DELETE FROM private_prediction_members WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM global_prediction_members WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM private_predictions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM global_predictions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM fantasy_league_members WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM fantasy_points WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM teams WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM private_prediction_round_points WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM global_prediction_round_points WHERE user_id = $1', [userId]);

        // Step 2: Get league_ids where the user is the owner
        const leagueIdsResult = await db.query('SELECT league_id FROM fantasy_private_leagues WHERE owner_id = $1', [userId]);
        const privatePredictionLeagueIdsResult = await db.query('SELECT league_id FROM private_prediction_leagues WHERE owner_id = $1', [userId]);

        // Delete private_prediction_options associated with the leagues
        const leagueIds = leagueIdsResult.rows.map(row => row.league_id);
        const privatePredictionLeagueIds = privatePredictionLeagueIdsResult.rows.map(row => row.league_id);
        const allLeagueIds = [...leagueIds, ...privatePredictionLeagueIds];

        if (allLeagueIds.length > 0) {
            await db.query('DELETE FROM private_prediction_options WHERE league_id = ANY($1)', [allLeagueIds]);
        }

        // Step 3: Delete leagues owned by the user
        await db.query('DELETE FROM fantasy_private_leagues WHERE owner_id = $1', [userId]);
        await db.query('DELETE FROM private_prediction_leagues WHERE owner_id = $1', [userId]);

        // Step 4: Delete the user
        await db.query('DELETE FROM users WHERE user_id = $1', [userId]);

        // Commit transaction
        await db.query('COMMIT');

        res.status(200).json({ message: 'User profile and related data deleted successfully' });

    } catch (error) {
        // Rollback transaction in case of error
        await db.query('ROLLBACK');
        console.error('Error deleting user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};