
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { register, login, checkIfVerified } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login)
router.get('/checkIfVerified', authMiddleware, checkIfVerified)


export default router;


