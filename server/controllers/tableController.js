import axios from 'axios';
import db from '../config/db.js';

//Get the teams for in the table component
export const getTeamsData = async (req, res) => {
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
};
  
  // Get the player stats for the game
  export const getPlayerNamesData = async (req, res) => {
    try {
        const teamResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
        const teamData = teamResponse.data;
        const elements = teamData.elements;
 
    
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
};



export const storePlayerPrices = async (req, res) => {
  const { table } = req.body;

  try {
    // Use a loop to insert each player's data into the database
    for (let player of table) {
      const { firstName, lastName, price } = player;

      // Example SQL query to insert data into the 'players' table
      const query = `
        INSERT INTO players (first_name, last_name, price)
        VALUES ($1, $2, $3);
      `;

      // Execute the query with sanitized values using db.query
      await db.query(query, [firstName, lastName, price]);
    }

    res.status(200).json({ message: 'Player prices stored successfully' });
  } catch (error) {
    console.error('Error storing player prices:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
