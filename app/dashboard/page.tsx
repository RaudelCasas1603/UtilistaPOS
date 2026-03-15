"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import {
  HandCoins,
  ReceiptText,
  Receipt,
  PackageMinus,
  CalendarClockIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Legend,
  Bar,
  BarChart,
} from "recharts"

type Periodo = {
  label: string
  value: string
}

// Opciones de período para el Combobox
const periodo: Periodo[] = [
  { label: "Dia", value: "dia" },
  { label: "Semana", value: "semana" },
  { label: "Mes", value: "mes" },
]
// Datos de ejemplo para el gráfico
const data = [
  { day: "Lun", ventas: 1200 },
  { day: "Mar", ventas: 1800 },
  { day: "Mié", ventas: 1500 },
  { day: "Jue", ventas: 2100 },
  { day: "Vie", ventas: 2800 },
  { day: "Sáb", ventas: 2400 },
  { day: "Dom", ventas: 1000 },
  { day: "Lun", ventas: 1200 },
  { day: "Mar", ventas: 1800 },
  { day: "Mié", ventas: 1500 },
  { day: "Jue", ventas: 2100 },
  { day: "Vie", ventas: 3000 },
  { day: "Sáb", ventas: 2400 },
  { day: "Dom", ventas: 1000 },
]

const data2 = [
  { name: "Cuadernos", value: 35 },
  { name: "Plumas", value: 20 },
  { name: "Copias", value: 25 },
  { name: "Otros", value: 20 },
]

// Colores para el gráfico

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
]

export default function DashboardPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <CalendarClockIcon className="ml-4 h-6 w-6" />
          <div className="w-46">
            <Combobox
              items={periodo}
              itemToStringValue={(period: Periodo) => period.label}
            >
              <ComboboxInput placeholder="Selecciona período" />
              <ComboboxContent>
                <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
                <ComboboxList>
                  {(period) => (
                    <ComboboxItem key={period.value} value={period}>
                      {period.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </div>

      <div className="mt-2 grid w-3/5 grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card shadow-md transition-all hover:shadow-lg">
          <CardContent className="flex h-24 items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Ventas
              </p>
              <p className="text-2xl font-bold text-foreground">$8,220.25</p>

              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12.4%</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <HandCoins className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex h-24 items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Tickets
              </p>
              <p className="text-2xl font-bold text-foreground">124</p>

              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span>+8.1%</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
              <ReceiptText className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex h-24 items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Ticket Promedio
              </p>
              <p className="text-2xl font-bold text-foreground">$66.29</p>

              <div className="flex items-center gap-1 text-xs text-rose-600">
                <TrendingDown className="h-4 w-4" />
                <span>-3.2%</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Receipt className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex h-24 items-center justify-between p-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                Stock Bajo
              </p>
              <p className="text-2xl font-bold text-foreground">9</p>

              <div className="flex items-center gap-1 text-xs text-rose-600">
                <TrendingDown className="h-4 w-4" />
                <span>-5.6%</span>
              </div>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <PackageMinus className="h-7 w-7" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="my-4 mb-4 h-auto rounded-lg border border-muted-foreground">
        <ResponsiveContainer width="100%" height={330}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
          >
            <XAxis
              dataKey="day"
              label={{
                value: "Ventas por día",
                position: "bottom",
                offset: 10,
              }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="mt-2 h-[380px] rounded-lg border border-muted-foreground p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
            >
              <XAxis
                dataKey="day"
                label={{
                  value: "Margen de Ganancia por día",
                  position: "bottom",
                  offset: 10,
                }}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="ventas"
                fill="var(--chart-5)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 h-[380px] rounded-lg border border-muted-foreground p-4">
          <h3 className="font-lg mb-2 text-center text-xl text-foreground">
            Porcentaje de Venta por Categoria
          </h3>

          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, bottom: 30, left: 10 }}>
              <Pie
                data={data2}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={3}
              >
                {data2.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
