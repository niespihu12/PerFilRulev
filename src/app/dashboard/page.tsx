"use client"

import { useState, useMemo, useEffect } from "react"
import { collection, query } from "firebase/firestore"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"

import { StatCards } from "@/components/dashboard/stat-cards"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { type Transaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { toast } = useToast()
  const firestore = useFirestore()
  const { user } = useUser()

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, "users", user.uid, "transactions")) : null
  , [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery)

  const sortedTransactions = useMemo(() => {
    if (!transactions) return []
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions])

  const { totalIncome, totalExpenses, netSavings, needsTotal, wantsTotal, savingsTotal, chartData } = useMemo(() => {
    if (!transactions) {
      return { totalIncome: 0, totalExpenses: 0, netSavings: 0, needsTotal: 0, wantsTotal: 0, savingsTotal: 0, chartData: [] };
    }
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0)
    
    const needs = transactions
      .filter((t) => t.type === "expense" && t.category === "Needs")
      .reduce((acc, t) => acc + t.amount, 0)
    const wants = transactions
      .filter((t) => t.type === "expense" && t.category === "Wants")
      .reduce((acc, t) => acc + t.amount, 0)
    
    const savingsFromExpenses = transactions
      .filter((t) => t.type === 'expense' && t.category === "Savings")
      .reduce((acc, t) => acc + t.amount, 0);

    const savings = savingsFromExpenses + (income - (needs + wants + savingsFromExpenses))

    const chartData = [
      { category: "Needs", total: needs, fill: "hsl(var(--chart-1))" },
      { category: "Wants", total: wants, fill: "hsl(var(--chart-2))" },
      { category: "Savings", total: savings, fill: "hsl(var(--chart-3))" },
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
          title: "Alerta de Presupuesto: Necesidades",
          description: `Has gastado el ${needsPercentage.toFixed(0)}% de tus ingresos en necesidades, superando la recomendación del 50%.`,
        })
      }
      if (wantsPercentage > 30) {
        toast({
          variant: "destructive",
          title: "Alerta de Presupuesto: Deseos",
          description: `Has gastado el ${wantsPercentage.toFixed(0)}% de tus ingresos en deseos, superando la recomendación del 30%.`,
        })
      }
    }
  }, [needsTotal, wantsTotal, totalIncome, toast])


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
      <StatCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netSavings={netSavings}
      />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentTransactions transactions={sortedTransactions.slice(0, 10)} />
        </div>
        <div className="row-start-1 lg:row-auto">
          <OverviewChart data={chartData} />
        </div>
      </div>
    </main>
  )
}
