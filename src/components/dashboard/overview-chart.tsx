"use client"

import { TrendingUp } from "lucide-react"
import { DonutChart, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig, Donut } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { categoryIcons } from "../icons"

interface OverviewChartProps {
  data: {
    category: 'Needs' | 'Wants' | 'Savings';
    total: number;
    fill: string;
  }[];
}

const chartConfig = {
  total: {
    label: "Total",
  },
  Needs: {
    label: "Needs",
    color: "hsl(var(--chart-1))",
    icon: categoryIcons.Needs
  },
  Wants: {
    label: "Wants",
    color: "hsl(var(--chart-2))",
    icon: categoryIcons.Wants
  },
  Savings: {
    label: "Savings",
    color: "hsl(var(--chart-3))",
    icon: categoryIcons.Savings
  },
} satisfies ChartConfig

export function OverviewChart({ data }: OverviewChartProps) {
  const totalValue = data.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>50/30/20 Rule Overview</CardTitle>
        <CardDescription>Your spending breakdown this month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <DonutChart
          data={data}
          category="total"
          index="category"
          valueFormatter={(value) => `$${value.toLocaleString()}`}
          colors={["Needs", "Wants", "Savings"]}
          className="w-full"
          config={chartConfig}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Donut
            dataKey="total"
            nameKey="category"
            innerRadius={100}
            outerRadius={140}
            label={({ payload, ...props }) => {
              const category = payload.category as keyof typeof chartConfig;
              const Icon = chartConfig[category]?.icon;
              return Icon ? <Icon /> : null;
            }}
            labelLine={false}
          >
          </Donut>
          <ChartLegend content={({ payload }) => {
            if (!payload) return null;
            return (
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Total Spent
                </span>
              </div>
            );
          }} className="-translate-y-1/2" />
        </DonutChart>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex w-full items-center justify-center gap-4">
          {data.map((item) => {
            const Icon = chartConfig[item.category as keyof typeof chartConfig].icon
            return (
            <div key={item.category} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>{item.category}</span>
            </div>
          )})}
        </div>
        <div className="leading-none text-muted-foreground pt-2">
          Showing spending breakdown for the current month.
        </div>
      </CardFooter>
    </Card>
  )
}
