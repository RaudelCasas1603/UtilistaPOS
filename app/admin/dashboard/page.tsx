"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type PeriodoValue = "dia" | "semana" | "mes"

type Periodo = {
  label: string
  value: PeriodoValue
}

type ResumenResponse = {
  periodo: PeriodoValue
  fechaReferencia: string
  rango: {
    inicio: string
    fin: string
  }
  resumen: {
    utilidadRealCaja: number
    tickets: number
    ticketPromedio: number
    stockBajo: number
  }
}

type GraficaVentasItem = {
  label: string
  ventas: number
}

type GraficaVentasResponse = {
  periodo: PeriodoValue
  descripcion: string
  data: GraficaVentasItem[]
}

type GraficaMargenItem = {
  label: string
  margen: number
}

type GraficaMargenResponse = {
  periodo: PeriodoValue
  descripcion: string
  data: GraficaMargenItem[]
}

type CategoriaItem = {
  name: string
  value: number
}

type CategoriasResponse = {
  periodo: PeriodoValue
  descripcion: string
  data: CategoriaItem[]
}

type CustomBarTooltipProps = {
  active?: boolean
  payload?: Array<{
    value?: number
  }>
  label?: string
  prefix?: string
  bulletColor?: string
}

type CustomPieTooltipProps = {
  active?: boolean
  payload?: Array<{
    value?: number
    name?: string
  }>
}

const periodos: Periodo[] = [
  { label: "Día", value: "dia" },
  { label: "Semana", value: "semana" },
  { label: "Mes", value: "mes" },
]

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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(Number(value || 0))
}

function formatLabelDate(value: string) {
  if (!value) return ""

  if (/^\d{2}:\d{2}$/.test(value)) return value

  if (["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].includes(value)) {
    return value
  }

  if (/^\d{1,2}$/.test(value)) {
    const day = Number(value)
    const today = new Date()
    const date = new Date(today.getFullYear(), today.getMonth(), day)

    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
    }).format(date)
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "short",
    }).format(parsed)
  }

  return value
}

function CustomBarTooltip({
  active,
  payload,
  label,
  prefix = "Ventas",
  bulletColor = "#6366f1",
}: CustomBarTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]

  return (
    <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-sm font-semibold text-black">
        {formatLabelDate(label || "")}
      </p>

      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: bulletColor }}
        />
        <span className="text-sm text-black">{prefix}:</span>
        <span className="text-sm font-bold text-black">
          {formatCurrency(Number(item.value || 0))}
        </span>
      </div>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: CustomPieTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]

  return (
    <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-sm font-semibold text-black">{item.name || ""}</p>

      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#6366f1" }}
        />
        <span className="text-sm text-black">Porcentaje:</span>
        <span className="text-sm font-bold text-black">
          {Number(item.value || 0)}%
        </span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<Periodo | null>(
    periodos[0]
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [resumen, setResumen] = useState<ResumenResponse | null>(null)
  const [graficaVentas, setGraficaVentas] =
    useState<GraficaVentasResponse | null>(null)
  const [graficaMargen, setGraficaMargen] =
    useState<GraficaMargenResponse | null>(null)
  const [categorias, setCategorias] = useState<CategoriasResponse | null>(null)

  const periodoActual = selectedPeriod?.value ?? "dia"

  useEffect(() => {
    let cancelado = false

    async function cargarDashboard() {
      try {
        setLoading(true)
        setError(null)

        const [resResumen, resVentas, resMargen, resCategorias] =
          await Promise.all([
            fetch(`${API_URL}/dashboard/resumen?periodo=${periodoActual}`, {
              cache: "no-store",
            }),
            fetch(
              `${API_URL}/dashboard/grafica-ventas?periodo=${periodoActual}`,
              {
                cache: "no-store",
              }
            ),
            fetch(
              `${API_URL}/dashboard/grafica-margen?periodo=${periodoActual}`,
              {
                cache: "no-store",
              }
            ),
            fetch(
              `${API_URL}/dashboard/ventas-categorias?periodo=${periodoActual}`,
              {
                cache: "no-store",
              }
            ),
          ])

        if (!resResumen.ok) {
          throw new Error("No se pudo obtener el resumen del dashboard")
        }
        if (!resVentas.ok) {
          throw new Error("No se pudo obtener la gráfica de ventas")
        }
        if (!resMargen.ok) {
          throw new Error("No se pudo obtener la gráfica de margen")
        }
        if (!resCategorias.ok) {
          throw new Error("No se pudo obtener la gráfica por categoría")
        }

        const resumenJson: ResumenResponse = await resResumen.json()
        const ventasJson: GraficaVentasResponse = await resVentas.json()
        const margenJson: GraficaMargenResponse = await resMargen.json()
        const categoriasJson: CategoriasResponse = await resCategorias.json()

        if (cancelado) return

        setResumen(resumenJson)
        setGraficaVentas(ventasJson)
        setGraficaMargen(margenJson)
        setCategorias(categoriasJson)
      } catch (err) {
        if (cancelado) return
        const mensaje =
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar el dashboard"
        setError(mensaje)
      } finally {
        if (!cancelado) {
          setLoading(false)
        }
      }
    }

    cargarDashboard()

    return () => {
      cancelado = true
    }
  }, [periodoActual])

  const ventasData = useMemo(() => {
    return (
      graficaVentas?.data.map((item) => ({
        day: item.label,
        ventas: Number(item.ventas || 0),
      })) || []
    )
  }, [graficaVentas])

  const margenData = useMemo(() => {
    return (
      graficaMargen?.data.map((item) => ({
        day: item.label,
        margen: Number(item.margen || 0),
      })) || []
    )
  }, [graficaMargen])

  const categoriasData = useMemo(() => {
    return (
      categorias?.data.map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      })) || []
    )
  }, [categorias])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 space-y-3 px-1 pb-3 sm:px-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold sm:text-2xl xl:text-3xl">
            Dashboard
          </h1>

          <div className="flex items-center gap-2 sm:justify-center">
            <CalendarClockIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <div className="w-full min-w-[170px] sm:w-46">
              <Combobox
                items={periodos}
                value={selectedPeriod}
                onValueChange={(period: Periodo | null) => {
                  setSelectedPeriod(period)
                }}
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

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive sm:p-4">
            {error}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-3 sm:space-y-4 xl:space-y-5">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:max-w-[1150px]">
            <Card className="border-border/60 bg-card shadow-md transition-all hover:shadow-lg">
              <CardContent className="flex h-20 items-center justify-between gap-3 p-3 sm:h-24 sm:p-4 xl:h-24">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                    Ventas Netas
                  </p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-xl xl:text-2xl">
                    {loading
                      ? "..."
                      : formatCurrency(resumen?.resumen.utilidadRealCaja || 0)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 sm:h-14 sm:w-14">
                  <HandCoins className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex h-20 items-center justify-between gap-3 p-3 sm:h-24 sm:p-4 xl:h-24">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                    Tickets
                  </p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-xl xl:text-2xl">
                    {loading
                      ? "..."
                      : formatCompactNumber(resumen?.resumen.tickets || 0)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 sm:h-14 sm:w-14">
                  <ReceiptText className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex h-20 items-center justify-between gap-3 p-3 sm:h-24 sm:p-4 xl:h-24">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                    Ticket Promedio
                  </p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-xl xl:text-2xl">
                    {loading
                      ? "..."
                      : formatCurrency(resumen?.resumen.ticketPromedio || 0)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 sm:h-14 sm:w-14">
                  <Receipt className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex h-20 items-center justify-between gap-3 p-3 sm:h-24 sm:p-4 xl:h-24">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">
                    Stock Bajo
                  </p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-xl xl:text-2xl">
                    {loading
                      ? "..."
                      : formatCompactNumber(resumen?.resumen.stockBajo || 0)}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 sm:h-14 sm:w-14">
                  <PackageMinus className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-[260px] rounded-lg border border-muted-foreground p-1 sm:h-[310px] sm:p-2 xl:h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ventasData}
                margin={{ top: 10, right: 14, left: 0, bottom: 38 }}
              >
                <XAxis
                  dataKey="day"
                  tickFormatter={formatLabelDate}
                  tick={{ fontSize: 12 }}
                  label={{
                    value:
                      graficaVentas?.descripcion ||
                      `Ventas por ${selectedPeriod?.label.toLowerCase()}`,
                    position: "bottom",
                    offset: 10,
                    fontSize: 12,
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} width={50} />
                <Tooltip
                  content={
                    <CustomBarTooltip prefix="Ventas" bulletColor="#a855f7" />
                  }
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar
                  dataKey="ventas"
                  fill="var(--chart-12)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-5">
            <div className="h-[290px] rounded-lg border border-muted-foreground p-2 sm:h-[340px] sm:p-3 xl:h-[380px] xl:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={margenData}
                  margin={{ top: 10, right: 14, left: 0, bottom: 38 }}
                >
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatLabelDate}
                    tick={{ fontSize: 12 }}
                    label={{
                      value:
                        graficaMargen?.descripcion ||
                        `Margen de ganancia por ${selectedPeriod?.label.toLowerCase()}`,
                      position: "bottom",
                      offset: 10,
                      fontSize: 12,
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} width={50} />
                  <Tooltip
                    content={
                      <CustomBarTooltip prefix="Margen" bulletColor="#f59e0b" />
                    }
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar
                    dataKey="margen"
                    fill="var(--chart-5)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[290px] rounded-lg border border-muted-foreground p-2 sm:h-[340px] sm:p-3 xl:h-[380px] xl:p-4">
              <h3 className="mb-1 text-center text-base text-foreground sm:mb-2 sm:text-lg xl:text-xl">
                {categorias?.descripcion || "Porcentaje de Venta por Categoría"}
              </h3>

              <ResponsiveContainer width="100%" height="92%">
                <PieChart margin={{ top: 6, right: 4, bottom: 26, left: 4 }}>
                  <Pie
                    data={categoriasData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="45%"
                    outerRadius="70%"
                    paddingAngle={3}
                  >
                    {categoriasData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    content={<CustomPieTooltip />}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={32}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
