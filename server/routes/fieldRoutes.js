
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getUserLineup, updateLineup } from '../controllers/fieldController.js'

const router = express.Router();

router.put('/updateLineup', authMiddleware, updateLineup);
router.post('/getUserLineup', authMiddleware, getUserLineup);

export default router;