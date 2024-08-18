import axios from 'axios';
import dotenv from 'dotenv';
import db from '../../config/db.js'; // Adjust path as needed

dotenv.config();

// Function to insert or update live game data in the database
const insertLiveGame = async (gameData) => {
  const { fixtureId, team1Result, team2Result, minuteOfGame, stateId } = gameData;

  try {
    // Begin transaction
    await db.query('BEGIN');

    // Check if the fixture already exists in the games table
    const result = await db.query(
      'SELECT * FROM games WHERE game_id = $1',
      [fixtureId]
    );

    if (result.rows.length > 0) {
      // Fixture exists, update the relevant fields
      const updateQuery = `
        UPDATE games
        SET team_1_result = $1,
            team_2_result = $2,
            minute = $3,
            live = CASE 
              WHEN $4 IN (2, 3, 22) THEN true 
              WHEN $4 = 5 THEN false
              ELSE live 
            END,
            finished = CASE 
              WHEN $4 = 5 THEN true 
              ELSE finished 
            END
        WHERE game_id = $5;
      `;

      await db.query(updateQuery, [
        team1Result,
        team2Result,
        minuteOfGame,
        stateId,
        fixtureId,
      ]);

    } 

    // Commit transaction
    await db.query('COMMIT');
  } catch (error) {
    // Rollback transaction in case of an error
    await db.query('ROLLBACK');
    console.error('Error inserting/updating live game data:', error.message);
  }
};

// Function to fetch fixture details including periods
const fetchFixtureDetails = async (fixtureId) => {
  const url = `https://api.sportmonks.com/v3/football/fixtures/${fixtureId}?api_token=${process.env.API_TOKEN}&include=periods`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fixture details for fixtureId ${fixtureId}:`, error.message);
    return null;
  }
};

// Function to fetch live game data and process it
export const liveGameTracker = async () => {
  const url = `https://api.sportmonks.com/v3/football/livescores/latest?api_token=${process.env.API_TOKEN}&include=scores`;

  try {
    // Fetch the data from the API
    const response = await axios.get(url);
    const data = response.data;

    // Check if fixtures is an array and has data
    const fixtures = data.data;
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
    
      return;
    }

    // Loop through each fixture
    for (const fixture of fixtures) {
      const fixtureId = fixture.id;
      const stateId = fixture.state_id;

      // Fetch detailed fixture data including periods
      const fixtureDetails = await fetchFixtureDetails(fixtureId);

      if (!fixtureDetails) continue;

      const periods = fixtureDetails.data.periods;

      // Get the most recent period's minutes
      let minuteOfGame = 0;
      if (periods && periods.length > 0) {
        const latestPeriod = periods.reduce((latest, period) =>
          period.started > latest.started ? period : latest
        );
        minuteOfGame = latestPeriod.minutes;
      }

      // Find the relevant score objects for home and away teams
      const team1Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "home");
      const team2Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "away");

      const team1Result = team1Score ? team1Score.score.goals : 0; // Goals for home team
      const team2Result = team2Score ? team2Score.score.goals : 0; // Goals for away team


      // Prepare the data object for insertion/updating
      const gameData = {
        fixtureId,
        team1Result,
        team2Result,
        minuteOfGame,
        stateId,
      };

      // Insert or update the game data
      await insertLiveGame(gameData);
    }
  } catch (error) {
    console.error('Error fetching live game data:', error.message);
  }
};