// routes/tokenRoutes.js

import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { updateToken } from '../controllers/tokenController.js';

const router = express.Router();

router.post('/updatetoken', authMiddleware, updateToken);

export default router;
