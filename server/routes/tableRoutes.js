
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getPlayerNamesData, getTeamsData, attachPlayerPrices, storeTotalPoints, storeRoundPoints, getPrevTotal, fetchPlayerRounds  } from '../controllers/tableController.js'

const router = express.Router();

router.get('/playerNames', getPlayerNamesData);
router.get('/teams', getTeamsData); 
router.post('/playerPrices', authMiddleware, attachPlayerPrices); 
router.post('/storeTotalPoints', storeTotalPoints);
router.post('/storeRoundPoints',  storeRoundPoints);
router.get('/getPrevTotal', getPrevTotal);
router.get('/fetchPlayerRounds/:currentRound', fetchPlayerRounds);

export default router;

