import express from 'express';
import { 
  getChannels, 
  createChannel, 
  getChannelMessages, 
  getDirectMessages,
  searchUsers 
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/channels', getChannels);
router.post('/channels', createChannel);
router.get('/channels/:channelId/messages', getChannelMessages);
router.get('/dm/:dmId/messages', getDirectMessages);
router.get('/search-users', searchUsers);

export default router;