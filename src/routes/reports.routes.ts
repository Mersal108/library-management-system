import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const controller = new ReportsController();

router.get('/overdue/last-month', asyncHandler(controller.getOverdueLastMonth.bind(controller)));
router.get('/all/last-month', asyncHandler(controller.getAllLastMonth.bind(controller)));
router.get(
  '/export/overdue/last-month',
  asyncHandler(controller.exportOverdueLastMonth.bind(controller))
);
router.get(
  '/export/all/last-month',
  asyncHandler(controller.exportAllLastMonth.bind(controller))
);
router.get('/export/period', asyncHandler(controller.exportByPeriod.bind(controller)));

export default router;
