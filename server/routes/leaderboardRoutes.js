// routes/leagueRoutes.js

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createLeague, joinLeague, getLeaderboardDataForAllUsers, getPrivateTeamLeagues } from '../controllers/leaderboardController.js';

const router = express.Router();


router.get('/alldataleaderboard', authMiddleware, getLeaderboardDataForAllUsers);
router.post('/createleague', authMiddleware, createLeague);
router.post('/joinleague', authMiddleware, joinLeague);
router.get('/privateteamleagues', authMiddleware, getPrivateTeamLeagues);


export default router;
