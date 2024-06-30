
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

