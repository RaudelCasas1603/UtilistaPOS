"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  CalendarDays,
  Wallet,
  Receipt,
  BadgeDollarSign,
  ShoppingBasket,
  Users,
  TrendingUp,
  Package,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts"

const ventasPorDia = [
  { fecha: "01 Abr", ventas: 4250, margen: 1380, tickets: 18, productos: 64 },
  { fecha: "02 Abr", ventas: 5100, margen: 1720, tickets: 22, productos: 79 },
  { fecha: "03 Abr", ventas: 3890, margen: 1210, tickets: 16, productos: 55 },
  { fecha: "04 Abr", ventas: 6400, margen: 2140, tickets: 27, productos: 91 },
  { fecha: "05 Abr", ventas: 5920, margen: 1980, tickets: 25, productos: 84 },
  { fecha: "06 Abr", ventas: 4580, margen: 1490, tickets: 19, productos: 68 },
  { fecha: "07 Abr", ventas: 7100, margen: 2460, tickets: 30, productos: 102 },
]

const metodosPago = [
  { nombre: "Efectivo", total: "$14,820", porcentaje: "39%" },
  { nombre: "Tarjeta", total: "$17,430", porcentaje: "46%" },
  { nombre: "Transferencia", total: "$5,520", porcentaje: "15%" },
]

const topProductos = [
  { nombre: "Cuaderno profesional", cantidad: 42, ingreso: "$3,780" },
  { nombre: "Lápiz adhesivo", cantidad: 35, ingreso: "$1,925" },
  { nombre: "Juego geométrico", cantidad: 28, ingreso: "$2,240" },
  { nombre: "Plumones", cantidad: 24, ingreso: "$2,880" },
  { nombre: "Resma carta", cantidad: 19, ingreso: "$2,470" },
]

const resumenDias = [
  { fecha: "01 Abr", tickets: 18, vendidos: "$4,250", margen: "$1,380" },
  { fecha: "02 Abr", tickets: 22, vendidos: "$5,100", margen: "$1,720" },
  { fecha: "03 Abr", tickets: 16, vendidos: "$3,890", margen: "$1,210" },
  { fecha: "04 Abr", tickets: 27, vendidos: "$6,400", margen: "$2,140" },
  { fecha: "05 Abr", tickets: 25, vendidos: "$5,920", margen: "$1,980" },
  { fecha: "06 Abr", tickets: 19, vendidos: "$4,580", margen: "$1,490" },
  { fecha: "07 Abr", tickets: 30, vendidos: "$7,100", margen: "$2,460" },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value)
}

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey?: string
    name?: string
    color?: string
    payload?: {
      fecha?: string
      ventas?: number
      margen?: number
    }
  }>
  label?: string
}

function SalesMarginTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const ventas = payload.find((item) => item.dataKey === "ventas")
  const margen = payload.find((item) => item.dataKey === "margen")

  return (
    <div className="bg-popover text-popover-foreground rounded-xl border border-border bg-border px-3 py-2 shadow-md">
      <p className="mb-2 text-sm font-semibold">{label}</p>

      {ventas && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#6366f1" }}
            />
            <span className="text-sm text-muted-foreground">Ventas</span>
          </div>
          <span className="text-sm font-bold">
            {formatCurrency(ventas.value)}
          </span>
        </div>
      )}

      {margen && (
        <div className="mt-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#22c55e" }}
            />
            <span className="text-sm text-muted-foreground">Margen</span>
          </div>
          <span className="text-sm font-bold">
            {formatCurrency(margen.value)}
          </span>
        </div>
      )}
    </div>
  )
}

export default function ReporteVentasPage() {
  const [fechaInicio, setFechaInicio] = useState("2026-04-01")
  const [fechaFin, setFechaFin] = useState("2026-04-07")

  const resumen = useMemo(() => {
    const totalVendido = ventasPorDia.reduce(
      (acc, item) => acc + item.ventas,
      0
    )
    const totalMargen = ventasPorDia.reduce((acc, item) => acc + item.margen, 0)
    const totalTickets = ventasPorDia.reduce(
      (acc, item) => acc + item.tickets,
      0
    )
    const totalProductos = ventasPorDia.reduce(
      (acc, item) => acc + item.productos,
      0
    )

    const ticketPromedio = totalTickets > 0 ? totalVendido / totalTickets : 0
    const margenPromedio =
      totalVendido > 0 ? (totalMargen / totalVendido) * 100 : 0
    const diasConVenta = ventasPorDia.filter((item) => item.ventas > 0).length
    const promedioProductosPorTicket =
      totalTickets > 0 ? totalProductos / totalTickets : 0

    return {
      totalVendido,
      totalMargen,
      totalTickets,
      totalProductos,
      ticketPromedio,
      margenPromedio,
      diasConVenta,
      promedioProductosPorTicket,
    }
  }, [])

  const mejorDia = useMemo(() => {
    return [...ventasPorDia].sort((a, b) => b.ventas - a.ventas)[0]
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reporte de ventas
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulta el rendimiento de ventas por rango de fechas.
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Fecha fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>

          <div className="flex gap-2">
            <Button className="gap-2">
              <CalendarDays className="h-4 w-4" />
              Aplicar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          Hoy
        </Button>
        <Button variant="outline" size="sm">
          Últimos 7 días
        </Button>
        <Button variant="outline" size="sm">
          Últimos 30 días
        </Button>
        <Button variant="outline" size="sm">
          Mes actual
        </Button>
      </div>
      <div className="max-h-[850px] space-y-4 overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total vendido
              </CardTitle>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(resumen.totalVendido)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ingreso total del periodo seleccionado
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Margen total
              </CardTitle>
              <BadgeDollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(resumen.totalMargen)}
              </div>
              <p className="text-xs text-muted-foreground">
                {resumen.margenPromedio.toFixed(1)}% sobre venta
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Número de tickets
              </CardTitle>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(resumen.ticketPromedio)} por ticket
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos vendidos
              </CardTitle>
              <ShoppingBasket className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.totalProductos}</div>
              <p className="text-xs text-muted-foreground">
                {resumen.promedioProductosPorTicket.toFixed(1)} por ticket
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Mejor día de venta</CardTitle>
              <CardDescription>
                El día con mayor ingreso dentro del rango
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{mejorDia.fecha}</div>
              <p className="text-sm text-muted-foreground">
                Venta: {formatCurrency(mejorDia.ventas)}
              </p>
              <p className="text-sm text-muted-foreground">
                Margen: {formatCurrency(mejorDia.margen)}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Días con venta</CardTitle>
              <CardDescription>
                Actividad comercial en el periodo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{resumen.diasConVenta}</div>
              <p className="text-sm text-muted-foreground">
                Días que registraron al menos una venta
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Clientes atendidos</CardTitle>
              <CardDescription>
                Métrica útil para el análisis operativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">124</div>
              <p className="text-sm text-muted-foreground">
                Puedes sustituirlo por clientes únicos después
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Ventas y margen por día</CardTitle>
            <CardDescription>
              Comparativa diaria para identificar comportamiento del negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ventasPorDia}
                  margin={{ top: 6, right: 8, left: -12, bottom: 12 }}
                  barCategoryGap={18}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="fecha"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<SalesMarginTooltip />}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="ventas"
                    name="Ventas"
                    fill="#6366f1"
                    radius={[10, 10, 0, 0]}
                    activeBar={false}
                  />
                  <Bar
                    dataKey="margen"
                    name="Margen"
                    fill="#22c55e"
                    radius={[10, 10, 0, 0]}
                    activeBar={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Métodos de pago</CardTitle>
              <CardDescription>
                Distribución de ingresos por forma de cobro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metodosPago.map((metodo) => (
                <div
                  key={metodo.nombre}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{metodo.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {metodo.porcentaje}
                    </p>
                  </div>
                  <p className="font-semibold">{metodo.total}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Top productos vendidos</CardTitle>
              <CardDescription>
                Los artículos con mayor movimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProductos.map((producto, index) => (
                <div
                  key={producto.nombre}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {producto.cantidad} piezas vendidas
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{producto.ingreso}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Resumen diario</CardTitle>
            <CardDescription>
              Vista compacta de desempeño por día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Tickets</th>
                    <th className="px-4 py-3 font-medium">Total vendido</th>
                    <th className="px-4 py-3 font-medium">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenDias.map((dia) => (
                    <tr key={dia.fecha} className="border-b last:border-0">
                      <td className="px-4 py-3">{dia.fecha}</td>
                      <td className="px-4 py-3">{dia.tickets}</td>
                      <td className="px-4 py-3">{dia.vendidos}</td>
                      <td className="px-4 py-3">{dia.margen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
