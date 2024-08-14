
import jwt from 'jsonwebtoken';

const { verify } = jwt;

export default function authMiddleware(req, res, next) {
  // Retrieve token from cookies instead of the Authorization header
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access.' });
  }
  
  try {
    const decoded = verify(token, 'your_jwt_secret');
    req.user = {
      userId: decoded.userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}
