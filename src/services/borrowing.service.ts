import { db } from '../config/database';
import { Borrowing, BorrowingWithDetails, CheckoutDTO } from '../types/borrowing.types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { calculateDueDate } from '../utils/dateHelpers';

export class BorrowingService {
  async checkout(data: CheckoutDTO): Promise<Borrowing> {
    return db.tx(async (t) => {
      const book = await t.oneOrNone(
        'SELECT id, available_quantity FROM books WHERE id = $1 FOR UPDATE',
        [data.book_id]
      );

      if (!book) {
        throw new NotFoundError('Book not found');
      }

      if (book.available_quantity <= 0) {
        throw new ConflictError('Book is not available for checkout');
      }

      const borrower = await t.oneOrNone('SELECT id FROM borrowers WHERE id = $1', [
        data.borrower_id,
      ]);

      if (!borrower) {
        throw new NotFoundError('Borrower not found');
      }

      await t.none(
        'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = $1',
        [data.book_id]
      );

      const dueDate = calculateDueDate(14);
      const borrowing = await t.one<Borrowing>(
        `INSERT INTO borrowings (book_id, borrower_id, due_date)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.book_id, data.borrower_id, dueDate]
      );

      return borrowing;
    });
  }

  async returnBook(borrowingId: number): Promise<Borrowing> {
    return db.tx(async (t) => {
      const borrowing = await t.oneOrNone(
        'SELECT * FROM borrowings WHERE id = $1 FOR UPDATE',
        [borrowingId]
      );

      if (!borrowing) {
        throw new NotFoundError('Borrowing record not found');
      }

      if (borrowing.status === 'returned') {
        throw new ConflictError('Book has already been returned');
      }

      const updated = await t.one<Borrowing>(
        `UPDATE borrowings
         SET return_date = CURRENT_DATE, status = 'returned'
         WHERE id = $1
         RETURNING *`,
        [borrowingId]
      );

      await t.none(
        'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = $1',
        [borrowing.book_id]
      );

      return updated;
    });
  }

  async getBorrowerBooks(borrowerId: number): Promise<BorrowingWithDetails[]> {
    return db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.borrower_id = $1 AND b.status = 'borrowed'
       ORDER BY b.due_date ASC`,
      [borrowerId]
    );
  }

  async getOverdueBooks(): Promise<BorrowingWithDetails[]> {
    return db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author,
              br.name as borrower_name, br.email as borrower_email
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       JOIN borrowers br ON b.borrower_id = br.id
       WHERE b.due_date < CURRENT_DATE AND b.status = 'borrowed'
       ORDER BY b.due_date ASC`
    );
  }

  async getAll(
    status?: string,
    page = 1,
    limit = 10
  ): Promise<{ borrowings: BorrowingWithDetails[]; total: number }> {
    const offset = (page - 1) * limit;

    const whereClause = status ? 'WHERE b.status = $3' : '';
    const params: any[] = [limit, offset];
    if (status) {
      params.push(status);
    }

    const borrowings = await db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author,
              br.name as borrower_name, br.email as borrower_email
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       JOIN borrowers br ON b.borrower_id = br.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countQuery = status
      ? 'SELECT COUNT(*) FROM borrowings WHERE status = $1'
      : 'SELECT COUNT(*) FROM borrowings';
    const countParams = status ? [status] : [];
    const { count } = await db.one<{ count: string }>(countQuery, countParams);

    return { borrowings, total: parseInt(count) };
  }
}
