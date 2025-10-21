import express from 'express';
import { 
  getSavedList, 
  addToSavedList, 
  removeFromSavedList, 
  getUserProfile 
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken); // All user routes require authentication

router.get('/profile', getUserProfile);
router.get('/saved', getSavedList);
router.post('/saved/:contentId', addToSavedList);
router.delete('/saved/:contentId', removeFromSavedList);

export default router;