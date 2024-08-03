
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { updateUserProfile, deleteUserProfile, fetchUserProfile  } from '../controllers/profileController.js'

const router = express.Router();

router.post('/updateuserprofile', authMiddleware, updateUserProfile)
router.delete('/deleteuserprofile', authMiddleware, deleteUserProfile)
router.get('/fetchuserprofile', authMiddleware, fetchUserProfile)


export default router;