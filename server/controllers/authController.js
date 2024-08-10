import db from '../config/db.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'

const { sign } = jwt;

export const checkIfVerified = async (req, res) => {
  const verificationToken = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header

  if (!verificationToken) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(verificationToken, config.jwtSecret);
    const { email, teamName } = decoded;

    // Query the database for the user's email verification status and password
    const result = await db.query('SELECT user_id, email_verified, password FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { email_verified, password, user_id } = result.rows[0];
    // Log email verification status


    if (email_verified) {
      // Check if password exists
      if (!password) {
        return res.status(400).json({ error: 'Password not found for user' });
      }

      // Fetch current round number from database
      const currentRoundNum = await fetchRoundDBStatus();


      // Insert initial team setup into the database
      await db.query(
        'INSERT INTO teams (user_id, formation, player_lineup, total_budget, round_num, points) VALUES ($1, $2, $3, $4, $5, $6)',
        [user_id, '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', '[]', 85, currentRoundNum, 0]
      );

      // Generate JWT token
      const token = sign({ userId: user_id }, config.jwtSecret, { expiresIn: '1h' });

      return res.status(200).json({ verified: true, token });
    } else {
      // User is not verified
      return res.status(200).json({ verified: false });
    }
  } catch (error) {
    console.error('Error checking verification status:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ultamitefpleague@gmail.com',
    pass: 'hwml ewlo iwgw rmcp',
  },
});



const sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: 'ultamitefpleague@gmail.com',
    to: email,
    subject: 'Email Verification',
    html: `
      <p>Please verify your email by clicking the button below:</p>
      <a href="http://localhost:3000/verify-email.html?token=${verificationToken}" 
         style="display: inline-block; 
                padding: 10px 20px; 
                font-size: 16px; 
                color: white; 
                background-color: #4CAF50; 
                text-decoration: none; 
                border-radius: 5px;">
        Verify Email
      </a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return `Verification email sent to: ${email}. Check your SPAM`;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error('Failed to send verification email');
  }
};



export const register = async (req, res) => {
console.log("register");
  try {
    const { email, password, teamName } = req.body;

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const emailResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log(emailResult);
    if (emailResult.rows.length > 0) {
      const userData = emailResult.rows[0];

      if (userData.email_verified) {
        // If the email is verified, return an error
        return res.status(400).json({ error: 'Email already has an account.' });
      } else {
        // Email exists but is not verified, proceed with registration
        console.log('Email exists but is not verified. Proceeding with registration.');
      }
    }

    // Check if the team name is taken by other users
    const teamNameResult = await db.query('SELECT * FROM users WHERE team_name = $1 AND email != $2', [teamName, email]);

    if (teamNameResult.rows.length > 0) {
      // If team name already exists, return an error
      return res.status(400).json({ error: 'Team name is taken.' });
    }



    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationAttemptsResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
      const currentTime = new Date();
    console.log(teamName);
    if (verificationAttemptsResult.rows.length === 0) {
      console.log(teamName);

      await db.query(
        'INSERT INTO users (email, team_name, attempt_count, attempt_time, password) VALUES ($1, $2, $3, $4, $5)',
        [email, teamName, 1, currentTime, hashedPassword]
      );
    } else {
      const attemptData = verificationAttemptsResult.rows[0];
      const attemptCount = attemptData.attempt_count;
      const attemptTime = new Date(attemptData.attempt_time);

      if (attemptCount % 2 !== 0) {
        // If attempt_count is odd, update the attempt_time to the current time and increment attempt_count
          await db.query(
            'UPDATE users SET attempt_count = $1, attempt_time = $2, password = $3, team_name = $4 WHERE email = $5',
            [attemptCount + 1, currentTime , hashedPassword, teamName, email]
          );
      } else {
        const hoursPassed = (currentTime - attemptTime) / (1000 * 60 * 60); // Calculate hours passed

        if (hoursPassed < 24) {
          return res.status(400).json({ error: 'You can only make 2 attempts per 24 hours. Please try again later.' });
        } else {
          // Update attempt_count and set attempt_time to the current time
          await db.query(
            'UPDATE users SET attempt_count = $1, attempt_time = $2, password = $3, team_name =$4 WHERE email = $5',
            [attemptCount + 1, currentTime, hashedPassword, teamName, email]
          );
        }
      }
    }

    const verificationToken = sign({ email, teamName }, config.jwtSecret, { expiresIn: '5m' });

    // Send verification email
    const emailSentMessage = await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      verificationToken,
      message: emailSentMessage,
     
    });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, teamData, roundNum } = req.body;

    // Query the database for the user with the provided email
    const result = await db.query('SELECT user_id, password FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // If no user found with that email, return false match
      return res.json({ match: false });
    }

    const { user_id, password: hashedPassword } = result.rows[0];
    
    // Compare the provided password with the stored hashed password
    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
      // Passwords match, generate a JWT token
      const token = sign({ userId: user_id }, config.jwtSecret, { expiresIn: '1h' });


      //if teamData.present === false insert
      if(teamData.present === false){
      await db.query(
        'INSERT INTO teams (user_id, formation, player_lineup, total_budget, round_num, points) VALUES ($1, $2, $3, $4, $5, $6)',
        [user_id, '["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"]', '[]', 85, roundNum, 0]
      );
    }

      // Send response with match status, userId, and token
      return res.json({ match: true, userId: user_id, token });
    } else {
      // Passwords do not match
      return res.json({ match: false });
    }
  } catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

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

  export const teamPresent = async (req, res) => {
    
    const { email } = req.params 


    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      // Query the users table to get the user ID based on the provided email
      const userQuery = 'SELECT user_id FROM users WHERE email = $1';
      const userResult = await db.query(userQuery, [email]);
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ present: false, message: 'User not found' });
      }
  
      const userId = userResult.rows[0].user_id;
  
      // Query the teams table to find rows associated with the user ID
      const teamQuery = 'SELECT * FROM teams WHERE user_id = $1';
      const teamResult = await db.query(teamQuery, [userId]);
  
      // Check if any teams are associated with the user ID
      if (teamResult.rows.length === 0) {
        return res.status(200).json({ present: false, message: 'No teams found for this user' });
      }
  
      // Return the teams associated with the user ID
      res.status(200).json({ present: true, teams: teamResult.rows });
    } catch (error) {
      console.error('Error checking team presence:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  