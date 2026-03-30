"use client"

import { useMemo, useState } from "react"
import {
  Calculator,
  CreditCard,
  Banknote,
  Landmark,
  ReceiptText,
  RotateCcw,
  FileText,
  Wallet,
  CircleDollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value)
}

function toNumber(value: string) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export default function CorteCajaPage() {
  // Simulación de respuesta de API
  const [resumenDia] = useState({
    fecha: new Date().toLocaleDateString(),
    totalVentas: 18450.75,
    cobrosTarjetaConComision: 6324.5,
    transferencias: 2810.0,
    devoluciones: 540.0,
    pagosEfectivo: 9856.25,
    tickets: 47,
  })

  const [saldoInicial, setSaldoInicial] = useState("500")

  const [denominaciones, setDenominaciones] = useState({
    b1000: "0",
    b500: "2",
    b200: "4",
    b100: "6",
    b50: "8",
    b20: "10",
    m10: "8",
    m5: "10",
    m2: "12",
    m1: "15",
    c50: "0",
  })

  const totalContado = useMemo(() => {
    return (
      toNumber(denominaciones.b1000) * 1000 +
      toNumber(denominaciones.b500) * 500 +
      toNumber(denominaciones.b200) * 200 +
      toNumber(denominaciones.b100) * 100 +
      toNumber(denominaciones.b50) * 50 +
      toNumber(denominaciones.b20) * 20 +
      toNumber(denominaciones.m10) * 10 +
      toNumber(denominaciones.m5) * 5 +
      toNumber(denominaciones.m2) * 2 +
      toNumber(denominaciones.m1) * 1 +
      toNumber(denominaciones.c50) * 0.5
    )
  }, [denominaciones])

  const saldoInicialNumero = toNumber(saldoInicial)
  const efectivoEsperado =
    saldoInicialNumero + resumenDia.pagosEfectivo - resumenDia.devoluciones
  const diferencia = totalContado - efectivoEsperado

  function handleDenominacionChange(
    field: keyof typeof denominaciones,
    value: string
  ) {
    setDenominaciones((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function generarReporte() {
    const reporte = {
      fecha: resumenDia.fecha,
      totalVentas: resumenDia.totalVentas,
      cobrosTarjetaConComision: resumenDia.cobrosTarjetaConComision,
      transferencias: resumenDia.transferencias,
      devoluciones: resumenDia.devoluciones,
      pagosEfectivo: resumenDia.pagosEfectivo,
      tickets: resumenDia.tickets,
      saldoInicial: saldoInicialNumero,
      efectivoContado: totalContado,
      efectivoEsperado,
      diferencia,
      desgloseCaja: denominaciones,
    }

    console.log("REPORTE CORTE DE CAJA:", reporte)
    alert("Reporte generado en consola (simulado)")
  }

  const itemsDenominacion = [
    { key: "b1000", label: "$1000", value: 1000 },
    { key: "b500", label: "$500", value: 500 },
    { key: "b200", label: "$200", value: 200 },
    { key: "b100", label: "$100", value: 100 },
    { key: "b50", label: "$50", value: 50 },
    { key: "b20", label: "$20", value: 20 },
    { key: "m10", label: "$10", value: 10 },
    { key: "m5", label: "$5", value: 5 },
    { key: "m2", label: "$2", value: 2 },
    { key: "m1", label: "$1", value: 1 },
    { key: "c50", label: "$0.50", value: 0.5 },
  ] as const

  return (
    <div className="flex h-full flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Corte de caja</h1>
          <p className="text-sm text-muted-foreground">
            Consulta el resumen del día y captura el arqueo de efectivo.
          </p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Ventas totales</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(resumenDia.totalVentas)}
              </p>
            </div>
            <ReceiptText className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Tarjeta con comisión
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(resumenDia.cobrosTarjetaConComision)}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Transferencias</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(resumenDia.transferencias)}
              </p>
            </div>
            <Landmark className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Devoluciones</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(resumenDia.devoluciones)}
              </p>
            </div>
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Tickets del día</p>
              <p className="mt-1 text-2xl font-bold">{resumenDia.tickets}</p>
            </div>
            <CircleDollarSign className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              Captura de arqueo
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="">
                <Input
                  id="saldoInicial"
                  type="number"
                  min="0"
                  step="0.01"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                  placeholder="Saldo inicial en caja"
                  className="h-24 !text-2xl font-semibold text-left p-4"
                />
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Efectivo vendido hoy
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(resumenDia.pagosEfectivo)}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Billetes y monedas
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {itemsDenominacion.map((item) => {
                  const cantidad = toNumber(
                    denominaciones[item.key as keyof typeof denominaciones]
                  )
                  const subtotal = cantidad * item.value

                  return (
                    <div
                      key={item.key}
                      className="rounded-xl border-2 border-border/60 bg-card p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Label htmlFor={item.key}>{item.label}</Label>
                        <span className="text-xs text-muted-foreground">
                          Subtotal: {formatCurrency(subtotal)}
                        </span>
                      </div>

                      <Input
                        id={item.key}
                        type="number"
                        min="0"
                        step="1"
                        value={
                          denominaciones[
                            item.key as keyof typeof denominaciones
                          ]
                        }
                        onChange={(e) =>
                          handleDenominacionChange(item.key, e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5" />
                Resumen del corte
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">{resumenDia.fecha}</span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Saldo inicial</span>
                <span className="font-medium">
                  {formatCurrency(saldoInicialNumero)}
                </span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Efectivo del día</span>
                <span className="font-medium">
                  {formatCurrency(resumenDia.pagosEfectivo)}
                </span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Devoluciones</span>
                <span className="font-medium">
                  - {formatCurrency(resumenDia.devoluciones)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Efectivo esperado
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(efectivoEsperado)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Efectivo contado
                </span>
                <span className="text-lg font-bold">
                  {formatCurrency(totalContado)}
                </span>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Diferencia</span>
                  <span
                    className={[
                      "text-lg font-bold",
                      diferencia > 0
                        ? "text-emerald-600"
                        : diferencia < 0
                          ? "text-red-600"
                          : "text-foreground",
                    ].join(" ")}
                  >
                    {formatCurrency(diferencia)}
                  </span>
                </div>

                <p className="mt-2 text-base text-muted-foreground">
                  {diferencia > 0
                    ? "Hay sobrante en caja."
                    : diferencia < 0
                      ? "Hay faltante en caja."
                      : "La caja está cuadrada."}
                </p>
              </div>
            </CardContent>
          </Card>
          
        <div className="flex justify-center">
        <Button onClick={generarReporte} className="gap-2 w-auto text-xl p-8">
          <FileText className="h-4 w-4" />
          Generar reporte del día
        </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
