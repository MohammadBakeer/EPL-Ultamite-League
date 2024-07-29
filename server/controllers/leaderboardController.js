
import db from '../config/db.js'; // Assuming db connection import
import { decodeJWT } from '../config/jwtUtils.js';

export const getLeaderboardDataForAllUsers = async (req, res) => {
  try {

    // Fetch team names from the users table
    const teamNameQuery = await db.query('SELECT user_id, team_name FROM users');
    const teamNameData = teamNameQuery.rows;

    // Fetch total budget and total price from the teams table
    const teamStatsQuery = await db.query('SELECT user_id, total_budget, points FROM teams');
    const teamStatsData = teamStatsQuery.rows;

    // Combine data from both queries based on user_id
    const allUsersLeaderboardData = teamNameData.map(user => {
      const teamStats = teamStatsData.find(stats => stats.user_id === user.user_id);
      return {
        userId: user.user_id,
        teamName: user.team_name,
        totalBudget: teamStats ? teamStats.total_budget : 0,
   
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
