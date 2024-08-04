
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { fetchLiveScores, getRoundStatus, getGamesByRoundNumber } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/fetchLiveScores/:roundNum', fetchLiveScores);
router.get('/getScheduleRoundStatus', getRoundStatus);
router.get('/getScheduleRoundGames/:roundNum', getGamesByRoundNumber);


export default router;
