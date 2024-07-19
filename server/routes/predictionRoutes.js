
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getGamesByRoundNumber, storeGlobalPredictions, getRoundPredictions, deleteGlobalPrediciton, privateLeaguePoints, storePrivatePredictions, deletePrivatePredictions, getPrivateRoundPredictions, checkIfOwner, storePrivatePredictionOption, fetchOptionType, storeChooseCard, fetchChosenGames, removeChosenGame, saveSubmitStatus, fetchSubmitStatus, getAllPrivateRoundPredictions } from '../controllers/predictionController.js'

const router = express.Router();

router.get('/getRoundGames/:roundNum', authMiddleware, getGamesByRoundNumber);
router.post('/storeGlobalPredictions', authMiddleware, storeGlobalPredictions)
router.get('/getRoundPredictions/:roundNum', authMiddleware, getRoundPredictions)
router.delete('/deleteGlobalPrediction/:gameId', authMiddleware, deleteGlobalPrediciton)
router.post('/privateleaguepoints', authMiddleware, privateLeaguePoints)
router.post('/storePrivatePredictions', authMiddleware, storePrivatePredictions)
router.delete('/deletePrivatePrediction/:gameId/:leagueId', authMiddleware, deletePrivatePredictions)
router.get('/getPrivateRoundPredictions/:roundNum/:leagueId', authMiddleware, getPrivateRoundPredictions)
router.get('/checkIfOwner/:leagueId', authMiddleware, checkIfOwner);
router.post('/storePrivatePredictionOption', authMiddleware, storePrivatePredictionOption);
router.get('/fetchOptionType/:leagueId/:roundNum', fetchOptionType);
router.post('/storeChooseCard', authMiddleware, storeChooseCard);
router.get('/fetchChosenGames/:leagueId/:roundNum', authMiddleware, fetchChosenGames);
router.delete('/removeChosenGame/:gameId/:leagueId/:roundNum', authMiddleware, removeChosenGame); 
router.post('/saveSubmitStatus', authMiddleware, saveSubmitStatus);
router.get('/fetchSubmitStatus/:roundNum/:leagueId', authMiddleware, fetchSubmitStatus);
router.get('/getAllPrivateRoundPredictions/:roundNum/:leagueId', authMiddleware, getAllPrivateRoundPredictions)





export default router;