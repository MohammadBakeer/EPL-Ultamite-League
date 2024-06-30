


import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getTeamNameByUserId } from '../controllers/pagesController.js'

const router = express.Router();

router.post('/getTeamName', authMiddleware, getTeamNameByUserId);

export default router;