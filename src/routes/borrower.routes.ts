import { Router } from 'express';
import { BorrowerController } from '../controllers/borrower.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();
const controller = new BorrowerController();

router.post('/', asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.getAll.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export default router;
