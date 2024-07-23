
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getPlayerNamesData, getTeamsData, storePlayerPrices, storeTotalPoints, storeRoundPoints, getPrevTotal  } from '../controllers/tableController.js'

const router = express.Router();

router.get('/playerNames', authMiddleware, getPlayerNamesData);
router.get('/teams', authMiddleware, getTeamsData); 
router.post('/playerPrices', authMiddleware, storePlayerPrices); 
router.post('/storeTotalPoints', authMiddleware, storeTotalPoints);
router.post('/storeRoundPoints', authMiddleware, storeRoundPoints);
router.get('/getPrevTotal', authMiddleware, getPrevTotal);

export default router;

