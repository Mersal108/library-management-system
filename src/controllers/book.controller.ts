import { Request, Response } from 'express';
import { BookService } from '../services/book.service';
import { createBookSchema, updateBookSchema } from '../validators/book.validator';

const bookService = new BookService();

export class BookController {
  async create(req: Request, res: Response): Promise<void> {
    const validatedData = createBookSchema.parse(req.body);
    const book = await bookService.create(validatedData);
    res.status(201).json(book);
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await bookService.findAll(page, limit);
    res.json({
      books: result.books,
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
    const book = await bookService.findById(id);
    res.json(book);
  }

  async search(req: Request, res: Response): Promise<void> {
    const { q, field } = req.query;
    const books = await bookService.search(q as string, field as 'title' | 'author' | 'isbn');
    res.json({ books });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    const validatedData = updateBookSchema.parse(req.body);
    const book = await bookService.update(id, validatedData);
    res.json(book);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id as string);
    await bookService.delete(id);
    res.json({ message: 'Book deleted successfully' });
  }
}
