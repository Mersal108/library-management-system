import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { createBookRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new BookController();

router.post('/', createBookRateLimiter, asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.getAll.bind(controller)));
router.get('/search', asyncHandler(controller.search.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export default router;
