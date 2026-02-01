export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  total_quantity: number;
  available_quantity: number;
  shelf_location?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookDTO {
  title: string;
  author: string;
  isbn: string;
  total_quantity: number;
  shelf_location?: string;
}

export interface UpdateBookDTO {
  title?: string;
  author?: string;
  total_quantity?: number;
  shelf_location?: string;
}
