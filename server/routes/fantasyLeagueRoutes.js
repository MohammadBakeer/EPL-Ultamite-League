


import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { fetchPrivateFantasyLeague, fetchMembersTeams, deleteFantasyLeague, checkIfFantasyOwner, leaveFantasyLeague } from '../controllers/leagueController.js'

const router = express.Router();

router.get('/fetchPrivateFantasyLeague/:leagueId', authMiddleware, fetchPrivateFantasyLeague);
router.post('/fetchMembersTeams', authMiddleware, fetchMembersTeams);
router.delete('/deleteFantasyLeague/:leagueId', authMiddleware, deleteFantasyLeague);
router.get('/checkIfFantasyOwner/:leagueId', authMiddleware, checkIfFantasyOwner);
router.delete('/leavefantasyleague/:leagueId', authMiddleware, leaveFantasyLeague);


export default router;