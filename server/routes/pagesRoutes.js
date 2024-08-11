


import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getTeamNameByUserId, sendContactEmail } from '../controllers/pagesController.js'

const router = express.Router();

router.post('/getTeamName', authMiddleware, getTeamNameByUserId);
router.post('/sendContactEmail', authMiddleware, sendContactEmail)

export default router;