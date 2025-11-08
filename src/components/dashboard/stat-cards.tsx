"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, ArrowUp, ArrowDown, PiggyBank } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface StatCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
}

export function StatCards({ totalIncome, totalExpenses, netSavings }: StatCardsProps) {
  const stats = [
    {
      title: "Total Income",
      amount: totalIncome,
      icon: <ArrowUp className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Total Expenses",
      amount: totalExpenses,
      icon: <ArrowDown className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Net Savings",
      amount: netSavings,
      icon: <PiggyBank className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stat.amount)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
