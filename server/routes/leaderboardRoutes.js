

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getLeaderboardDataForAllUsers } from '../controllers/leaderboardController.js'

const router = express.Router();

router.get('/getLeaderboardDataForAllUsers', authMiddleware, getLeaderboardDataForAllUsers);

export default router;