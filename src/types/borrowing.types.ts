export interface Borrowing {
  id: number;
  book_id: number;
  borrower_id: number;
  borrowed_date: Date;
  due_date: Date;
  return_date?: Date;
  status: 'borrowed' | 'returned' | 'overdue';
  created_at: Date;
  updated_at: Date;
}

export interface BorrowingWithDetails extends Borrowing {
  book_title?: string;
  book_author?: string;
  borrower_name?: string;
  borrower_email?: string;
}

export interface CheckoutDTO {
  book_id: number;
  borrower_id: number;
}
