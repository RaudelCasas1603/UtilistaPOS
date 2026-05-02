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
    <div className="h-[calc(100vh-64px)] min-h-0 w-full overflow-hidden bg-background">
      <div className="h-full w-full overflow-x-hidden overflow-y-auto px-3 pt-3 pb-10 lg:px-4 lg:pt-4 lg:pb-12 xl:px-5 xl:pt-5 xl:pb-14">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3">
          {/* Header */}
          <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight xl:text-2xl">
                Reporte de ventas
              </h1>
              <p className="text-xs text-muted-foreground xl:text-sm">
                Consulta el rendimiento de ventas por rango de fechas.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:flex-wrap sm:items-end lg:w-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium">Fecha inicio</label>
                <Input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="h-9 w-full text-xs sm:w-[150px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Fecha fin</label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="h-9 w-full text-xs sm:w-[150px]"
                />
              </div>

              <Button
                className="h-9 gap-2 px-3 text-xs"
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

          {/* Filtros */}
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant={periodoActivo === "hoy" ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => aplicarPeriodo("hoy")}
              disabled={loading}
            >
              Hoy
            </Button>

            <Button
              variant={
                periodoActivo === "ultimos_7_dias" ? "default" : "outline"
              }
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => aplicarPeriodo("ultimos_7_dias")}
              disabled={loading}
            >
              Últimos 7 días
            </Button>

            <Button
              variant={
                periodoActivo === "ultimos_30_dias" ? "default" : "outline"
              }
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => aplicarPeriodo("ultimos_30_dias")}
              disabled={loading}
            >
              Últimos 30 días
            </Button>

            <Button
              variant={periodoActivo === "este_mes" ? "default" : "outline"}
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => aplicarPeriodo("este_mes")}
              disabled={loading}
            >
              Mes actual
            </Button>

            <Button
              variant={
                periodoActivo === "ultimos_7_meses" ? "default" : "outline"
              }
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => aplicarPeriodo("ultimos_7_meses")}
              disabled={loading}
            >
              Últimos 7 meses
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive" className="shrink-0">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al cargar el reporte</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {/* Cards resumen */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="truncate text-xs font-medium">
                  Total vendido Neto
                </CardTitle>
                <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {loading
                    ? "Cargando..."
                    : formatCurrency(resumen.totalVendido)}
                </div>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">
                  Neto después de comisiones y devoluciones
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="truncate text-xs font-medium">
                  Margen total
                </CardTitle>
                <BadgeDollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {loading
                    ? "Cargando..."
                    : formatCurrency(resumen.totalMargen)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatPercent(resumen.margenPromedio)} sobre venta
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="truncate text-xs font-medium">
                  Número de tickets
                </CardTitle>
                <Receipt className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {loading ? "..." : resumen.totalTickets}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatCurrency(resumen.ticketPromedio)} por ticket
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
                <CardTitle className="truncate text-xs font-medium">
                  Productos vendidos
                </CardTitle>
                <ShoppingBasket className="h-4 w-4 shrink-0 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {loading ? "..." : resumen.totalProductos}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {resumen.promedioProductosPorTicket.toFixed(1)} por ticket
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cards secundarias */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">Mejor día de venta</CardTitle>
                <CardDescription className="text-xs">
                  Mayor ingreso del rango
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0">
                {mejorDia ? (
                  <>
                    <div className="text-lg font-bold xl:text-xl">
                      {formatShortDateEs(mejorDia.fechaReal || mejorDia.fecha)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Venta: {formatCurrency(mejorDia.ventas)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Margen: {formatCurrency(mejorDia.margen)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No hay datos para este periodo
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">Comisión pagada</CardTitle>
                <CardDescription className="text-xs">
                  Cobros con tarjeta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {formatCurrency(resumen.comisionTarjeta)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Costo financiero del periodo
                </p>
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">Ventas brutas</CardTitle>
                <CardDescription className="text-xs">
                  Antes de descontar comisión
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 p-3 pt-0">
                <div className="truncate text-lg font-bold xl:text-xl">
                  {formatCurrency(resumen.ventasBrutas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Venta total registrada
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfica */}
          <Card className="min-w-0 overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm xl:text-base">
                Ventas y margen por día
              </CardTitle>
              <CardDescription className="text-xs">
                Comparativa diaria del negocio
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 pt-0">
              <div className="h-[280px] min-h-[280px] w-full overflow-hidden xl:h-[320px] xl:min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ventasPorDiaChart}
                    margin={{ top: 8, right: 12, left: -10, bottom: 10 }}
                    barCategoryGap={18}
                  >
                    <CartesianGrid
                      stroke="hsl(var(--border))"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="fechaLabel"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={45}
                    />
                    <Tooltip
                      content={<SalesMarginTooltip />}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar
                      dataKey="ventas"
                      name="Ventas"
                      fill="#6366f1"
                      radius={[8, 8, 0, 0]}
                      activeBar={false}
                    />
                    <Bar
                      dataKey="margen"
                      name="Margen"
                      fill="#22c55e"
                      radius={[8, 8, 0, 0]}
                      activeBar={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {!loading && ventasPorDia.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  No hay información para mostrar en la gráfica.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Listas */}
          <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">Métodos de pago</CardTitle>
                <CardDescription className="text-xs">
                  Ingresos por forma de cobro
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 p-3 pt-0">
                {metodosPago.length > 0 ? (
                  metodosPago.map((metodo) => (
                    <div
                      key={metodo.nombre}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-lg border p-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {metodo.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {metodo.porcentaje.toFixed(2)}%
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold">
                        {formatCurrency(metodo.total)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No hay métodos de pago registrados.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 border-border/60 shadow-sm">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">
                  Top productos vendidos
                </CardTitle>
                <CardDescription className="text-xs">
                  Artículos con mayor movimiento
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 p-3 pt-0">
                {topProductos.length > 0 ? (
                  topProductos.map((producto, index) => (
                    <div
                      key={`${producto.id ?? producto.nombre}-${index}`}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-lg border p-2"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {producto.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {producto.cantidad} piezas vendidas
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(producto.ingreso)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Margen: {formatCurrency(producto.margen || 0)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No hay productos vendidos.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabla final */}
          <Card className="mb-4 min-w-0 overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm">Resumen diario</CardTitle>
              <CardDescription className="text-xs">
                Vista compacta de desempeño por día
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 pt-0">
              <div className="w-full overflow-hidden rounded-lg border">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[640px] text-xs">
                    <thead className="bg-muted/40">
                      <tr className="border-b text-left">
                        <th className="px-3 py-2 font-medium whitespace-nowrap">
                          Fecha
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">
                          Tickets
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">
                          Total vendido
                        </th>
                        <th className="px-3 py-2 font-medium whitespace-nowrap">
                          Margen
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {resumenDias.length > 0 ? (
                        resumenDias.map((dia) => (
                          <tr
                            key={dia.fecha}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-2 whitespace-nowrap">
                              {formatShortDateEs(dia.fechaReal || dia.fecha)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {dia.tickets}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {formatCurrency(dia.vendidos)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {formatCurrency(dia.margen)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-3 py-6 text-center text-muted-foreground"
                          >
                            No hay información diaria en este periodo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
