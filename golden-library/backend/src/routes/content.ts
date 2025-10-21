import express from 'express';
import { 
  getAllContent, 
  getContentById, 
  getMostLikedContent, 
  likeContent, 
  unlikeContent,
  createContent 
} from '../controllers/contentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllContent);
router.get('/most-liked', getMostLikedContent);
router.get('/:id', getContentById);
router.post('/', createContent);
router.post('/:contentId/like', authenticateToken, likeContent);
router.delete('/:contentId/like', authenticateToken, unlikeContent);

export default router;