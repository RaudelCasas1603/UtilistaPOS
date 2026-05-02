"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Banknote,
  Calculator,
  CheckCircle2,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  ReceiptText,
  RotateCcw,
  Wallet,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type ResumenDia = {
  totalVentas: number
  cobrosTarjetaConComision: number
  transferencias: number
  pagosEfectivo: number
  devoluciones: number
  tickets: number
}

type Denominaciones = {
  mil: string
  quinientos: string
  doscientos: string
  cien: string
  cincuenta: string
  veinte: string
  diez: string
  cinco: string
  dos: string
  uno: string
}

const itemsDenominacion = [
  { key: "mil", label: "$1,000", value: 1000 },
  { key: "quinientos", label: "$500", value: 500 },
  { key: "doscientos", label: "$200", value: 200 },
  { key: "cien", label: "$100", value: 100 },
  { key: "cincuenta", label: "$50", value: 50 },
  { key: "veinte", label: "$20", value: 20 },
  { key: "diez", label: "$10", value: 10 },
  { key: "cinco", label: "$5", value: 5 },
  { key: "dos", label: "$2", value: 2 },
  { key: "uno", label: "$1", value: 1 },
] as const

function toNumber(value: string | number | null | undefined) {
  const number = Number(value)
  return Number.isNaN(number) ? 0 : number
}

function formatMoney(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
}

export default function CorteCajaPage() {
  const [resumenDia, setResumenDia] = useState<ResumenDia>({
    totalVentas: 0,
    cobrosTarjetaConComision: 0,
    transferencias: 0,
    pagosEfectivo: 0,
    devoluciones: 0,
    tickets: 0,
  })

  const [saldoInicial, setSaldoInicial] = useState("0")

  const [denominaciones, setDenominaciones] = useState<Denominaciones>({
    mil: "",
    quinientos: "",
    doscientos: "",
    cien: "",
    cincuenta: "",
    veinte: "",
    diez: "",
    cinco: "",
    dos: "",
    uno: "",
  })

  const [loadingResumen, setLoadingResumen] = useState(true)
  const [loadingCorte, setLoadingCorte] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cargarResumenDia = useCallback(async () => {
    try {
      setLoadingResumen(true)
      setError(null)

      const res = await fetch(`${API_URL}/cortes-caja/resumen-dia`, {
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al cargar resumen del día")
      }

      setResumenDia({
        totalVentas: Number(data.totalVentas || 0),
        cobrosTarjetaConComision: Number(data.cobrosTarjetaConComision || 0),
        transferencias: Number(data.transferencias || 0),
        pagosEfectivo: Number(data.pagosEfectivo || 0),
        devoluciones: Number(data.devoluciones || 0),
        tickets: Number(data.tickets || 0),
      })
    } catch (error) {
      console.error(error)
      setError(
        error instanceof Error
          ? error.message
          : "Error al cargar resumen del día"
      )
    } finally {
      setLoadingResumen(false)
    }
  }, [])

  useEffect(() => {
    cargarResumenDia()
  }, [cargarResumenDia])

  const saldoInicialNumero = toNumber(saldoInicial)

  const totalContado = useMemo(() => {
    return itemsDenominacion.reduce((total, item) => {
      const cantidad = toNumber(
        denominaciones[item.key as keyof Denominaciones]
      )

      return total + cantidad * item.value
    }, 0)
  }, [denominaciones])

  const efectivoEsperado = useMemo(() => {
    return (
      saldoInicialNumero + resumenDia.pagosEfectivo - resumenDia.devoluciones
    )
  }, [saldoInicialNumero, resumenDia.pagosEfectivo, resumenDia.devoluciones])

  const diferencia = totalContado - efectivoEsperado

  const tipoResultado =
    diferencia === 0 ? "cuadrado" : diferencia > 0 ? "sobrante" : "faltante"

  function handleDenominacionChange(key: keyof Denominaciones, value: string) {
    setDenominaciones((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function limpiarConteo() {
    setDenominaciones({
      mil: "",
      quinientos: "",
      doscientos: "",
      cien: "",
      cincuenta: "",
      veinte: "",
      diez: "",
      cinco: "",
      dos: "",
      uno: "",
    })

    setMensaje(null)
    setError(null)
  }

  async function generarReporte() {
    try {
      setLoadingCorte(true)
      setMensaje(null)
      setError(null)

      const detalle = itemsDenominacion
        .map((item) => {
          const cantidad = toNumber(
            denominaciones[item.key as keyof Denominaciones]
          )

          return {
            denominacion: item.value,
            cantidad,
            subtotal: cantidad * item.value,
          }
        })
        .filter((item) => item.cantidad > 0)

      const payload = {
        id_usuario: 1,
        imprimir: true,

        total_ventas: resumenDia.totalVentas,
        total_tarjeta: resumenDia.cobrosTarjetaConComision,
        total_transferencias: resumenDia.transferencias,
        total_efectivo: resumenDia.pagosEfectivo,
        total_devoluciones: resumenDia.devoluciones,
        total_tickets: resumenDia.tickets,

        saldo_inicial: saldoInicialNumero,
        efectivo_esperado: efectivoEsperado,
        efectivo_contado: totalContado,

        observaciones: "",
        detalle,
      }

      const res = await fetch(`${API_URL}/cortes-caja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Error al crear el corte de caja")
      }

      setMensaje(
        data.impresion?.ok
          ? "Corte creado e impreso correctamente."
          : "Corte creado, pero no se pudo imprimir."
      )

      await cargarResumenDia()
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : "Error al crear el corte de caja"
      )
    } finally {
      setLoadingCorte(false)
    }
  }

  if (loadingResumen) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:text-base">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando resumen del día...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="shrink-0 space-y-3 xl:space-y-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl xl:text-3xl">
            Corte de caja
          </h1>
          <p className="max-w-4xl text-xs text-muted-foreground sm:text-sm">
            Revisa los totales del día, captura el efectivo contado y genera el
            corte con impresión automática.
          </p>
        </div>

        {mensaje && (
          <Alert className="border-emerald-500/40 bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>Corte generado</AlertTitle>
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] sm:mt-4 sm:space-y-4 xl:space-y-5 [&::-webkit-scrollbar]:hidden">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Total ventas
              </CardTitle>
              <ReceiptText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="truncate text-xl font-bold xl:text-2xl">
                {formatMoney(resumenDia.totalVentas)}
              </p>
              <p className="text-xs text-muted-foreground">
                {resumenDia.tickets} tickets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="truncate text-xl font-bold xl:text-2xl">
                {formatMoney(resumenDia.pagosEfectivo)}
              </p>
              <p className="text-xs text-muted-foreground">
                Pagos recibidos en caja
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium">Tarjeta</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="truncate text-xl font-bold xl:text-2xl">
                {formatMoney(resumenDia.cobrosTarjetaConComision)}
              </p>
              <p className="text-xs text-muted-foreground">
                Incluye comisión registrada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Transferencias
              </CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="truncate text-xl font-bold xl:text-2xl">
                {formatMoney(resumenDia.transferencias)}
              </p>
              <p className="text-xs text-muted-foreground">
                Pagos por transferencia
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] xl:gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(380px,0.65fr)]">
          <Card className="min-w-0">
            <CardHeader className="p-4 lg:p-5">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Banknote className="h-5 w-5" />
                Conteo de efectivo
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-4 pt-0 lg:p-5 lg:pt-0">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {itemsDenominacion.map((item) => {
                  const cantidad = toNumber(
                    denominaciones[item.key as keyof Denominaciones]
                  )

                  const subtotal = cantidad * item.value

                  return (
                    <div
                      key={item.key}
                      className="rounded-xl border bg-card p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">
                          {item.label}
                        </span>

                        <Badge
                          variant="secondary"
                          className="max-w-[120px] truncate"
                        >
                          {formatMoney(subtotal)}
                        </Badge>
                      </div>

                      <Input
                        type="number"
                        min="0"
                        value={denominaciones[item.key as keyof Denominaciones]}
                        onChange={(event) =>
                          handleDenominacionChange(
                            item.key as keyof Denominaciones,
                            event.target.value
                          )
                        }
                        placeholder="Cantidad"
                        className="h-10"
                      />
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={limpiarConteo}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar conteo
                </Button>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">
                    Efectivo contado
                  </p>
                  <p className="text-2xl font-bold sm:text-3xl">
                    {formatMoney(totalContado)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:sticky lg:top-0 lg:h-fit">
            <CardHeader className="p-4 lg:p-5">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calculator className="h-5 w-5" />
                Resumen del corte
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-4 pt-0 lg:p-5 lg:pt-0">
              <div className="space-y-2">
                <label className="text-sm font-medium">Saldo inicial</label>
                <Input
                  type="number"
                  min="0"
                  value={saldoInicial}
                  onChange={(event) => setSaldoInicial(event.target.value)}
                  className="h-10"
                />
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Saldo inicial</span>
                  <span className="font-medium">
                    {formatMoney(saldoInicialNumero)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Ventas efectivo</span>
                  <span className="font-medium">
                    {formatMoney(resumenDia.pagosEfectivo)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Devoluciones</span>
                  <span className="font-medium text-red-600">
                    -{formatMoney(resumenDia.devoluciones)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">Efectivo esperado</span>
                  <span className="font-bold">
                    {formatMoney(efectivoEsperado)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">Efectivo contado</span>
                  <span className="font-bold">{formatMoney(totalContado)}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">Diferencia</span>
                  <span
                    className={
                      diferencia === 0
                        ? "font-bold text-emerald-600"
                        : diferencia > 0
                          ? "font-bold text-blue-600"
                          : "font-bold text-red-600"
                    }
                  >
                    {formatMoney(diferencia)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Resultado del corte
                </p>

                <Badge
                  variant={
                    tipoResultado === "faltante" ? "destructive" : "secondary"
                  }
                  className="mt-2 text-sm uppercase"
                >
                  {tipoResultado}
                </Badge>
              </div>

              <Button
                onClick={generarReporte}
                disabled={loadingCorte}
                className="w-full gap-2 py-5 text-sm sm:py-6 sm:text-base"
              >
                {loadingCorte ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando corte...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generar corte de caja
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
