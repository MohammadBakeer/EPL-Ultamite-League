import db from '../config/db.js'; // Adjust the path to your database config


export const fetchLiveScores = async (req, res) => {

  const { roundNum } = req.params;  

  try {

    const query = `
      SELECT 
        game_id AS gameId, 
        team_1_result AS team1Score, 
        team_2_result AS team2Score, 
        minute, 
        live,
         finished
      FROM 
        games 
      WHERE 
        round_num = $1;
    `;

    // Execute the query with roundNum as parameter
    const { rows } = await db.query(query, [roundNum]);
  

    // Check if any data was returned
    if (rows.length > 0) {
      return res.status(200).json(rows); // Return the fetched data
    } else {
      return res.status(404).json({ message: 'No live scores available for this round' });
    }
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRoundStatus = async (req, res) => {

    try {
      const query = 'SELECT * FROM round_status;';
      const result = await db.query(query);
    
      // Check if data was retrieved
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No round status found.' });
      }
      
      // Return the data to the frontend
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching round status:', error.message);
      return res.status(500).json({ message: 'Internal server error.' });
    }
  };



// Define and export the function to get games by round number
export const getGamesByRoundNumber = async (req, res) => {

    const { roundNum } = req.params; // Extract round number from URL params
    try {
      // Example SQL query to fetch games where round_num matches
      const query = `SELECT * FROM games WHERE round_num = $1`;
  
      const results = await db.query(query, [roundNum]);
   
      const games = results.rows;
  
      // Return the fetched games data as JSON response
      res.status(200).json(games);
    } catch (error) {
      console.error('Error fetching games:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  