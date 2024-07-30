
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

export const privateLeaguePoints = async (req, res) => {
  const { leagueId } = req.body;
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

  try {
    // Query to get user IDs and league points based on leagueId
    const query = `
      SELECT user_id, league_points
      FROM private_prediction_members
      WHERE league_id = $1
    `;
    
    const results = await db.query(query, [leagueId]);
    const members = results.rows;

    // Extract user IDs and league points
    const userIds = members.map(member => member.user_id);
    const leaguePoints = members.map(member => member.league_points);

    // Query to get team names based on user IDs
    const userQuery = `
      SELECT user_id, team_name
      FROM users
      WHERE user_id = ANY($1::int[])
    `;
    
    const userResults = await db.query(userQuery, [userIds]);
    const users = userResults.rows;

    // Combine data into a single array of objects
    const combinedData = users.map(user => {
      const points = leaguePoints[userIds.indexOf(user.user_id)];
      return { userId: user.user_id, teamName: user.team_name, points };
    });

    // Return the data as JSON response
    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching league members:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// Define and export the function to store private predictions
export const storePrivatePredictions = async (req, res) => {
  const { leagueId, roundNum, gameId, team1Score, team2Score, privateLeagueAi } = req.body;
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

  const userId = decoded.userId;
  
  try {
    // Check if the league_id exists in private_prediction_leagues
    const leagueQuery = `
      SELECT * FROM private_prediction_leagues WHERE league_id = $1
    `;
    const leagueResult = await db.query(leagueQuery, [leagueId]);

    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'League not available' });
    }

    const countQuery = `
      SELECT COUNT(*) FROM private_predictions WHERE league_id = $1 AND round_num = $2
    `;
    const countResult = await db.query(countQuery, [leagueId, roundNum]);

    if (parseInt(countResult.rows[0].count, 10) >= 4) {
      return res.status(400).json({ error: 'Cannot save prediction: maximum number of predictions reached for this league and round.' });
    }

    const checkQuery = `
      SELECT * FROM private_predictions WHERE user_id = $1 AND game_id = $2 AND league_id = $3
    `;
    const checkResult = await db.query(checkQuery, [userId, gameId, leagueId]);

    let prediction;
    if (checkResult.rows.length > 0) {
      const updateQuery = `
        UPDATE private_predictions
        SET team_1_result = $1, team_2_result = $2, round_num = $3, private_league_ai = $4
        WHERE user_id = $5 AND game_id = $6 AND league_id = $7
        RETURNING *
      `;
      const updateResult = await db.query(updateQuery, [team1Score, team2Score, roundNum, privateLeagueAi, userId, gameId, leagueId]);
      prediction = updateResult.rows[0];
    } else {
      const insertQuery = `
        INSERT INTO private_predictions (user_id, game_id, league_id, round_num, team_1_result, team_2_result, private_league_ai)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `;
      const insertResult = await db.query(insertQuery, [userId, gameId, leagueId, roundNum, team1Score, team2Score, privateLeagueAi]);
      prediction = insertResult.rows[0];
    }

    res.status(200).json(prediction);
  } catch (error) {
    console.error('Error storing private prediction:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deletePrivatePredictions = async (req, res) => {
  const { gameId, leagueId } = req.params; // Get leagueId from params
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId;

    // First, check if the prediction exists
    const checkQuery = 'SELECT * FROM private_predictions WHERE game_id = $1 AND user_id = $2 AND league_id = $3';
    const checkResult = await db.query(checkQuery, [gameId, userId, leagueId]);

    if (checkResult.rowCount === 0) {
      return res.status(404).json({ message: 'Prediction not found.' });
    }

    // Proceed to delete the prediction
    const query = 'DELETE FROM private_predictions WHERE game_id = $1 AND user_id = $2 AND league_id = $3';
    await db.query(query, [gameId, userId, leagueId]);

    res.status(200).json({ message: 'Private prediction deleted successfully' });
  } catch (error) {
    console.error('Error deleting private prediction:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPrivateRoundPredictions = async (req, res) => {
  const { roundNum, leagueId } = req.params; // Get leagueId from params
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId;

    const query = `
      SELECT * FROM private_predictions 
      WHERE round_num = $1 AND user_id = $2 AND league_id = $3
    `;

    const results = await db.query(query, [roundNum, userId, leagueId]);

    const predictions = results.rows;

    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error fetching private round predictions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const checkIfOwner = async (req, res) => {
  const { leagueId } = req.params;
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

  const userId = decoded.userId;

  try {
    const query = `
      SELECT owner_id 
      FROM private_prediction_leagues 
      WHERE league_id = $1 AND owner_id = $2
    `;
    const result = await db.query(query, [leagueId, userId]);

    if (result.rows.length > 0) {
      res.status(200).json({ isOwner: true });
    } else {
      res.status(200).json({ isOwner: false });
    }
  } catch (error) {
    console.error('Error checking owner:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const storePrivatePredictionOption = async (req, res) => {
  const { leagueId, roundNum, predictionType } = req.body;

  try {
    const query = `
      INSERT INTO private_prediction_options (league_id, round_num, prediction_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (league_id, round_num) 
      DO UPDATE SET prediction_type = EXCLUDED.prediction_type,
                    updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await db.query(query, [leagueId, roundNum, predictionType]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error storing prediction option:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const fetchOptionType = async (req, res) => {
  const { leagueId, roundNum } = req.params;

  try {
    const query = `
      SELECT prediction_type 
      FROM private_prediction_options 
      WHERE league_id = $1 AND round_num = $2
    `;
    
    const result = await db.query(query, [leagueId, roundNum]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No prediction option found for this league and round.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching prediction option:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const storeChooseCard = async (req, res) => {
  const { gameId, leagueId, roundNum } = req.body;
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
      // Check the current count of starred cards for the given league and round
      const countQuery = `
          SELECT COUNT(*) FROM private_prediction_choose_cards 
          WHERE owner_id = $1 AND league_id = $2 AND round_num = $3;
      `;
      const countResult = await db.query(countQuery, [userId, leagueId, roundNum]);
      const currentCount = parseInt(countResult.rows[0].count, 10);

      // If there are already 4 or more cards, return an error
      if (currentCount >= 4) {
          return res.status(409).json({ message: 'Cannot star more than 4 cards for the same league and round.' });
      }

      const insertQuery = `
          INSERT INTO private_prediction_choose_cards (owner_id, game_id, league_id, round_num)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (owner_id, game_id, league_id, round_num) DO NOTHING
          RETURNING *;
      `;
      const insertResult = await db.query(insertQuery, [userId, gameId, leagueId, roundNum]);

      if (insertResult.rowCount > 0) {
          res.status(200).json({ message: 'Card choice saved successfully.', data: insertResult.rows[0] });
      } else {
          res.status(409).json({ message: 'Card choice already exists.' });
      }
  } catch (error) {
      console.error('Error saving card choice:', error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};

export const fetchChosenGames = async (req, res) => {
  const { leagueId, roundNum } = req.params;

  try {
    const query = `
      SELECT * FROM private_prediction_choose_cards
      WHERE league_id = $1 AND round_num = $2
    `;
    const results = await db.query(query, [leagueId, roundNum]);
    
    const chosenGames = results.rows;
    res.status(200).json(chosenGames);
  } catch (error) {
    console.error('Error fetching chosen games:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeChosenGame = async (req, res) => {
  const { gameId, leagueId, roundNum } = req.params;

  try {
    const query = `
      DELETE FROM private_prediction_choose_cards
      WHERE game_id = $1 AND league_id = $2 AND round_num = $3
    `;
    
    const result = await db.query(query, [gameId, leagueId, roundNum]);

    if (result.rowCount > 0) {
      return res.status(200).json({ message: 'Chosen game removed successfully.' });
    } else {
      return res.status(404).json({ error: 'Chosen game not found.' });
    }
  } catch (error) {
    console.error('Error removing chosen game:', error);
    return res.status(500).json({ error: 'An error occurred while removing the chosen game.' });
  }
};

export const saveSubmitStatus = async (req, res) => {
  const { leagueId, roundNum, isSubmitted, selectedPredictionOption } = req.body;
   
  try {
      // Update or insert the submission status
      const query = `
          INSERT INTO private_prediction_options (league_id, round_num, prediction_type, submitted)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (league_id, round_num)
          DO UPDATE SET prediction_type = $3, submitted = $4, updated_at = CURRENT_TIMESTAMP
          RETURNING *;
      `;

      const result = await db.query(query, [leagueId, roundNum, selectedPredictionOption, isSubmitted]);

      res.status(200).json({
          message: 'Submission status saved successfully',
          data: result.rows[0],
      });
  } catch (error) {
      console.error('Error saving submission status:', error);
      res.status(500).json({
          message: 'Error saving submission status',
          error: error.message,
      });
  }
};

export const fetchSubmitStatus = async (req, res) => {
  const { leagueId, roundNum } = req.params;
  
  try {
      const query = `
          SELECT submitted FROM private_prediction_options
          WHERE league_id = $1 AND round_num = $2;
      `;
      
      const result = await db.query(query, [leagueId, roundNum]);

      if (result.rows.length > 0) {
          res.status(200).json({ isSubmitted: result.rows[0].submitted });
      } else {
          res.status(404).json({ message: 'No submission status found.' });
      }
  } catch (error) {
      console.error('Error fetching submission status:', error);
      res.status(500).json({ message: 'Error fetching submission status', error: error.message });
  }
};

export const getAllPrivateRoundPredictions = async (req, res) => {
  const { roundNum, leagueId } = req.params; // Get leagueId from params
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId;

    const query = `
      SELECT * FROM private_predictions 
      WHERE round_num = $1 AND league_id = $2
    `;

    const results = await db.query(query, [roundNum, leagueId]);

    const predictions = results.rows;

    res.status(200).json(predictions);
  } catch (error) {
    console.error('Error fetching private round predictions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const fetchLeagueCode = async (req, res) => {
  const { leagueId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId;

    // Check ownership in private_prediction_leagues table
    const ownershipQuery = `
      SELECT owner_id 
      FROM private_prediction_leagues 
      WHERE league_id = $1 AND owner_id = $2
    `;
    const ownershipResult = await db.query(ownershipQuery, [leagueId, userId]);

    if (ownershipResult.rows.length === 0) {
      return res.status(200).json({ message: 'User is not the owner' });
    }

    // Fetch league code from private_prediction_leagues table
    const query = `
      SELECT league_code 
      FROM private_prediction_leagues 
      WHERE league_id = $1
    `;
    const result = await db.query(query, [leagueId]);

    if (result.rows.length > 0) {
      const leagueCode = result.rows[0].league_code;
      res.status(200).json({ leagueCode: leagueCode.toString() });
    } else {
      res.status(404).json({ message: 'League code not found' });
    }
  } catch (error) {
    console.error('Error fetching league code:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deletePrivatePredictionLeague = async (req, res) => {

  const { leagueId } = req.params;
  const token = req.headers.authorization?.split(' ')[1]; 
 
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId;
   
    // Check if the user is the owner of the league
    const leagueCheckQuery = `
      SELECT owner_id 
      FROM private_prediction_leagues 
      WHERE league_id = $1
    `;
    const leagueCheckResult = await db.query(leagueCheckQuery, [leagueId]);

    if (leagueCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }

    const leagueOwnerId = leagueCheckResult.rows[0].owner_id;

    if (leagueOwnerId !== userId) {
      return res.status(403).json({ error: 'User does not have permission to delete this league' });
    }

    // Begin transaction
    await db.query('BEGIN');

    // 1. Delete records from private_prediction_choose_cards table
    await db.query(
      'DELETE FROM private_prediction_choose_cards WHERE league_id = $1',
      [leagueId]
    );

    // 2. Delete records from private_prediction_options table
    await db.query(
      'DELETE FROM private_prediction_options WHERE league_id = $1',
      [leagueId]
    );

    // 3. Delete records from private_prediction_round_points table
    await db.query(
      'DELETE FROM private_prediction_round_points WHERE league_id = $1',
      [leagueId]
    );

    // 4. Delete records from private_predictions table
    await db.query(
      'DELETE FROM private_predictions WHERE league_id = $1',
      [leagueId]
    );

    // 5. Delete records from private_prediction_members table
    await db.query(
      'DELETE FROM private_prediction_members WHERE league_id = $1',
      [leagueId]
    );

    // 6. Delete the league from private_prediction_leagues table
    await db.query(
      'DELETE FROM private_prediction_leagues WHERE league_id = $1',
      [leagueId]
    );

    // Commit transaction
    await db.query('COMMIT');

    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    // Rollback transaction in case of error
    await db.query('ROLLBACK');
    console.error('Error deleting league:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const leavePredictionLeague = async (req, res) => {
  try {
      // Get leagueId from URL parameters
      const { leagueId } = req.params;

      const token = req.headers.authorization?.split(' ')[1];
  
      if (!token) {
        return res.status(401).json({ error: 'Token not provided' });
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const userId = decoded.userId;
      
      // Delete rows from private_prediction_members table
      await db.query('DELETE FROM private_prediction_members WHERE user_id = $1 AND league_id = $2', [userId, leagueId]);

      // Delete rows from private_prediction_round_points table
      await db.query('DELETE FROM private_prediction_round_points WHERE user_id = $1 AND league_id = $2', [userId, leagueId]);

      // Delete rows from private_predictions table
      await db.query('DELETE FROM private_predictions WHERE user_id = $1 AND league_id = $2', [userId, leagueId]);

      return res.status(200).json({ message: 'Successfully left the prediction league.' });
  } catch (error) {
      console.error('Error leaving prediction league:', error);
      return res.status(500).json({ message: 'An error occurred while leaving the prediction league.' });
  }
};