import Link from "next/link"
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  ClipboardList,
  Coins,
  CreditCard,
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

type EstadoCorte = "Cuadrado" | "Sobrante" | "Faltante"

type Denominacion = {
  valor: number
  etiqueta: string
  cantidad: number
}

type CorteCajaDetalle = {
  id: number
  folio: string
  fecha: string
  hora: string
  usuario: string
  caja: string
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
  observaciones: string
  denominaciones: Denominacion[]
}

const cortesData: CorteCajaDetalle[] = [
  {
    id: 1,
    folio: "CC-20260401-001",
    fecha: "01/04/2026",
    hora: "09:15 PM",
    usuario: "Raudel Casas",
    caja: "Caja principal",
    saldoInicial: 500,
    ventasTotales: 18450.75,
    tarjetaConComision: 6324.5,
    transferencias: 2810,
    devoluciones: 540,
    efectivoDelDia: 9816.25,
    efectivoEsperado: 9816.25,
    efectivoContado: 9816.25,
    diferencia: 0,
    estado: "Cuadrado",
    observaciones:
      "Corte realizado sin incidencias. El efectivo coincidió con el monto esperado del día.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 2 },
      { valor: 500, etiqueta: "$500", cantidad: 3 },
      { valor: 200, etiqueta: "$200", cantidad: 8 },
      { valor: 100, etiqueta: "$100", cantidad: 12 },
      { valor: 50, etiqueta: "$50", cantidad: 10 },
      { valor: 20, etiqueta: "$20", cantidad: 15 },
      { valor: 10, etiqueta: "$10", cantidad: 12 },
      { valor: 5, etiqueta: "$5", cantidad: 8 },
      { valor: 2, etiqueta: "$2", cantidad: 10 },
      { valor: 1, etiqueta: "$1", cantidad: 6 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 5 },
    ],
  },
  {
    id: 2,
    folio: "CC-20260402-001",
    fecha: "02/04/2026",
    hora: "09:09 PM",
    usuario: "Raudel Casas",
    caja: "Caja principal",
    saldoInicial: 500,
    ventasTotales: 17230.5,
    tarjetaConComision: 5910.25,
    transferencias: 2190.25,
    devoluciones: 300,
    efectivoDelDia: 9130,
    efectivoEsperado: 9330,
    efectivoContado: 9510,
    diferencia: 180,
    estado: "Sobrante",
    observaciones:
      "Se detectó sobrante en caja al finalizar el corte. Revisar registro de cambio entregado.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 3 },
      { valor: 500, etiqueta: "$500", cantidad: 4 },
      { valor: 200, etiqueta: "$200", cantidad: 7 },
      { valor: 100, etiqueta: "$100", cantidad: 8 },
      { valor: 50, etiqueta: "$50", cantidad: 12 },
      { valor: 20, etiqueta: "$20", cantidad: 11 },
      { valor: 10, etiqueta: "$10", cantidad: 9 },
      { valor: 5, etiqueta: "$5", cantidad: 6 },
      { valor: 2, etiqueta: "$2", cantidad: 5 },
      { valor: 1, etiqueta: "$1", cantidad: 4 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 2 },
    ],
  },
  {
    id: 3,
    folio: "CC-20260403-001",
    fecha: "03/04/2026",
    hora: "09:22 PM",
    usuario: "Andrea López",
    caja: "Caja principal",
    saldoInicial: 500,
    ventasTotales: 19640.3,
    tarjetaConComision: 6800.1,
    transferencias: 3200.2,
    devoluciones: 450.5,
    efectivoDelDia: 9640,
    efectivoEsperado: 9689.5,
    efectivoContado: 9439,
    diferencia: -250.5,
    estado: "Faltante",
    observaciones:
      "Faltante detectado al cierre. Se recomienda validar devoluciones y movimientos manuales.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 2 },
      { valor: 500, etiqueta: "$500", cantidad: 2 },
      { valor: 200, etiqueta: "$200", cantidad: 9 },
      { valor: 100, etiqueta: "$100", cantidad: 10 },
      { valor: 50, etiqueta: "$50", cantidad: 9 },
      { valor: 20, etiqueta: "$20", cantidad: 10 },
      { valor: 10, etiqueta: "$10", cantidad: 7 },
      { valor: 5, etiqueta: "$5", cantidad: 5 },
      { valor: 2, etiqueta: "$2", cantidad: 7 },
      { valor: 1, etiqueta: "$1", cantidad: 5 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 4 },
    ],
  },
  {
    id: 4,
    folio: "CC-20260404-001",
    fecha: "04/04/2026",
    hora: "09:18 PM",
    usuario: "Carlos Díaz",
    caja: "Caja 2",
    saldoInicial: 500,
    ventasTotales: 14320,
    tarjetaConComision: 4800,
    transferencias: 2070,
    devoluciones: 0,
    efectivoDelDia: 7450,
    efectivoEsperado: 7950,
    efectivoContado: 7950,
    diferencia: 0,
    estado: "Cuadrado",
    observaciones: "Cierre correcto de caja sin diferencias.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 2 },
      { valor: 500, etiqueta: "$500", cantidad: 3 },
      { valor: 200, etiqueta: "$200", cantidad: 6 },
      { valor: 100, etiqueta: "$100", cantidad: 8 },
      { valor: 50, etiqueta: "$50", cantidad: 8 },
      { valor: 20, etiqueta: "$20", cantidad: 10 },
      { valor: 10, etiqueta: "$10", cantidad: 10 },
      { valor: 5, etiqueta: "$5", cantidad: 6 },
      { valor: 2, etiqueta: "$2", cantidad: 5 },
      { valor: 1, etiqueta: "$1", cantidad: 4 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 0 },
    ],
  },
  {
    id: 5,
    folio: "CC-20260405-001",
    fecha: "05/04/2026",
    hora: "09:11 PM",
    usuario: "Raudel Casas",
    caja: "Caja principal",
    saldoInicial: 500,
    ventasTotales: 21100.9,
    tarjetaConComision: 7420.4,
    transferencias: 2645.3,
    devoluciones: 600,
    efectivoDelDia: 11035.2,
    efectivoEsperado: 10940.2,
    efectivoContado: 10845.2,
    diferencia: -95,
    estado: "Faltante",
    observaciones:
      "Diferencia menor en efectivo contado. Se sugiere validación del último bloque de tickets.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 4 },
      { valor: 500, etiqueta: "$500", cantidad: 5 },
      { valor: 200, etiqueta: "$200", cantidad: 8 },
      { valor: 100, etiqueta: "$100", cantidad: 9 },
      { valor: 50, etiqueta: "$50", cantidad: 10 },
      { valor: 20, etiqueta: "$20", cantidad: 11 },
      { valor: 10, etiqueta: "$10", cantidad: 10 },
      { valor: 5, etiqueta: "$5", cantidad: 7 },
      { valor: 2, etiqueta: "$2", cantidad: 8 },
      { valor: 1, etiqueta: "$1", cantidad: 6 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 2 },
    ],
  },
  {
    id: 6,
    folio: "CC-20260406-001",
    fecha: "06/04/2026",
    hora: "09:26 PM",
    usuario: "Mariana Torres",
    caja: "Caja 2",
    saldoInicial: 500,
    ventasTotales: 15890,
    tarjetaConComision: 4950,
    transferencias: 2445,
    devoluciones: 120,
    efectivoDelDia: 8420,
    efectivoEsperado: 8355,
    efectivoContado: 8430,
    diferencia: 75,
    estado: "Sobrante",
    observaciones:
      "Sobrante en caja. Puede corresponder a redondeos o movimientos no capturados.",
    denominaciones: [
      { valor: 1000, etiqueta: "$1000", cantidad: 3 },
      { valor: 500, etiqueta: "$500", cantidad: 3 },
      { valor: 200, etiqueta: "$200", cantidad: 7 },
      { valor: 100, etiqueta: "$100", cantidad: 6 },
      { valor: 50, etiqueta: "$50", cantidad: 8 },
      { valor: 20, etiqueta: "$20", cantidad: 12 },
      { valor: 10, etiqueta: "$10", cantidad: 14 },
      { valor: 5, etiqueta: "$5", cantidad: 10 },
      { valor: 2, etiqueta: "$2", cantidad: 10 },
      { valor: 1, etiqueta: "$1", cantidad: 5 },
      { valor: 0.5, etiqueta: "$0.50", cantidad: 0 },
    ],
  },
]

const formatoMoneda = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function getEstadoBadgeClasses(estado: EstadoCorte) {
  switch (estado) {
    case "Cuadrado":
      return "border-transparent dark:bg-emerald-300 dark:text-emerald-700 bg-red-500 text-emerald-400/40"
    case "Sobrante":
      return "border-transparent dark:bg-amber-100 dark:text-amber-700 bg-amber-950/40 text-amber-400"
    case "Faltante":
      return "border-transparent dark:bg-red-100 dark:text-red-700 bg-red-950/40 text-red-400"
    default:
      return ""
  }
}

function getDiferenciaTextClass(valor: number) {
  if (valor === 0) return "text-emerald-600 dark:text-emerald-400"
  if (valor > 0) return "text-amber-600 dark:text-amber-400"
  return "text-red-500 dark:text-red-400"
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function CorteCajaDetallePage({ params }: Props) {
  const { id } = await params

  const corte = cortesData.find((item) => String(item.id) === id)

  if (!corte) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Corte no encontrado</h1>
        <Button asChild variant="outline">
          <Link href="/admin/corte-caja">
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
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Detalle del corte
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consulta el resumen completo del cierre de caja.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] shadow-none ${getEstadoBadgeClasses(
                  corte.estado
                )}`}
              >
                {corte.estado}
              </Badge>

              <div className="rounded-xl border bg-card px-4 py-2 text-right">
                <p className="text-xs text-muted-foreground">Folio</p>
                <p className="text-sm font-semibold">{corte.folio}</p>
              </div>
            </div>
          </div>

          <div className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ventas totales
                  </p>
                  <p className="mt-1 text-[1.9rem] font-semibold">
                    {formatoMoneda.format(corte.ventasTotales)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tarjeta con comisión
                  </p>
                  <p className="mt-1 text-[1.9rem] font-semibold">
                    {formatoMoneda.format(corte.tarjetaConComision)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transferencias
                  </p>
                  <p className="mt-1 text-[1.9rem] font-semibold">
                    {formatoMoneda.format(corte.transferencias)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Devoluciones</p>
                  <p className="mt-1 text-[1.9rem] font-semibold">
                    {formatoMoneda.format(corte.devoluciones)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-3">
                  <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Efectivo contado
                  </p>
                  <p className="mt-1 text-[1.9rem] font-semibold">
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
          <Card className="flex h-[90%] min-h-0 flex-col shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">Desglose de efectivo</CardTitle>
              </div>
              <CardDescription>
                Cantidades capturadas por denominación en el corte.
              </CardDescription>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto scroll-smooth pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  {corte.denominaciones.map((item) => {
                    const subtotal = item.valor * item.cantidad

                    return (
                      <div
                        key={item.etiqueta}
                        className="rounded-xl border bg-card p-2"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <p className="text-xl font-semibold">
                            {item.etiqueta}
                          </p>
                          <p className="text-sm text-muted-foreground">
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

          <div className="flex h-full min-h-0 flex-col gap-4">
            <Card className="shrink-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-xl">Resumen del corte</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-muted-foreground">Fecha</p>
                    <p className="text-right font-medium">
                      {corte.fecha} · {corte.hora}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-muted-foreground">Saldo inicial</p>
                    <p className="text-right font-medium">
                      {formatoMoneda.format(corte.saldoInicial)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-muted-foreground">Efectivo del día</p>
                    <p className="text-right font-medium">
                      {formatoMoneda.format(corte.efectivoDelDia)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-muted-foreground">Devoluciones</p>
                    <p className="text-right font-medium">
                      - {formatoMoneda.format(corte.devoluciones)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-muted-foreground">Efectivo esperado</p>
                    <p className="text-right text-2xl font-semibold">
                      {formatoMoneda.format(corte.efectivoEsperado)}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
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

            <Card className="h-[31%] shadow-sm">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
