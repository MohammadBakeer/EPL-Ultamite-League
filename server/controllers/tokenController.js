// controllers/tokenController.js

import jwt from 'jsonwebtoken';
import config from '../config/config.js'; // Adjust path as necessary

export const updateToken = (req, res) => {
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
  const newToken = jwt.sign(newPayload, config.jwtSecret);
  res.status(200).json({ token: newToken });
};
