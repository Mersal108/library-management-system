import { Router } from 'express';
import { BorrowingController } from '../controllers/borrowing.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { checkoutRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new BorrowingController();

router.post('/checkout', checkoutRateLimiter, asyncHandler(controller.checkout.bind(controller)));
router.post('/:id/return', asyncHandler(controller.returnBook.bind(controller)));
router.get('/borrower/:borrower_id', asyncHandler(controller.getBorrowerBooks.bind(controller)));
router.get('/overdue', asyncHandler(controller.getOverdueBooks.bind(controller)));
router.get('/', asyncHandler(controller.getAll.bind(controller)));

export default router;
