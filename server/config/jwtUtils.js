// jwtUtils.js

import jwt from 'jsonwebtoken';

// Function to decode JWT token
export const decodeJWT = (token) => {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your actual JWT secret

    // Return the decoded payload
    return decoded;
  } catch (error) {
    // Throw an error if JWT verification fails
    throw new Error('JWT verification failed');
  }
};
