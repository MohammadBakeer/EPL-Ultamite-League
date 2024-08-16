import express from 'express';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken'; // Ensure you import jwt for token verification
import db from './config/db.js'; // Import your database configuration
import config from './config/config.js'; // Import your configuration file
import './services/cron.js'; // Your cron job service
import authRouter from './routes/authRoutes.js';
import fieldRouter from './routes/fieldRoutes.js';
import tableRouter from './routes/tableRoutes.js';
import leagueRouter from './routes/leagueRoutes.js';
import pagesRouter from './routes/pagesRoutes.js';
import privatePredictions from './routes/privatePredictionRoutes.js';
import globalPredictions from './routes/globalPredictionRoutes.js';
import fantasyPrivateLeague from './routes/fantasyLeagueRoutes.js';
import scheduleRouter from './routes/scheduleRoutes.js'
import profileRouter from './routes/profileRoutes.js'
import tokenRouter from './routes/tokenRoutes.js';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const corsOptions = {
  origin: 'https://ultimatefpleague.up.railway.app', // Your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware setup
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));
app.use(cors(corsOptions)); // Apply CORS middleware with options
app.use(express.json());


// Token update route
app.post('/api/update-token', (req, res) => {
  const { viewId, leagueId } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const newPayload = { ...decoded, viewId, leagueId };
  const newToken = jwt.sign(newPayload, config.jwtSecret, { expiresIn: '1h' });
  res.status(200).json({ token: newToken });
});

// Route handlers
app.use('/auth', authRouter);
app.use('/api', fieldRouter);
app.use('/api', tableRouter);
app.use('/api', leagueRouter);
app.use('/api', pagesRouter);
app.use('/api', privatePredictions);
app.use('/api', globalPredictions);
app.use('/api', fantasyPrivateLeague);
app.use('/api', scheduleRouter);
app.use('/api', profileRouter);
app.use('/api', tokenRouter);

// Email verification route
app.get('/verify-email', async (req, res) => {

  const { token } = req.query; // Extract the token from the query parameters
  
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);
    const { email } = decoded;

    // Update the user's email verification status in the database
    await db.query('UPDATE users SET email_verified = true WHERE email = $1', [email]);

    // Respond to the user (e.g., redirect to a login page or display a success message)
    res.status(200).send('Email verification successful! Go back to the sign up screen');
  } catch (error) {
    console.error('Error verifying email:', error.message);
    res.status(400).json({ error: 'Invalid token or token has expired' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});