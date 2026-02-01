import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import borrowerRoutes from './borrower.routes';
import borrowingRoutes from './borrowing.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/borrowers', borrowerRoutes);
router.use('/borrowings', borrowingRoutes);
router.use('/reports', reportsRoutes);

export default router;
