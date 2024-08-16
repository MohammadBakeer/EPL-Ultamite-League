// jwtUtils.js

// Function to decode JWT token
import jwt from 'jsonwebtoken';
import config from './config/config.js';

export const decodeJWT = (token) => {
  try {
    // Verify and decode the token using the secret from config
    const decoded = jwt.verify(token, config.jwtSecret);

    // Return the decoded payload
    return decoded;
  } catch (error) {
    // Throw an error if JWT verification fails
    throw new Error('JWT verification failed');
  }
};