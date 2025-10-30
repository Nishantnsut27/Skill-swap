import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getMatches } from '../controllers/matchController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getMatches);

export default router;
