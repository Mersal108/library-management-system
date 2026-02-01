import { Request, Response } from 'express';
import { BorrowerService } from '../services/borrower.service';
import { createBorrowerSchema, updateBorrowerSchema } from '../validators/borrower.validator';

const borrowerService = new BorrowerService();

export class BorrowerController {
  async create(req: Request, res: Response): Promise<void> {
    const validatedData = createBorrowerSchema.parse(req.body);
    const borrower = await borrowerService.create(validatedData);
    res.status(201).json(borrower);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await borrowerService.findAll(page, limit);
    res.json({
      borrowers: result.borrowers,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    const borrower = await borrowerService.findById(id);
    res.json(borrower);
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    const validatedData = updateBorrowerSchema.parse(req.body);
    const borrower = await borrowerService.update(id, validatedData);
    res.json(borrower);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    await borrowerService.delete(id);
    res.json({ message: 'Borrower deleted successfully' });
  }
}
