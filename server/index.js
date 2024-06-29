const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios'); // Declare axios here
const cron = require('node-cron');

// Import the database connection pool from db.js
const db = require('./db.js');

app.use(cors());
app.use(express.json());

// Player stats from the API
async function fetchPlayerStats() {
  const playerResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
  const playerData = playerResponse.data.elements;

  const playerStats = {};

  playerData.forEach(player => {
    const playerName = `${player.first_name} ${player.second_name}`;
    
    playerStats[playerName] = {
      goals_scored: player.goals_scored,
      assists: player.assists,
      clean_sheets: player.clean_sheets,
      goals_conceded: player.goals_conceded,
      penalties_saved: player.penalties_saved,
      yellow_cards: player.yellow_cards,
      red_cards: player.red_cards,
      saves: player.saves,
      minutes: player.minutes
    };
  });

  return playerStats;
}

// Function to update team data with the latest player stats
async function updateTeamData(playerStats) {
  const teamsResult = await db.query('SELECT * FROM teams');
  const teams = teamsResult.rows; // Use .rows to get the actual data from the query result

  for (const team of teams) {
      let totalPoints = 0; 

      team.player_lineup.forEach(player => {
          const playerName = `${player.firstName} ${player.lastName}`;

          if (playerName in playerStats) {
              const stats = playerStats[playerName];
              player.goalsScored = stats.goals_scored;
              player.assists = stats.assists;
              player.cleanSheets = stats.clean_sheets;
              player.goalsConceded = stats.goals_conceded;
              player.penaltiesSaved = stats.penalties_saved;
              player.yellowCards = stats.yellow_cards;
              player.redCards = stats.red_cards;
              player.saves = stats.saves;
              player.minutes = stats.minutes;

              let points = 0;
              let price = 0; // Assuming a default value for price

              // Calculate points based on player's position
              switch (player.position) {
                  case 'FWD':
                      points += player.goalsScored * 14;
                      points += player.assists * 10;
                      points += player.cleanSheets * 4;
                      points += player.goalsConceded * -1;
                      points += player.yellowCards * -5;
                      points += player.redCards * -15;
                      points += Math.floor(player.minutes / 90) * 10;
                      break;
                  case 'MID':
                      points += player.goalsScored * 18;
                      points += player.assists * 10;
                      points += player.cleanSheets * 6;
                      points += player.goalsConceded * -3;
                      points += player.yellowCards * -2;
                      points += player.redCards * -8;
                      points += Math.floor(player.minutes / 90) * 10;
                      break;
                  case 'DEF':
                      points += player.goalsScored * 20;
                      points += player.assists * 15;
                      points += player.cleanSheets * 18;
                      points += player.goalsConceded * -5;
                      points += player.yellowCards * -2;
                      points += player.redCards * -8;
                      points += Math.floor(player.minutes / 90) * 15;
                      break;
                  case 'GK':
                      points += player.cleanSheets * 25;
                      points += player.goalsConceded * -10;
                      points += player.penaltiesSaved * 50;
                      points += player.saves * 4;
                      points += Math.floor(player.minutes / 90) * 10;
                      break;
                  default:
                      break;
              }

              let additionalPrice = Math.floor(points / 50) * 25;
              price += additionalPrice;
              player.points = points;
              player.price = price;

              totalPoints += points;
          }
      });

      // Update total_points column in the database for this team
      const playerLineupJson = JSON.stringify(team.player_lineup);
      await db.query('UPDATE teams SET player_lineup = $1, total_points = $2 WHERE team_id = $3', [playerLineupJson, totalPoints, team.team_id]);
  }
}

// Main function to execute the data synchronization
async function synchronizeData() {
  try {
    console.log('Starting data synchronization...');

    // Step 1: Fetch latest player data from the API
    const playerStats = await fetchPlayerStats();

    // Step 2: Retrieve and update team data with the latest player stats
    await updateTeamData(playerStats);

    console.log('Data synchronization complete.');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  }
}

// Schedule the synchronization task
cron.schedule('*/10 * * * * *', synchronizeData);


app.get('/teams/api', async (req,res) => {
  try {
    const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/')
    const data = response.data

    const teams = data.teams

    const name = teams.map(team => team.name)
    const id = teams.map(team => team.id)

    const team = name.map((club, index) => ({
      club,
      id: id[index]
    }))

    res.json({ team });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/playerNames/api', async (req, res) => {
  try {
    // Make a single API call to get all team information
    const teamResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    const teamData = teamResponse.data;
    const elements = teamData.elements;

    // Create an array of player details
    const playerDetails = elements.map(player => ({
        firstName: player.first_name,
        lastName: player.second_name,
        teamId: player.team,
        positionId: player.element_type, 
        goalsScored: player.goals_scored,
        assists: player.assists,
        cleanSheets: player.clean_sheets,
        goalsConceded: player.goals_conceded,
        penaltiesSaved: player.penalties_saved,
        yellowCards: player.yellow_cards,
        redCards: player.red_cards,
        saves: player.saves,
        minutes: player.minutes,
    
    }));

    res.json({ playerNames: playerDetails });
  } catch (error) {
    console.error('Error fetching data from the Fantasy Premier League API:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Inside your signup route
app.post('/signup', async (req, res) => {
  try {
    const { email, password, teamName } = req.body;

    // Perform database insert operation for users table
    const userResult = await db.query('INSERT INTO users (email, password, team_name) VALUES ($1, $2, $3) RETURNING user_id', [email, password, teamName]);

    const userId = userResult.rows[0].user_id;

    // Perform database insert operation for teams table
    await db.query('INSERT INTO teams (user_id, formation, player_lineup, total_budget, total_points) VALUES ($1, $2, $3, $4, $5)', [userId, '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', '[]', 1000, 0]);


    // Send a response indicating success
    res.status(201).json({ message: 'User signed up successfully', user: { user_id: userId, email, team_name: teamName } });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/checkEmail/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Check if the email exists in the database
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    // Send a response indicating whether the email exists
    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking email existence:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Perform the database query to check if the email and password match
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    // Check if there is a match
    const match = result.rows.length > 0;

    // If there is a match, send the user_id in the response
    if (match) {
      const user_id = result.rows[0].user_id;
      res.json({ match, user_id });
    } else {
      res.json({ match });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Inside your team state update route
// Inside your team state update route
app.put('/updateLineup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { formation, totalBudget, totalPoints, playerLineup } = req.body;
    
    // Convert playerLineup to a JSON string before storing in the database
    const parsedPlayerLineup = JSON.parse(playerLineup);
    const playerLineupString = JSON.stringify(parsedPlayerLineup);

    // Perform database update operation for teams table
    await db.query('UPDATE teams SET formation = $1, player_lineup = $2, total_budget = $3, total_points = $4 WHERE user_id = $5',
      [JSON.stringify(formation), playerLineupString, totalBudget, totalPoints, userId]);

    // Send a response indicating success
    res.status(200).json({
      message: 'Team state updated successfully',
      teamState: { user_id: userId, formation, player_lineup: playerLineup, total_budget: totalBudget, total_points: totalPoints },
    });
  } catch (error) {
    console.error('Error updating team state:', error.message);
    res.status(500).json({ error: `Internal Server Error: ${error.message}` });
  }
});



app.get('/getUserLineup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

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
});

// Add this endpoint to your Express server
app.get('/getTeamName/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Perform the database query to get the team name based on the user ID
    const result = await db.query('SELECT team_name FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length > 0) {
      const teamName = result.rows[0].team_name;
      res.json({ teamName });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching team name:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getLeaderboardDataForAllUsers', async (req, res) => {
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
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});