import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { listRooms, createRoom, getRoomMessages, createCallLog } from '../controllers/chatController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listRooms);
router.post('/', createRoom);
router.get('/:id/messages', getRoomMessages);
router.post('/call-log', createCallLog);

export default router;
