import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getUsers, getMe, updateMe, getUserById, upvoteUser, removeUpvote, searchUsers } from '../controllers/userController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getUsers);
router.get('/search', searchUsers);
router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/:id', getUserById);
router.post('/:userId/upvote', upvoteUser);
router.delete('/:userId/upvote', removeUpvote);

export default router;
