
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getGamesByRoundNumber, getRoundPredictions, privateLeaguePoints, storePrivatePredictions, deletePrivatePredictions, getPrivateRoundPredictions, checkIfOwner, storePrivatePredictionOption, fetchOptionType, storeChooseCard, fetchChosenGames, removeChosenGame, saveSubmitStatus, fetchSubmitStatus, getAllPrivateRoundPredictions, fetchLeagueCode, deletePrivatePredictionLeague, leavePredictionLeague, getAllGames } from '../controllers/privatePredictionController.js'

const router = express.Router();

router.get('/getRoundGames/:roundNum', authMiddleware, getGamesByRoundNumber);
router.get('/getRoundPredictions/:roundNum', authMiddleware, getRoundPredictions)
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
router.get('/fetchLeagueCode/:leagueId', authMiddleware, fetchLeagueCode);
router.delete('/deletePrivatePredictionLeague/:leagueId', authMiddleware, deletePrivatePredictionLeague);
router.delete('/leavepredictionleague/:leagueId', authMiddleware, leavePredictionLeague);
router.get('/getAllRoundGames', authMiddleware, getAllGames);

export default router;
