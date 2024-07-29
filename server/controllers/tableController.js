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
      // If a conflict occurs (same first_name and last_name), update the price
      const query = `
        INSERT INTO players (first_name, last_name, price, total_points)
        VALUES ($1, $2, $3, 0)
        ON CONFLICT (first_name, last_name)
        DO UPDATE SET price = EXCLUDED.price;
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

export const getPrevTotal = async (req, res) => {
  try {
    // Query to get first_name, last_name, and total_points from the players table
    const result = await db.query('SELECT first_name, last_name, total_points FROM players');

    // Structure the data as an array of objects with firstName, lastName, and totalPoints
    const prevTotals = result.rows.map(row => ({
      firstName: row.first_name,
      lastName: row.last_name,
      totalPoints: row.total_points,
    }));

    // Send the response
    res.status(200).json(prevTotals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching previous total points', error: error.message });
  }
};


export const storeRoundPoints = async (req, res) => {
  const { roundPoints, roundNum } = req.body;

  try {
    // Loop over each player in the roundPoints array
    for (const player of roundPoints) {
      const { firstName, lastName, roundPoints } = player;
    
      // Check if the player-round combination already exists in the database
      const result = await db.query(
        `SELECT * FROM player_rounds WHERE first_name = $1 AND last_name = $2 AND round_num = $3`,
        [firstName, lastName, roundNum]
      );

      if (result.rows.length > 0) {
        // If it exists, update the existing record by adding the new roundPoints
        await db.query(
          `UPDATE player_rounds SET round_points = round_points + $1 WHERE first_name = $2 AND last_name = $3 AND round_num = $4`,
          [roundPoints, firstName, lastName, roundNum]
        );

      } else {
        // If it does not exist, insert a new record
        await db.query(
          `INSERT INTO player_rounds (first_name, last_name, round_num, round_points) VALUES ($1, $2, $3, $4)`,
          [firstName, lastName, roundNum, roundPoints]
        );
        console.log(`Inserted new round points for ${firstName} ${lastName}`);
      }
    }

    res.status(200).json({ message: 'Round points stored successfully' });
  } catch (error) {
    console.error('Error storing round points:', error);
    res.status(500).json({ message: 'Error storing round points', error: error.message });
  }
};



export const storeTotalPoints = async (req, res) => {
  const { table } = req.body;

  try {
    // Loop through each player in the table
    for (const player of table) {
      const { firstName, lastName, points } = player;

      // Update the total_points in the players table for the matching player
      await db.query(
        `UPDATE players SET total_points = $1 WHERE first_name = $2 AND last_name = $3`,
        [points, firstName, lastName]
      );

    }

    res.status(200).json({ message: 'Total points stored successfully' });
  } catch (error) {
    console.error('Error storing total points:', error);
    res.status(500).json({ message: 'Error storing total points', error: error.message });
  }
};

export const fetchPlayerRounds = async (req, res) => {
  try {
    // Extract currentRound from URL parameters
    const { currentRound } = req.params;

    // Query to get rows where round_num matches currentRound
    const query = `
      SELECT first_name, last_name, round_points, round_price
      FROM player_rounds
      WHERE round_num = $1
    `;

    // Execute the query
    const result = await db.query(query, [currentRound]);

    // Check if any rows were returned
    if (result.rows.length > 0) {
      // Map the rows to the desired format
      const formattedRows = result.rows.map(row => ({
        firstName: row.first_name,
        lastName: row.last_name,
        roundPoints: row.round_points,
        roundPrice: row.round_price
      }));

      // Send the mapped rows back as an array of objects
      res.status(200).json(formattedRows);
    } else {
      // No rows found for the given round number
      res.status(404).json({ message: 'No player rounds found for the specified round number' });
    }
  } catch (error) {
    // Log and handle any errors
    console.error('Error fetching player rounds:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
