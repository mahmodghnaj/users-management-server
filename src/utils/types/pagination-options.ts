interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string; // Optional: Field to sort by
  sortOrder?: 'asc' | 'desc'; // Optional: Sort order ('asc' or 'desc')
  total?: boolean;
}
