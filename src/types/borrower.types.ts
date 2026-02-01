export interface Borrower {
  id: number;
  name: string;
  email: string;
  registered_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBorrowerDTO {
  name: string;
  email: string;
}

export interface UpdateBorrowerDTO {
  name?: string;
  email?: string;
}
