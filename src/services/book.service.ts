import { db } from '../config/database';
import { Book, CreateBookDTO, UpdateBookDTO } from '../types/book.types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PG_ERROR_CODES, PostgresError } from '../utils/dbErrors';

export class BookService {

  //Create a new book record (add book to the library)
  async create(data: CreateBookDTO): Promise<Book> {
    try {
      const book = await db.one<Book>(
        `INSERT INTO books (title, author, isbn, total_quantity, available_quantity, shelf_location)
         VALUES ($1, $2, $3, $4, $4, $5)
         RETURNING *`,
        [data.title, data.author, data.isbn, data.total_quantity, data.shelf_location]
      );
      return book;
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new ConflictError('Book with this ISBN already exists');
      }
      throw error;
    }
  }

  //get book by id 
  async findById(id: number): Promise<Book> {
    const book = await db.oneOrNone<Book>('SELECT * FROM books WHERE id = $1', [id]);
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    return book;
  }

  //get all books (paginated)
  async findAll(page = 1, limit = 10): Promise<{ books: Book[]; total: number }> {
    const offset = (page - 1) * limit;
    const books = await db.any<Book>(
      'SELECT * FROM books ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const { count } = await db.one<{ count: string }>('SELECT COUNT(*) FROM books');
    return { books, total: parseInt(count) };
  }

  //search books by title, author, or isbn
  async search(query: string, field: 'title' | 'author' | 'isbn'): Promise<Book[]> {
    const searchPattern = field === 'isbn' ? query : `%${query}%`;
    const operator = field === 'isbn' ? '=' : 'ILIKE';

    return db.any<Book>(`SELECT * FROM books WHERE ${field} ${operator} $1`, [searchPattern]);
  }

  //update book details
  async update(id: number, data: UpdateBookDTO): Promise<Book> {
    await this.findById(id);

    const updates: string[] = [];
    const values: (string | number)[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${values.length + 1}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `UPDATE books SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;

    return await db.one<Book>(query, values);
  }

  //delete book
  async delete(id: number): Promise<void> {
    try {
      const result = await db.result('DELETE FROM books WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        throw new NotFoundError('Book not found');
      }
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
        throw new ConflictError('Cannot delete book with active borrowings');
      }
      throw error;
    }
  }
}
