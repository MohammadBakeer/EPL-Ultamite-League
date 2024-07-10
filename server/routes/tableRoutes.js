
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getPlayerNamesData, getTeamsData, storePlayerPrices } from '../controllers/tableController.js'

const router = express.Router();

router.get('/playerNames', authMiddleware, getPlayerNamesData);
router.get('/teams', authMiddleware, getTeamsData); 
router.post('/playerPrices', authMiddleware, storePlayerPrices); 

export default router;

