"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import { type Transaction } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { format } from "date-fns"
import { categoryIcons } from "../icons"


interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your most recent financial activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell">Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category];
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex justify-center items-center h-8 w-8 rounded-full bg-muted">
                        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {format(new Date(transaction.date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
