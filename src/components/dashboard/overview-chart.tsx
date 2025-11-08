"use client"

import { DonutChart, ChartLegend, ChartTooltip, ChartTooltipContent, type ChartConfig, ChartContainer } from "@/components/ui/chart"
import { Pie } from 'recharts';
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
    label: "Necesidades",
    color: "hsl(var(--chart-1))",
    icon: categoryIcons.Needs
  },
  Wants: {
    label: "Deseos",
    color: "hsl(var(--chart-2))",
    icon: categoryIcons.Wants
  },
  Savings: {
    label: "Ahorros",
    color: "hsl(var(--chart-3))",
    icon: categoryIcons.Savings
  },
} satisfies ChartConfig

export function OverviewChart({ data }: OverviewChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.total, 0)
  }, [data])


  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Vista General de la Regla 50/30/20</CardTitle>
        <CardDescription>El desglose de tus gastos este mes</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full max-w-[250px]"
        >
          <DonutChart
            data={data}
            category="total"
            index="category"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            colors={["chart-1", "chart-2", "chart-3"]}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
            </Pie>
            <ChartLegend content={({ payload }) => {
              return (
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <span className="text-2xl font-bold">
                    ${totalValue.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Total Gastado
                  </span>
                </div>
              );
            }} className="-translate-y-1/2" />
          </DonutChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex w-full items-center justify-center gap-4">
          {data.map((item) => {
            const config = chartConfig[item.category];
            return (
            <div key={item.category} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: `var(--color-${item.category})` }} />
              <span>{config.label}</span>
            </div>
          )})}
        </div>
        <div className="leading-none text-muted-foreground pt-2">
          Mostrando el desglose de gastos para el mes actual.
        </div>
      </CardFooter>
    </Card>
  )
}
