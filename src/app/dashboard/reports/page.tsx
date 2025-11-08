"use client"

import { useMemo } from "react"
import { collection, query } from "firebase/firestore"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { type Transaction } from "@/lib/types"

const categoryTranslations: { [key: string]: string } = {
  Needs: "Necesidades",
  Wants: "Deseos",
  Savings: "Ahorros",
}

export default function ReportsPage() {
  const firestore = useFirestore()
  const { user } = useUser()

  const transactionsQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, "users", user.uid, "transactions")) : null),
    [firestore, user]
  )

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery)

  const monthlyReport = useMemo(() => {
    if (!transactions) return []
    const report: { [key: string]: { income: number; expense: number } } = {}

    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      if (!report[month]) {
        report[month] = { income: 0, expense: 0 }
      }
      if (t.type === "income") {
        report[month].income += t.amount
      } else {
        report[month].expense += t.amount
      }
    })

    return Object.entries(report).map(([month, totals]) => ({
      month,
      ...totals,
    }))
  }, [transactions])

  const categoryReport = useMemo(() => {
    if (!transactions) return []
    const report: { [key: string]: number } = {
      Needs: 0,
      Wants: 0,
      Savings: 0,
    }

    transactions.forEach((t) => {
      if (t.type === "expense" && report.hasOwnProperty(t.category)) {
        report[t.category] += t.amount
      }
    })

    return Object.entries(report).map(([name, total]) => ({
      name: categoryTranslations[name] || name,
      total,
    })).filter(item => item.total > 0)
  }, [transactions])


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Mensual</CardTitle>
            <CardDescription>Ingresos vs. Gastos cada mes.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Cargando reporte...</p>
            ) : (
              <ChartContainer config={{}} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={monthlyReport}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={4} name="Ingresos" />
                  <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={4} name="Gastos" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
            <CardDescription>Distribución de tus gastos.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <p>Cargando reporte...</p>
            ) : (
              <ChartContainer config={{}} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={categoryReport} layout="vertical">
                   <CartesianGrid horizontal={false} />
                   <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={80}
                  />
                   <XAxis dataKey="total" type="number" hide />
                   <ChartTooltip 
                    cursor={false} 
                    content={<ChartTooltipContent
                      labelFormatter={(value) => value}
                      formatter={(value, name) => `${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value as number)}`}
                      name="Total"
                    />}
                   />
                   <Bar dataKey="total" layout="vertical" fill="hsl(var(--chart-3))" radius={4} name="Total" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
