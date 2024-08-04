
import { decodeJWT } from '../config/jwtUtils.js';
import db from '../config/db.js';
import config from '../config/config.js';
import jwt from 'jsonwebtoken';

export const fetchGlobalPoints = async (req, res) => {
  try {
    // Fetch team names from the users table
    const teamNameQuery = await db.query('SELECT user_id, team_name FROM users');
    const teamNameData = teamNameQuery.rows;

    // Fetch points from the fantasy_points table
    const pointsQuery = await db.query('SELECT user_id, points FROM fantasy_points');
    const pointsData = pointsQuery.rows;

    // Combine data from both queries based on user_id
    const allUsersLeaderboardData = teamNameData.map(user => {
      const points = pointsData.find(stats => stats.user_id === user.user_id);
      return {
        userId: user.user_id,
        teamName: user.team_name,
        totalBudget: 0, // If you need total budget, you can fetch it from another source or include another query
        points: points ? points.points : 0, // Set points to 0 if not found
      };
    });
    
    res.json(allUsersLeaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard data for all users:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const joinLeague = async (req, res) => {
  try {
    const { userId, leagueCode } = req.body;
   
    // Log leagueCode to verify its value

    // Query to fetch league_id based on league_code
    const leagueResult = await db.query('SELECT * FROM private_prediction_leagues WHERE league_code = $1', [leagueCode]);

    // Check if leagueResult.rows is empty
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid league code' });
    }

    // Extract league_id from the first row of leagueResult
    const leagueId = leagueResult.rows[0].league_id;

    // Check if the user already belongs to this league
    const userResult = await db.query('SELECT * FROM private_prediction_members WHERE user_id = $1 AND league_id = $2', [userId, leagueId]);

    if (userResult.rows.length > 0) {
      return res.status(404).json({ error: 'User already in league' });
    }

    // Insert user into league_members table
    await db.query('INSERT INTO private_prediction_members (user_id, league_id) VALUES ($1, $2)', [userId, leagueId]);

    // Respond with success message
    res.status(200).json({ message: 'Successfully joined league' });
  } catch (error) {
    console.error('Error joining the league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const createLeague = async (req, res) => {
  try {
    const { leagueName, ownerId, leagueBadge, roundNum } = req.body;

   
    // Perform database insert operation for private_league table
    const leagueResult = await db.query(
      'INSERT INTO private_prediction_leagues (league_name, owner_id, league_badge) VALUES ($1, $2, $3) RETURNING league_id, league_code',
      [leagueName, ownerId, leagueBadge]
    );

    // Get the newly created league_id
    const { league_id, league_code } = leagueResult.rows[0];

    // Insert new record for user
    await db.query(
      'INSERT INTO private_prediction_members (user_id, league_id) VALUES ($1, $2)',
      [ownerId, league_id]
    );

    await db.query(
      'INSERT INTO private_prediction_options (league_id, round_num, prediction_type) VALUES ($1, $2, $3)',
      [league_id, roundNum, 'allow_any'] 
    );

    // Send a response indicating success
    res.status(201).json({
      message: 'League created successfully',
      league: { league_id, league_code, league_name: leagueName, owner_id: ownerId }
    });
  } catch (error) {
    console.error('Error during league creation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPrivateTeamLeagues = async (req, res) => {
  try {

    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = decodeJWT(token);
    const userId = decodedToken.userId;
   
    // Query to get the league_id(s) for the user from league_members table
    const leagueIdsQuery = `
      SELECT league_id 
      FROM private_prediction_members 
      WHERE user_id = $1
    `;
    const leagueIdsResult = await db.query(leagueIdsQuery, [userId]);
    const leagueIds = leagueIdsResult.rows.map(row => row.league_id);
   
    if (leagueIds.length === 0) {
      // No leagues found for the user
      return res.status(200).json({ message: 'No leagues found for this user.', leagues: [] });
    }

    // Query to get the league details from private_leagues table
    const leaguesQuery = `
      SELECT league_id, league_name, league_badge
      FROM private_prediction_leagues
      WHERE league_id = ANY($1::int[])
    `;

    const leaguesResult = await db.query(leaguesQuery, [leagueIds]);

    const leagueData = leaguesResult.rows.map(row => ({
      leagueId: row.league_id,
      leagues: [row.league_name],
      leagueBadge: row.league_badge
    }));

    res.status(200).json(leagueData);
  } catch (error) {
    console.error('Error fetching the league data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createFantasyLeague = async (req, res) => {
  try {
    const { leagueName, ownerId, startRound, leagueBadge } = req.body; 

    // Insert into fantasy_private_leagues table
    const leagueResult = await db.query(
      'INSERT INTO fantasy_private_leagues (league_name, owner_id, start_round, league_badge) VALUES ($1, $2, $3, $4) RETURNING league_id, league_code',
      [leagueName, ownerId, startRound, leagueBadge] // Add leagueBadge to the query
    );

    // Get the newly created league_id and league_code
    const { league_id, league_code } = leagueResult.rows[0];

    // Insert the owner into fantasy_league_members table
    await db.query(
      'INSERT INTO fantasy_league_members (user_id, league_id) VALUES ($1, $2)',
      [ownerId, league_id]
    );

    // Send a response with the newly created league details
    res.status(201).json({
      leagueId: league_id,
      leagues: leagueName,
      leagueCode: league_code,
      startRound: startRound,
      leagueBadge: leagueBadge, // Return the leagueBadge
      message: 'Fantasy league created successfully'
    });
  } catch (error) {
    console.error('Error during fantasy league creation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const joinFantasyLeague = async (req, res) => {
  try {

    const { userId, leagueCode } = req.body;
 
    // Step 1: Select league based on leagueCode
    const leagueResult = await db.query(
      'SELECT league_id FROM fantasy_private_leagues WHERE league_code = $1',
      [leagueCode]
    );

    // Step 2: Check if league exists
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid league code' });
    }

    // Extract league_id from the result
    const leagueId = leagueResult.rows[0].league_id;

    // Step 3: Check if the user is already a member of this league
    const userResult = await db.query(
      'SELECT * FROM fantasy_league_members WHERE user_id = $1 AND league_id = $2',
      [userId, leagueId]
    );

    if (userResult.rows.length > 0) {
      return res.status(400).json({ error: 'User already in league' });
    }

    // Step 4: Insert the user into fantasy_league_members table
    await db.query(
      'INSERT INTO fantasy_league_members (user_id, league_id) VALUES ($1, $2)',
      [userId, leagueId]
    );


    const leagueDataResult = await db.query(
      'SELECT league_id, league_name, league_badge FROM fantasy_private_leagues WHERE league_id = $1',
      [leagueId]
    );

    // Check if league data is found
    if (leagueDataResult.rows.length === 0) {
      return res.status(404).json({ error: 'League data not found' });
    }

    const row = leagueDataResult.rows[0];

    // Respond with success message and formatted league data
    res.status(200).json({
      message: 'Successfully joined league',
      leagueId: row.league_id,
      leagues: [row.league_name],
      leagueBadge: row.league_badge,
    });
    
  } catch (error) {
    console.error('Error joining the league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFantasyLeagues = async (req, res) => {
  try {
    // Decode the JWT token to get user ID
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = decodeJWT(token);
    const userId = decodedToken.userId;

    // Step 1: Select all league_ids from fantasy_league_members where user_id matches
    const leagueIdsQuery = `
      SELECT league_id 
      FROM fantasy_league_members 
      WHERE user_id = $1
    `;
    const leagueIdsResult = await db.query(leagueIdsQuery, [userId]);
    const leagueIds = leagueIdsResult.rows.map(row => row.league_id);

    // Step 2: Check if the user is part of any leagues
    if (leagueIds.length === 0) {
      return res.status(200).json({ message: 'No leagues found for this user.', leagues: [] });
    }

    // Step 3: Select league_id, league_name, and league_badge from fantasy_private_leagues
    const leaguesQuery = `
      SELECT league_id, league_name, league_badge 
      FROM fantasy_private_leagues 
      WHERE league_id = ANY($1::int[])
    `;
    const leaguesResult = await db.query(leaguesQuery, [leagueIds]);

    // Step 4: Map the result to the desired format
    const leagueData = leaguesResult.rows.map(row => ({
      leagueId: row.league_id,
      leagues: [row.league_name],
      leagueBadge: row.league_badge,
    }));

    // Return the league data
    res.status(200).json(leagueData);
  } catch (error) {
    console.error('Error fetching fantasy leagues:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const fetchPrivateFantasyLeague = async (req, res) => {
  try {
    // Extract the leagueId from the request parameters
    const { leagueId } = req.params;
    
    // Step 1: Get all user_ids from the fantasy_league_members table where league_id matches
    const memberQuery = `
      SELECT user_id 
      FROM fantasy_league_members 
      WHERE league_id = $1
    `;
    const memberResult = await db.query(memberQuery, [leagueId]);
    const userIds = memberResult.rows.map(row => row.user_id);

    // Step 2: Get league details from the fantasy_private_leagues table
    const leagueDetailsQuery = `
      SELECT league_name, league_badge, start_round 
      FROM fantasy_private_leagues 
      WHERE league_id = $1
    `;
    const leagueDetailsResult = await db.query(leagueDetailsQuery, [leagueId]);
    const leagueDetails = leagueDetailsResult.rows[0];

    // Check if league details were found
    if (!leagueDetails) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Organize the response data
    const responseData = {
      leagueId: leagueId,
      leagueName: leagueDetails.league_name,
      leagueBadge: leagueDetails.league_badge,
      startRound: leagueDetails.start_round,
      members: userIds,
    };

    // Return the response data
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching private fantasy league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const fetchMembersTeams = async (req, res) => {
  try {
    const { memberIds, startRound } = req.body;

    // Array to store the final results
    const results = [];

    // For each user_id in memberIds, fetch team_name and points
    for (const userId of memberIds) {
      // Fetch team_name from users table
      const teamNameQuery = `
        SELECT team_name 
        FROM users 
        WHERE user_id = $1
      `;
      const teamNameResult = await db.query(teamNameQuery, [userId]);
      const teamName = teamNameResult.rows[0]?.team_name || 'Unknown Team';

      // Fetch all points from startRound onwards from the teams table
      const pointsQuery = `
        SELECT points 
        FROM teams 
        WHERE user_id = $1 AND round_num >= $2
      `;
      const pointsResult = await db.query(pointsQuery, [userId, startRound]);

      // Sum up the points
      const totalPoints = pointsResult.rows.reduce((sum, row) => sum + row.points, 0);

      // Push the organized object into results array
      results.push({
        user_id: userId,
        points: totalPoints,
        team_name: teamName,
      });
    }

    // Respond with the organized results
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching members teams:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteFantasyLeague = async (req, res) => {
  try {
    // Extract the leagueId from the request parameters
    const { leagueId } = req.params;

    // Step 1: Delete all rows in the fantasy_league_members table with the specified league_id
    await db.query('DELETE FROM fantasy_league_members WHERE league_id = $1', [leagueId]);

    // Step 2: Delete the league from the fantasy_private_leagues table
    const deleteResult = await db.query('DELETE FROM fantasy_private_leagues WHERE league_id = $1', [leagueId]);

    // Check if any row was deleted
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'League deleted successfully' });
  } catch (error) {
    console.error('Error deleting fantasy league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const checkIfFantasyOwner = async (req, res) => {
  try {
    // Extract the leagueId from the request parameters
    const { leagueId } = req.params;

    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    // Decode the token to extract user ID
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId; // Assuming the token payload contains userId

    // Query to retrieve the owner_id based on the league_id
    const ownerQuery = await db.query(
      'SELECT owner_id FROM fantasy_private_leagues WHERE league_id = $1',
      [leagueId]
    );

    // Check if any owner was found
    if (ownerQuery.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Extract the owner_id from the result
    const ownerId = ownerQuery.rows[0].owner_id;

    // Check if the ownerId matches the userId
    const isOwner = ownerId === userId;

    let leagueCode = 0;

    if (isOwner) {
      // If the user is the owner, get the league_code
      const leagueCodeQuery = await db.query(
        'SELECT league_code FROM fantasy_private_leagues WHERE league_id = $1',
        [leagueId]
      );

      if (leagueCodeQuery.rows.length > 0) {
        leagueCode = leagueCodeQuery.rows[0].league_code;
      }
    }

    // Respond with the result and league code if owner
    res.status(200).json({ isOwner, leagueCode });
  } catch (error) {
    console.error('Error checking fantasy league owner:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const leaveFantasyLeague = async (req, res) => {
  try {
    // Extract the leagueId from the request parameters
    const { leagueId } = req.params;

    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    // Decode the token to extract user ID
    const decoded = jwt.verify(token, config.jwtSecret);
    const userId = decoded.userId; // Assuming the token payload contains userId

    // Step 1: Delete the user from the fantasy_league_members table
    const deleteResult = await db.query(
      'DELETE FROM fantasy_league_members WHERE user_id = $1 AND league_id = $2',
      [userId, leagueId]
    );

    // Check if any row was deleted
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found in the league' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Successfully left the league' });
  } catch (error) {
    console.error('Error leaving fantasy league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
