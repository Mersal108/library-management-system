import { Request, Response } from 'express';
import { BorrowingService } from '../services/borrowing.service';
import { checkoutSchema } from '../validators/borrowing.validator';

const borrowingService = new BorrowingService();

export class BorrowingController {
  async checkout(req: Request, res: Response): Promise<void> {
    const validatedData = checkoutSchema.parse(req.body);
    const borrowing = await borrowingService.checkout(validatedData);
    res.status(201).json(borrowing);
  }

  async returnBook(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    const borrowing = await borrowingService.returnBook(id);
    res.json(borrowing);
  }

  async getBorrowerBooks(req: Request, res: Response): Promise<void> {
    const borrowerId = parseInt(req.params.borrower_id as string);
    const borrowings = await borrowingService.getBorrowerBooks(borrowerId);
    res.json({ borrowings });
  }

  async getOverdueBooks(_req: Request, res: Response): Promise<void> {
    const borrowings = await borrowingService.getOverdueBooks();
    res.json({ overdue_borrowings: borrowings });
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await borrowingService.getAll(status, page, limit);
    res.json({
      borrowings: result.borrowings,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
    });
  }
}
