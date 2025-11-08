export type Transaction = {
  id: string;
  userId: string;
  date: string; // ISO string
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: 'Needs' | 'Wants' | 'Savings';
};

export type Configuration = {
    id: string;
    userId: string;
    needsPercentage: number;
    wantsPercentage: number;
    savingsPercentage: number;
}
