
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { storeGlobalPredictions, deleteGlobalPrediction, fetchAllGlobalPredictions } from '../controllers/globalPredictionController.js'

const router = express.Router();

router.post('/storeGlobalPredictions', authMiddleware, storeGlobalPredictions)
router.delete('/deleteGlobalPredictions/:gameId', authMiddleware, deleteGlobalPrediction)
router.get('/fetchallglobalpredictions', authMiddleware, fetchAllGlobalPredictions)


export default router;