import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { mockTransactions } from "@/lib/data"

export default function TransactionsPage() {
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-4">All Transactions</h1>
      <RecentTransactions transactions={mockTransactions} />
    </div>
  )
}
