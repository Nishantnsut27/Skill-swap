import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  searchUserByEmail,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend
} from '../controllers/friendController.js';

const router = express.Router();

router.get('/search', authMiddleware, searchUserByEmail);
router.post('/request', authMiddleware, sendFriendRequest);
router.get('/requests', authMiddleware, getFriendRequests);
router.post('/requests/:requestId', authMiddleware, respondToFriendRequest);
router.get('/', authMiddleware, getFriends);
router.delete('/:friendId', authMiddleware, removeFriend);

export default router;
