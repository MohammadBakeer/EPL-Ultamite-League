
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getGamesByRoundNumber, storeGlobalPredictions, getRoundPredictions, deleteGlobalPrediciton } from '../controllers/predictionController.js'

const router = express.Router();

router.get('/getRoundGames/:roundNum', authMiddleware, getGamesByRoundNumber);
router.post('/storeGlobalPredictions', authMiddleware, storeGlobalPredictions)
router.get('/getRoundPredictions/:roundNum', authMiddleware, getRoundPredictions)
router.delete('/deleteGlobalPrediction/:gameId', authMiddleware, deleteGlobalPrediciton)

export default router;