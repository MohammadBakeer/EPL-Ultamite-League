// routes/leagueRoutes.js

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { createLeague, joinLeague, fetchGlobalPoints, getPrivateTeamLeagues, createFantasyLeague, joinFantasyLeague, getFantasyLeagues } from '../controllers/leagueController.js';

const router = express.Router();


router.get('/fetchglobalpoints', authMiddleware, fetchGlobalPoints);
router.post('/createleague', authMiddleware, createLeague);
router.post('/joinleague', authMiddleware, joinLeague);
router.get('/privateteamleagues', authMiddleware, getPrivateTeamLeagues);
router.post('/createfantasyleague', authMiddleware, createFantasyLeague);
router.post('/joinfantasyleague', authMiddleware, joinFantasyLeague);
router.get('/myfantasyleagues', authMiddleware, getFantasyLeagues);

export default router;
