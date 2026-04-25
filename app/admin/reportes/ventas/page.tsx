"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
  Loader2,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type PeriodoReporte =
  | "hoy"
  | "ultimos_7_dias"
  | "ultimos_30_dias"
  | "este_mes"
  | "ultimos_7_meses"
  | "personalizado"

type Resumen = {
  totalVendido: number
  ventasBrutas: number
  comisionTarjeta: number
  totalMargen: number
  totalTickets: number
  totalProductos: number
  ticketPromedio: number
  margenPromedio: number
  diasConVenta: number
  promedioProductosPorTicket: number
}

type MejorDia = {
  fecha: string
  fechaReal?: string
  ventas: number
  margen: number
  tickets: number
  productos: number
} | null

type VentaPorDia = {
  fecha: string
  fechaReal?: string
  ventas: number
  margen: number
  tickets: number
  productos: number
}

type MetodoPago = {
  nombre: string
  total: number
  porcentaje: number
}

type TopProducto = {
  id?: number
  nombre: string
  cantidad: number
  ingreso: number
  margen?: number
}

type ResumenDia = {
  fecha: string
  fechaReal?: string
  tickets: number
  vendidos: number
  margen: number
  productos?: number
}

type ReporteCompletoResponse = {
  filtros?: {
    periodo?: string
    fechaInicio?: string
    fechaFin?: string
    limit?: number
  }
  resumen: Resumen
  mejorDia: MejorDia
  ventasPorDia: VentaPorDia[]
  metodosPago: MetodoPago[]
  topProductos: TopProducto[]
  resumenDias: ResumenDia[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(1)}%`
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatShortDateEs(value?: string) {
  if (!value) return ""

  const date = new Date(`${value}T00:00:00`)

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date)
}

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey?: string
  }>
  label?: string
}

function SalesMarginTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const ventas = payload.find((item) => item.dataKey === "ventas")
  const margen = payload.find((item) => item.dataKey === "margen")

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
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
  const hoy = useMemo(() => new Date(), [])
  const hace7Dias = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 6)
    return date
  }, [])

  const [periodoActivo, setPeriodoActivo] =
    useState<PeriodoReporte>("ultimos_7_dias")
  const [fechaInicio, setFechaInicio] = useState(formatDateInput(hace7Dias))
  const [fechaFin, setFechaFin] = useState(formatDateInput(hoy))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [reporte, setReporte] = useState<ReporteCompletoResponse>({
    resumen: {
      totalVendido: 0,
      totalMargen: 0,
      totalTickets: 0,
      totalProductos: 0,
      ventasBrutas: 0,
      comisionTarjeta: 0,
      ticketPromedio: 0,
      margenPromedio: 0,
      diasConVenta: 0,
      promedioProductosPorTicket: 0,
    },
    mejorDia: null,
    ventasPorDia: [],
    metodosPago: [],
    topProductos: [],
    resumenDias: [],
  })

  const cargarReporte = useCallback(
    async (params?: {
      periodo?: PeriodoReporte
      fechaInicio?: string
      fechaFin?: string
      limit?: number
    }) => {
      try {
        setLoading(true)
        setError("")

        const searchParams = new URLSearchParams()

        if (params?.periodo) {
          searchParams.set("periodo", params.periodo)
        }

        if (params?.periodo === "personalizado") {
          if (params.fechaInicio) {
            searchParams.set("fechaInicio", params.fechaInicio)
          }
          if (params.fechaFin) {
            searchParams.set("fechaFin", params.fechaFin)
          }
        }

        searchParams.set("limit", String(params?.limit || 5))

        const res = await fetch(
          `${API_URL}/reportes/ventas/completo?${searchParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || "No se pudo cargar el reporte")
        }

        setReporte(data)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ocurrió un error al cargar"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    cargarReporte({
      periodo: "ultimos_7_dias",
      limit: 5,
    })
  }, [cargarReporte])

  const aplicarPeriodo = async (periodo: PeriodoReporte) => {
    setPeriodoActivo(periodo)

    if (periodo !== "personalizado") {
      await cargarReporte({
        periodo,
        limit: 5,
      })
    }
  }

  const aplicarRangoPersonalizado = async () => {
    setPeriodoActivo("personalizado")

    await cargarReporte({
      periodo: "personalizado",
      fechaInicio,
      fechaFin,
      limit: 5,
    })
  }

  const resumen = reporte.resumen
  const mejorDia = reporte.mejorDia
  const ventasPorDia = reporte.ventasPorDia
  const metodosPago = reporte.metodosPago
  const topProductos = reporte.topProductos
  const resumenDias = reporte.resumenDias

  const ventasPorDiaChart = ventasPorDia.map((item) => ({
    ...item,
    fechaLabel: formatShortDateEs(item.fechaReal || item.fecha),
  }))

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
            <label className="mr-2 text-sm font-medium">Fecha inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>

          <div className="space-y-1">
            <label className="mr-2 text-sm font-medium">Fecha fin</label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full sm:w-[170px]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              className="gap-2"
              onClick={aplicarRangoPersonalizado}
              disabled={loading || !fechaInicio || !fechaFin}
            >
              {loading && periodoActivo === "personalizado" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
              Aplicar
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={periodoActivo === "hoy" ? "default" : "outline"}
          size="sm"
          onClick={() => aplicarPeriodo("hoy")}
          disabled={loading}
        >
          Hoy
        </Button>

        <Button
          variant={periodoActivo === "ultimos_7_dias" ? "default" : "outline"}
          size="sm"
          onClick={() => aplicarPeriodo("ultimos_7_dias")}
          disabled={loading}
        >
          Últimos 7 días
        </Button>

        <Button
          variant={periodoActivo === "ultimos_30_dias" ? "default" : "outline"}
          size="sm"
          onClick={() => aplicarPeriodo("ultimos_30_dias")}
          disabled={loading}
        >
          Últimos 30 días
        </Button>

        <Button
          variant={periodoActivo === "este_mes" ? "default" : "outline"}
          size="sm"
          onClick={() => aplicarPeriodo("este_mes")}
          disabled={loading}
        >
          Mes actual
        </Button>

        <Button
          variant={periodoActivo === "ultimos_7_meses" ? "default" : "outline"}
          size="sm"
          onClick={() => aplicarPeriodo("ultimos_7_meses")}
          disabled={loading}
        >
          Últimos 7 meses
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el reporte</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="max-h-[850px] space-y-4 overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total vendido Neto
              </CardTitle>
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "Cargando..." : formatCurrency(resumen.totalVendido)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total después de descontar comisión de tarjeta y devoluciones
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
                {loading ? "Cargando..." : formatCurrency(resumen.totalMargen)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercent(resumen.margenPromedio)} sobre venta
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
              <div className="text-2xl font-bold">
                {loading ? "..." : resumen.totalTickets}
              </div>
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
              <div className="text-2xl font-bold">
                {loading ? "..." : resumen.totalProductos}
              </div>
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
              {mejorDia ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatShortDateEs(mejorDia.fechaReal || mejorDia.fecha)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Venta: {formatCurrency(mejorDia.ventas)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Margen: {formatCurrency(mejorDia.margen)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay datos para este periodo
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Comisión pagada</CardTitle>
              <CardDescription>
                Comisión absorbida por cobros con tarjeta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {formatCurrency(resumen.comisionTarjeta)}
              </div>
              <p className="text-sm text-muted-foreground">
                Costo financiero del periodo
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Ventas brutas</CardTitle>
              <CardDescription>
                Total cobrado antes de descontar comisión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {formatCurrency(resumen.ventasBrutas)}
              </div>
              <p className="text-sm text-muted-foreground">
                Venta total registrada en tickets
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
                  data={ventasPorDiaChart}
                  margin={{ top: 6, right: 8, left: -12, bottom: 12 }}
                  barCategoryGap={18}
                >
                  <CartesianGrid
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="fechaLabel"
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

            {!loading && ventasPorDia.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No hay información para mostrar en la gráfica.
              </p>
            ) : null}
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
              {metodosPago.length > 0 ? (
                metodosPago.map((metodo) => (
                  <div
                    key={metodo.nombre}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-medium">{metodo.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {metodo.porcentaje.toFixed(2)}%
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(metodo.total)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay métodos de pago registrados en este periodo.
                </p>
              )}
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
              {topProductos.length > 0 ? (
                topProductos.map((producto, index) => (
                  <div
                    key={`${producto.id ?? producto.nombre}-${index}`}
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
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(producto.ingreso)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Margen: {formatCurrency(producto.margen || 0)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay productos vendidos en este periodo.
                </p>
              )}
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
                  {resumenDias.length > 0 ? (
                    resumenDias.map((dia) => (
                      <tr key={dia.fecha} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          {formatShortDateEs(dia.fechaReal || dia.fecha)}
                        </td>
                        <td className="px-4 py-3">{dia.tickets}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(dia.vendidos)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(dia.margen)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-muted-foreground"
                      >
                        No hay información diaria en este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
