
import db from '../config/db.js'; // Assuming db connection import


export const getLeaderboardDataForAllUsers = async (req, res) => {
  try {
    // Fetch team names from the users table
    const teamNameQuery = await db.query('SELECT user_id, team_name FROM users');
    const teamNameData = teamNameQuery.rows;

    // Fetch total budget and total price from the teams table
    const teamStatsQuery = await db.query('SELECT user_id, total_budget, total_points FROM teams');
    const teamStatsData = teamStatsQuery.rows;

    // Combine data from both queries based on user_id
    const allUsersLeaderboardData = teamNameData.map(user => {
      const teamStats = teamStatsData.find(stats => stats.user_id === user.user_id);
      return {
        userId: user.user_id,
        teamName: user.team_name,
        totalBudget: teamStats ? teamStats.total_budget : 0,
        totalPrice: teamStats ? teamStats.total_points : 0,
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
    const leagueResult = await db.query('SELECT * FROM private_leagues WHERE league_code = $1', [leagueCode]);

    // Check if leagueResult.rows is empty
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid league code' });
    }

    // Extract league_id from the first row of leagueResult
    const leagueId = leagueResult.rows[0].league_id;

    // Log the extracted leagueId
    console.log('League ID:', leagueId);

    // Check if the user already belongs to this league
    const userResult = await db.query('SELECT * FROM league_members WHERE user_id = $1 AND league_id = $2', [userId, leagueId]);

    if (userResult.rows.length > 0) {
      return res.status(404).json({ error: 'User already in league' });
    }

    // Insert user into league_members table
    await db.query('INSERT INTO league_members (user_id, league_id) VALUES ($1, $2)', [userId, leagueId]);

    // Respond with success message
    res.status(200).json({ message: 'Successfully joined league' });
  } catch (error) {
    console.error('Error joining the league:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const createLeague = async (req, res) => {
  try {
    const { leagueName, ownerId, startRound } = req.body;
   
    // Perform database insert operation for private_league table
    const leagueResult = await db.query(
      'INSERT INTO private_leagues (league_name, owner_id, start_round) VALUES ($1, $2, $3) RETURNING league_id, league_code',
      [leagueName, ownerId, startRound]
    );

    // Get the newly created league_id
    const { league_id, league_code } = leagueResult.rows[0];

    // Insert new record for user
    await db.query(
      'INSERT INTO league_members (user_id, league_id) VALUES ($1, $2)',
      [ownerId, league_id]
    );

    // Send a response indicating success
    res.status(201).json({
      message: 'League created successfully',
      league: { league_id, league_code, league_name: leagueName, owner_id: ownerId, start_round: startRound }
    });
  } catch (error) {
    console.error('Error during league creation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
