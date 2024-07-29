
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getUserLineup, updateLineup, getRoundStatus, insertTeamTracker, storeChangeStatus, fetchChangeStatus } from '../controllers/fieldController.js'

const router = express.Router();

router.put('/updateLineup', authMiddleware, updateLineup);
router.post('/getUserLineup', authMiddleware, getUserLineup);
router.get('/getRoundStatus', authMiddleware, getRoundStatus);
router.get('/getRoundDBStatus', getRoundStatus);
router.post('/insertTeamTracker', insertTeamTracker);
router.post('/storeChangeStatus', authMiddleware, storeChangeStatus); 
router.get('/fetchChangeStatus/:currentRoundNum', authMiddleware, fetchChangeStatus); 


export default router;