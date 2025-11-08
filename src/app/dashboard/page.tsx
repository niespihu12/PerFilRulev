"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/dashboard/header"
import { StatCards } from "@/components/dashboard/stat-cards"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { mockTransactions } from "@/lib/data"
import { type Transaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [isAddTransactionOpen, setAddTransactionOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const { toast } = useToast()

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions((prev) => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
  }

  const { totalIncome, totalExpenses, netSavings, needsTotal, wantsTotal, savingsTotal, chartData } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0)
    
    const needs = transactions
      .filter((t) => t.category === "Needs")
      .reduce((acc, t) => acc + t.amount, 0)
    const wants = transactions
      .filter((t) => t.category === "Wants")
      .reduce((acc, t) => acc + t.amount, 0)
    const savings = transactions
      .filter((t) => t.category === "Savings" && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0) + (income - expenses)


    const chartData = [
      { category: "Needs", total: needs, fill: "chart-1" },
      { category: "Wants", total: wants, fill: "chart-2" },
      { category: "Savings", total: savings, fill: "chart-3" },
    ].filter(item => item.total > 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
      needsTotal: needs,
      wantsTotal: wants,
      savingsTotal: savings,
      chartData,
    }
  }, [transactions])

  useEffect(() => {
    if (totalIncome > 0) {
      const needsPercentage = (needsTotal / totalIncome) * 100
      const wantsPercentage = (wantsTotal / totalIncome) * 100

      if (needsPercentage > 50) {
        toast({
          variant: "destructive",
          title: "Budget Alert: Needs",
          description: `You've spent ${needsPercentage.toFixed(0)}% of your income on needs, which is over the 50% recommendation.`,
        })
      }
      if (wantsPercentage > 30) {
        toast({
          variant: "destructive",
          title: "Budget Alert: Wants",
          description: `You've spent ${wantsPercentage.toFixed(0)}% of your income on wants, which is over the 30% recommendation.`,
        })
      }
    }
  }, [needsTotal, wantsTotal, totalIncome, toast])


  return (
    <>
      <Header onAddTransaction={() => setAddTransactionOpen(true)} />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
        <StatCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netSavings={netSavings}
        />
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentTransactions transactions={transactions.slice(0, 10)} />
          </div>
          <div className="row-start-1 lg:row-auto">
            <OverviewChart data={chartData} />
          </div>
        </div>
      </main>
      <AddTransactionDialog
        isOpen={isAddTransactionOpen}
        setIsOpen={setAddTransactionOpen}
        onTransactionAdded={handleAddTransaction}
      />
    </>
  )
}
