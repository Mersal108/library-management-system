import { Request, Response } from 'express';
import { ReportsService } from '../services/reports.service';

const reportsService = new ReportsService();

export class ReportsController {
  async getOverdueLastMonth(_req: Request, res: Response): Promise<void> {
    const borrowings = await reportsService.getOverdueBorrowingsLastMonth();
    res.json({ borrowings, count: borrowings.length });
  }

  async getAllLastMonth(_req: Request, res: Response): Promise<void> {
    const borrowings = await reportsService.getAllBorrowingsLastMonth();
    res.json({ borrowings, count: borrowings.length });
  }

  async exportOverdueLastMonth(req: Request, res: Response): Promise<void> {
    const format = (req.query.format as string) || 'csv';
    const borrowings = await reportsService.getOverdueBorrowingsLastMonth();

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `overdue_borrowings_${timestamp}.${format}`;

    let filepath: string;
    if (format === 'xlsx') {
      filepath = await reportsService.exportToXLSX(borrowings, filename);
    } else {
      filepath = await reportsService.exportToCSV(borrowings, filename);
    }

    res.download(filepath, filename);
  }

  async exportAllLastMonth(req: Request, res: Response): Promise<void> {
    const format = (req.query.format as string) || 'csv';
    const borrowings = await reportsService.getAllBorrowingsLastMonth();

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `all_borrowings_${timestamp}.${format}`;

    let filepath: string;
    if (format === 'xlsx') {
      filepath = await reportsService.exportToXLSX(borrowings, filename);
    } else {
      filepath = await reportsService.exportToCSV(borrowings, filename);
    }

    res.download(filepath, filename);
  }

  async exportByPeriod(req: Request, res: Response): Promise<void> {
    const { start_date, end_date, format = 'csv' } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({ error: 'start_date and end_date are required' });
      return;
    }

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    const borrowings = await reportsService.getBorrowingsByPeriod(startDate, endDate);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `borrowings_${timestamp}.${format}`;

    let filepath: string;
    if (format === 'xlsx') {
      filepath = await reportsService.exportToXLSX(borrowings, filename);
    } else {
      filepath = await reportsService.exportToCSV(borrowings, filename);
    }

    res.download(filepath, filename);
  }
}
