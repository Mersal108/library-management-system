import { db } from '../config/database';
import { Borrower, CreateBorrowerDTO, UpdateBorrowerDTO } from '../types/borrower.types';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PG_ERROR_CODES, PostgresError } from '../utils/dbErrors';

export class BorrowerService {
  async create(data: CreateBorrowerDTO): Promise<Borrower> {
    try {
      const borrower = await db.one<Borrower>(
        `INSERT INTO borrowers (name, email)
         VALUES ($1, $2)
         RETURNING *`,
        [data.name, data.email]
      );
      return borrower;
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new ConflictError('Borrower with this email already exists');
      }
      throw error;
    }
  }

  //get borrower by id
  async findById(id: number): Promise<Borrower> {
    const borrower = await db.oneOrNone<Borrower>('SELECT * FROM borrowers WHERE id = $1', [id]);
    if (!borrower) {
      throw new NotFoundError('Borrower not found');
    }
    return borrower;
  }

  //get all borrowers (paginated)
  async findAll(page = 1, limit = 10): Promise<{ borrowers: Borrower[]; total: number }> {
    const offset = (page - 1) * limit;
    const borrowers = await db.any<Borrower>(
      'SELECT * FROM borrowers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    const { count } = await db.one<{ count: string }>('SELECT COUNT(*) FROM borrowers');
    return { borrowers, total: parseInt(count) };
  }

  //update borrower details
  async update(id: number, data: UpdateBorrowerDTO): Promise<Borrower> {
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
    const query = `UPDATE borrowers SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;

    try {
      return await db.one<Borrower>(query, values);
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === PG_ERROR_CODES.UNIQUE_VIOLATION) {
        throw new ConflictError('Email already in use');
      }
      throw error;
    }
  }

  //delete borrower
  async delete(id: number): Promise<void> {
    try {
      const result = await db.result('DELETE FROM borrowers WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        throw new NotFoundError('Borrower not found');
      }
    } catch (error) {
      const pgError = error as PostgresError;
      if (pgError.code === PG_ERROR_CODES.FOREIGN_KEY_VIOLATION) {
        throw new ConflictError('Cannot delete borrower with active borrowings');
      }
      throw error;
    }
  }
}
