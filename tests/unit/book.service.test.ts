import { BookService } from '../../src/services/book.service';
import { db } from '../../src/config/database';
import { NotFoundError, ConflictError } from '../../src/utils/errors';

jest.mock('../../src/config/database');

describe('BookService', () => {
  let bookService: BookService;
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    bookService = new BookService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        total_quantity: 5,
        available_quantity: 5,
        shelf_location: 'A1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.one = jest.fn().mockResolvedValue(mockBook);

      const result = await bookService.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        total_quantity: 5,
        shelf_location: 'A1',
      });

      expect(result).toEqual(mockBook);
      expect(mockDb.one).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictError when ISBN already exists', async () => {
      const error: any = new Error('Duplicate key');
      error.code = '23505';
      mockDb.one = jest.fn().mockRejectedValue(error);

      await expect(
        bookService.create({
          title: 'Test Book',
          author: 'Test Author',
          isbn: '1234567890123',
          total_quantity: 5,
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('findById', () => {
    it('should return a book when found', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        total_quantity: 5,
        available_quantity: 5,
        shelf_location: 'A1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.oneOrNone = jest.fn().mockResolvedValue(mockBook);

      const result = await bookService.findById(1);

      expect(result).toEqual(mockBook);
      expect(mockDb.oneOrNone).toHaveBeenCalledWith('SELECT * FROM books WHERE id = $1', [1]);
    });

    it('should throw NotFoundError when book not found', async () => {
      mockDb.oneOrNone = jest.fn().mockResolvedValue(null);

      await expect(bookService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Book 1',
          author: 'Author 1',
          isbn: '1234567890123',
          total_quantity: 5,
          available_quantity: 5,
          shelf_location: 'A1',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          title: 'Book 2',
          author: 'Author 2',
          isbn: '1234567890124',
          total_quantity: 3,
          available_quantity: 3,
          shelf_location: 'A2',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockDb.any = jest.fn().mockResolvedValue(mockBooks);
      mockDb.one = jest.fn().mockResolvedValue({ count: '2' });

      const result = await bookService.findAll(1, 10);

      expect(result.books).toEqual(mockBooks);
      expect(result.total).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a book successfully', async () => {
      mockDb.result = jest.fn().mockResolvedValue({ rowCount: 1 });

      await expect(bookService.delete(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundError when book not found', async () => {
      mockDb.result = jest.fn().mockResolvedValue({ rowCount: 0 });

      await expect(bookService.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when book has active borrowings', async () => {
      const error: any = new Error('Foreign key constraint');
      error.code = '23503';
      mockDb.result = jest.fn().mockRejectedValue(error);

      await expect(bookService.delete(1)).rejects.toThrow(ConflictError);
    });
  });
});
