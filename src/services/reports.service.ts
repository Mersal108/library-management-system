import { db } from '../config/database';
import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';
import { BorrowingWithDetails } from '../types/borrowing.types';
import path from 'path';
import fs from 'fs';

export class ReportsService {
  async getOverdueBorrowingsLastMonth(): Promise<BorrowingWithDetails[]> {
    return db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author,
              br.name as borrower_name, br.email as borrower_email
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       JOIN borrowers br ON b.borrower_id = br.id
       WHERE b.due_date < CURRENT_DATE
         AND b.status = 'borrowed'
         AND b.borrowed_date >= CURRENT_DATE - INTERVAL '1 month'
       ORDER BY b.due_date ASC`
    );
  }

  async getAllBorrowingsLastMonth(): Promise<BorrowingWithDetails[]> {
    return db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author,
              br.name as borrower_name, br.email as borrower_email
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       JOIN borrowers br ON b.borrower_id = br.id
       WHERE b.borrowed_date >= CURRENT_DATE - INTERVAL '1 month'
       ORDER BY b.borrowed_date DESC`
    );
  }

  async getBorrowingsByPeriod(startDate: Date, endDate: Date): Promise<BorrowingWithDetails[]> {
    return db.any<BorrowingWithDetails>(
      `SELECT b.*, bk.title as book_title, bk.author as book_author,
              br.name as borrower_name, br.email as borrower_email
       FROM borrowings b
       JOIN books bk ON b.book_id = bk.id
       JOIN borrowers br ON b.borrower_id = br.id
       WHERE b.borrowed_date BETWEEN $1 AND $2
       ORDER BY b.borrowed_date DESC`,
      [startDate, endDate]
    );
  }

  async exportToCSV(data: BorrowingWithDetails[], filename: string): Promise<string> {
    const outputDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'id', title: 'Borrowing ID' },
        { id: 'book_title', title: 'Book Title' },
        { id: 'book_author', title: 'Author' },
        { id: 'borrower_name', title: 'Borrower Name' },
        { id: 'borrower_email', title: 'Borrower Email' },
        { id: 'borrowed_date', title: 'Borrowed Date' },
        { id: 'due_date', title: 'Due Date' },
        { id: 'return_date', title: 'Return Date' },
        { id: 'status', title: 'Status' },
      ],
    });

    await csvWriter.writeRecords(data);
    return filepath;
  }

  async exportToXLSX(data: BorrowingWithDetails[], filename: string): Promise<string> {
    const outputDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);

    const worksheetData = data.map((item) => ({
      'Borrowing ID': item.id,
      'Book Title': item.book_title,
      Author: item.book_author,
      'Borrower Name': item.borrower_name,
      'Borrower Email': item.borrower_email,
      'Borrowed Date': item.borrowed_date,
      'Due Date': item.due_date,
      'Return Date': item.return_date || 'Not returned',
      Status: item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Borrowings');

    XLSX.writeFile(workbook, filepath);
    return filepath;
  }
}
