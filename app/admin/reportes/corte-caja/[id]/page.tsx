"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import ReimprimirCorteButton from "./ReimprimirCorteButton"
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  ClipboardList,
  Coins,
  CreditCard,
  Loader2,
  Receipt,
  RefreshCcw,
  User,
  Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type EstadoCorte = "Cuadrado" | "Sobrante" | "Faltante"

type ApiDetalleCorte = {
  id: number
  id_corte_caja: number
  denominacion: string
  cantidad: number
  subtotal: string
}

type ApiCorteCaja = {
  id: number
  fecha_corte: string
  hora_corte: string
  fecha_hora_corte: string
  id_usuario: number
  total_ventas: string
  total_tarjeta: string
  total_transferencias: string
  total_efectivo: string
  total_devoluciones: string
  total_tickets: number
  saldo_inicial: string
  efectivo_esperado: string
  efectivo_contado: string
  diferencia: string
  monto_sobrante: string
  monto_faltante: string
  tipo_resultado: "cuadrado" | "sobrante" | "faltante"
  estado_corte: "abierto" | "cerrado"
  observaciones: string
  created_at: string
  detalle: ApiDetalleCorte[]
}

type CorteCajaDetalle = {
  id: number
  folio: string
  fecha: string
  hora: string
  usuario: string
  saldoInicial: number
  ventasTotales: number
  tarjetaConComision: number
  transferencias: number
  devoluciones: number
  efectivoDelDia: number
  efectivoEsperado: number
  efectivoContado: number
  diferencia: number
  estado: EstadoCorte
  estadoCorte: string
  totalTickets: number
  observaciones: string
  detalle: ApiDetalleCorte[]
}

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function toNumber(value: string | number | null | undefined) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Sin fecha"

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Sin hora"

  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

function getEstadoLabel(value: ApiCorteCaja["tipo_resultado"]): EstadoCorte {
  if (value === "sobrante") return "Sobrante"
  if (value === "faltante") return "Faltante"
  return "Cuadrado"
}

function getEstadoBadgeClasses(estado: EstadoCorte) {
  switch (estado) {
    case "Cuadrado":
      return "border-transparent bg-emerald-100 text-emerald-700"
    case "Sobrante":
      return "border-transparent bg-amber-100 text-amber-700"
    case "Faltante":
      return "border-transparent bg-red-100 text-red-700"
    default:
      return ""
  }
}

function getDiferenciaTextClass(valor: number) {
  if (valor === 0) return "text-emerald-600 dark:text-emerald-400"
  if (valor > 0) return "text-amber-600 dark:text-amber-400"
  return "text-red-500 dark:text-red-400"
}

function mapCorte(api: ApiCorteCaja): CorteCajaDetalle {
  const fechaBase = api.fecha_hora_corte || api.created_at || api.fecha_corte

  return {
    id: api.id,
    folio: `CC-${api.id.toString().padStart(5, "0")}`,
    fecha: formatDate(fechaBase),
    hora: formatTime(fechaBase),
    usuario: `Usuario ${api.id_usuario}`,
    saldoInicial: toNumber(api.saldo_inicial),
    ventasTotales: toNumber(api.total_ventas),
    tarjetaConComision: toNumber(api.total_tarjeta),
    transferencias: toNumber(api.total_transferencias),
    devoluciones: toNumber(api.total_devoluciones),
    efectivoDelDia: toNumber(api.total_efectivo),
    efectivoEsperado: toNumber(api.efectivo_esperado),
    efectivoContado: toNumber(api.efectivo_contado),
    diferencia: toNumber(api.diferencia),
    estado: getEstadoLabel(api.tipo_resultado),
    estadoCorte: api.estado_corte,
    totalTickets: api.total_tickets,
    observaciones: api.observaciones || "Sin observaciones.",
    detalle: api.detalle || [],
  }
}

export default function CorteCajaDetallePage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const [corte, setCorte] = React.useState<CorteCajaDetalle | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function fetchCorte() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`${API_URL}/cortes-caja/${id}`, {
          cache: "no-store",
        })

        if (!res.ok) {
          throw new Error("No se pudo cargar el corte")
        }

        const data: ApiCorteCaja = await res.json()
        setCorte(mapCorte(data))
      } catch (error) {
        console.error(error)
        setError("No se pudo cargar el detalle del corte.")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchCorte()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando detalle del corte...
        </div>
      </div>
    )
  }

  if (error || !corte) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Corte no encontrado</h1>
        <p className="text-sm text-muted-foreground">{error}</p>

        <Button asChild variant="outline">
          <Link href="/admin/reportes/corte-caja">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cortes
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-1rem)] overflow-hidden p-4">
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex shrink-0 flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Detalle del corte
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulta el resumen completo del cierre de caja.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ReimprimirCorteButton corteId={corte.id} />

              <Button asChild variant="outline" size="sm">
                <Link href="/admin/reportes/corte-caja">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ventas totales
                  </p>
                  <p className="mt-1 text-[1.7rem] font-semibold">
                    {formatoMoneda.format(corte.ventasTotales)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tarjeta</p>
                  <p className="mt-1 text-[1.7rem] font-semibold">
                    {formatoMoneda.format(corte.tarjetaConComision)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transferencias
                  </p>
                  <p className="mt-1 text-[1.7rem] font-semibold">
                    {formatoMoneda.format(corte.transferencias)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Devoluciones</p>
                  <p className="mt-1 text-[1.7rem] font-semibold">
                    {formatoMoneda.format(corte.devoluciones)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Efectivo contado
                  </p>
                  <p className="mt-1 text-[1.7rem] font-semibold">
                    {formatoMoneda.format(corte.efectivoContado)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Card className="flex min-h-0 flex-col shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">Desglose de efectivo</CardTitle>
              </div>
              <CardDescription>
                Cantidades capturadas por denominación en el corte.
              </CardDescription>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Saldo inicial</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatoMoneda.format(corte.saldoInicial)}
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Efectivo vendido hoy
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {formatoMoneda.format(corte.efectivoDelDia)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-base font-semibold">Billetes y monedas</p>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {corte.detalle.map((item) => {
                    const denominacion = toNumber(item.denominacion)
                    const subtotal = toNumber(item.subtotal)

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border bg-card p-3"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <p className="text-xl font-semibold">
                            {formatoMoneda.format(denominacion)}
                          </p>
                          <p className="text-right text-sm text-muted-foreground">
                            Subtotal: {formatoMoneda.format(subtotal)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-muted/30 px-4 py-3">
                          <p className="text-sm text-muted-foreground">
                            Cantidad
                          </p>
                          <p className="mt-1 text-xl font-semibold">
                            {item.cantidad}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex min-h-0 flex-col gap-4">
            <Card className="shrink-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-xl">Resumen del corte</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Fecha</p>
                    <p className="text-right font-medium">
                      {corte.fecha} · {corte.hora}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Tickets</p>
                    <p className="text-right font-medium">
                      {corte.totalTickets}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Saldo inicial</p>
                    <p className="text-right font-medium">
                      {formatoMoneda.format(corte.saldoInicial)}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Efectivo del día</p>
                    <p className="text-right font-medium">
                      {formatoMoneda.format(corte.efectivoDelDia)}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Efectivo esperado</p>
                    <p className="text-right text-2xl font-semibold">
                      {formatoMoneda.format(corte.efectivoEsperado)}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4">
                    <p className="text-muted-foreground">Efectivo contado</p>
                    <p className="text-right text-2xl font-semibold">
                      {formatoMoneda.format(corte.efectivoContado)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold">Diferencia</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {corte.diferencia === 0
                          ? "La caja cerró correctamente."
                          : corte.diferencia > 0
                            ? "Hay sobrante en caja."
                            : "Hay faltante en caja."}
                      </p>
                    </div>

                    <p
                      className={`text-right text-[1.75rem] font-semibold ${getDiferenciaTextClass(
                        corte.diferencia
                      )}`}
                    >
                      {corte.diferencia > 0 ? "+" : ""}
                      {formatoMoneda.format(corte.diferencia)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold">
                  Información del cierre
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <div className="rounded-lg bg-muted p-1.5">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-muted-foreground">
                      Fecha y hora
                    </p>
                    <p className="text-sm font-medium">
                      {corte.fecha} · {corte.hora}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <div className="rounded-lg bg-muted p-1.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-muted-foreground">Usuario</p>
                    <p className="text-sm font-medium">{corte.usuario}</p>
                  </div>
                </div>

                <div className="rounded-lg border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="mt-1 text-sm font-medium">
                    {corte.observaciones}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
