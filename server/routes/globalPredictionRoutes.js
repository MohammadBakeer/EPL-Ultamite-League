
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { storeGlobalPredictions, deleteGlobalPrediciton, fetchAllGlobalPredictions } from '../controllers/globalPredictionController.js'

const router = express.Router();

router.post('/storeGlobalPredictions', authMiddleware, storeGlobalPredictions)
router.delete('/deleteGlobalPrediction/:gameId', authMiddleware, deleteGlobalPrediciton)
router.get('/fetchallglobalpredictions', authMiddleware, fetchAllGlobalPredictions)


export default router;