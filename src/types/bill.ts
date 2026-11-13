export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 31
  paid: boolean;
}

export type BillFilter = 'all' | 'unpaid' | 'paid';
