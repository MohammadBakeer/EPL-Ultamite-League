import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


// Example mapping of participant_id to team names
const teamNameMap = {
  11: 'Fulham', // away team
  14: 'Manchester United' // home team
};

export const liveGameTracker = async () => {
  const url = `https://api.sportmonks.com/v3/football/livescores/latest?api_token=${process.env.API_TOKEN}&include=scores`;

  try {
    // Fetch the data from the API
    const response = await axios.get(url);
    const data = response.data;

    // Extract the fixture data
    const fixture = data.data[0]; // Assuming there's at least one game in the array

    const fixtureId = fixture.id;
    const stateId = fixture.state_id;

    // Find the relevant score objects for home and away teams
    const team1Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "home");
    const team2Score = fixture.scores.find(score => score.description === "CURRENT" && score.score.participant === "away");

    const team1Result = team1Score ? team1Score.score.goals : 0; // Goals for home team
    const team2Result = team2Score ? team2Score.score.goals : 0; // Goals for away team

    // Retrieve team names from the mapping or any other source
    const team1 = teamNameMap[team1Score?.participant_id] || "Unknown";
    const team2 = teamNameMap[team2Score?.participant_id] || "Unknown";

    // Log the extracted details
    console.log({
      fixtureId,
      team1,
      team2,
      team1Result,
      team2Result,
      stateId
    });
  } catch (error) {
    console.error('Error fetching live game data:', error.message);
  }
};

