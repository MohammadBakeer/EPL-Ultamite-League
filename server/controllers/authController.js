import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { current } from '@reduxjs/toolkit';

const { sign } = jwt;

const fetchRoundDBStatus = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/getRoundDBStatus', {
      method: 'GET',
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
  
    const finishedRounds = data
      .filter(round => round.finished) // Filter objects with finished as true
      .map(round => round.round_num); // Map to round_num

    // Find the maximum round_num
    const maxRoundNum = finishedRounds.length > 0 ? Math.max(...finishedRounds) : 0;
    const currentRound = maxRoundNum + 1; // Set roundNum to maxRoundNum + 1 or 1 if no finished rounds are found

    return currentRound;
  } catch (error) {
    console.error('Error fetching round status from the database:', error.message);
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, teamName } = req.body;

    // Check if the email already exists in the database
    const emailExistsResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (emailExistsResult.rows.length > 0) {
      // If email already exists, return an error response
      return res.status(400).json({ error: 'Email already exists. Please choose another email.' });
    }

    // Perform database insert operation for users table
    const userResult = await db.query('INSERT INTO users (email, password, team_name) VALUES ($1, $2, $3) RETURNING user_id', [email, password, teamName]);

    const userId = userResult.rows[0].user_id;

    const currentRoundNum = await fetchRoundDBStatus()
    
    await db.query(
      'INSERT INTO teams (user_id, formation, player_lineup, total_budget, round_num, points) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', '[]', 100, currentRoundNum, 0]
    );


    // Sign JWT token and send it back to the client upon successful user creation
    const token = sign({ userId }, config.jwtSecret, { expiresIn: '1h' });

    // Send a response indicating success along with the token
    res.status(201).json({
      token,
      message: 'User signed up successfully',
      user: { user_id: userId, email, team_name: teamName }
    });
  } catch (error) {
    console.error('Error during signup:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Perform the database query to check if the email and password match
      const result = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
  
      // Check if there is a match
      const match = result.rows.length > 0;

      // If there is a match, send the user_id in the response
      if (match) {
        const userId = result.rows[0].user_id;

        const token = sign({ userId }, config.jwtSecret, { expiresIn: '1h' });
        
        res.json({ match, userId, token });
      } else {
        res.json({ match });
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };