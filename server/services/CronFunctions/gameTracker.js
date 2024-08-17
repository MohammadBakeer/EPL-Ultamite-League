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
            minute = CASE WHEN $3 IN (2, 3, 4) THEN $4 ELSE minute END,
            live = CASE WHEN $3 IN (2, 3, 4) THEN true ELSE live END,
            finished = CASE WHEN $3 = 5 THEN true ELSE finished END
        WHERE game_id = $5;
      `;

      await db.query(updateQuery, [
        team1Result,
        team2Result,
        stateId,
        minuteOfGame,
        fixtureId,
      ]);

      console.log(`Game with fixtureId ${fixtureId} updated successfully.`);
    } else {
      console.log(`Game with fixtureId ${fixtureId} not found.`);
    }

    // Commit transaction
    await db.query('COMMIT');
  } catch (error) {
    // Rollback transaction in case of an error
    await db.query('ROLLBACK');
    console.error('Error inserting/updating live game data:', error.message);
  }
};

// Function to fetch live game data and process it
export const liveGameTracker = async () => {
  const url = `https://api.sportmonks.com/v3/football/livescores/latest?api_token=${process.env.API_TOKEN}&include=scores`;

  try {
    // Fetch the data from the API
    const response = await axios.get(url);
    const data = response.data;

    // Extract the current timestamp from the API response
    const currentTimestamp = data.subscription[0].meta.current_timestamp; 

    // Extract all fixtures
    const fixtures = data.data; // This is an array of fixtures

    // Loop through each fixture
    for (const fixture of fixtures) {
      const fixtureId = fixture.id;
      const stateId = fixture.state_id;

      // Calculate the minute of the game
      const startingAtTimestamp = fixture.starting_at_timestamp;
      const elapsedSeconds = currentTimestamp - startingAtTimestamp;
      const minuteOfGame = Math.floor(elapsedSeconds / 60) - 1;

      // Find the relevant score objects for home and away teams
      const team1Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "home");
      const team2Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "away");

      const team1Result = team1Score ? team1Score.score.goals : 0; // Goals for home team
      const team2Result = team2Score ? team2Score.score.goals : 0; // Goals for away team

      // Retrieve team names from the fixture name (e.g., "Newcastle United vs Southampton")
      const [team1, team2] = fixture.name.split(' vs ');

      // Log the extracted details along with minuteOfGame
      console.log({
        fixtureId,
        team1,
        team2,
        team1Result,
        team2Result,
        minuteOfGame,
        stateId
      });

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
