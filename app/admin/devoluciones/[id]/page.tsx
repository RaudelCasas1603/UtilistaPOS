"use client"

import { use, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ReceiptText, UserRound } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

type Props = {
  params: Promise<{ id: string }>
}

type Item = {
  id: number
  id_producto: number
  nombre: string
  codigo_producto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  motivo?: string
}

type Devolucion = {
  id: number
  fecha_hora: string
  id_venta: number
  subtotal: number
  total: number
  motivo?: string
  estatus?: string
  cliente_nombre?: string
  cliente_telefono?: string
  cliente_correo?: string
  items: Item[]
}

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export default function DevolucionDetallePage({ params }: Props) {
  const { id } = use(params)

  const [devolucion, setDevolucion] = useState<Devolucion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchDevolucion() {
      try {
        const res = await fetch(`${API_URL}/devoluciones/${id}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Error al cargar devolución")

        const data = await res.json()
        setDevolucion(data)
      } catch (err) {
        setError("No se pudo cargar la devolución")
      } finally {
        setLoading(false)
      }
    }

    fetchDevolucion()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error || !devolucion) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Devolución no encontrada"}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col space-y-3 overflow-hidden p-3 lg:p-4 xl:p-5">
      <div className="shrink-0">
        <h1 className="text-xl font-bold xl:text-2xl">
          Devolución #{devolucion.id}
        </h1>
        <p className="text-xs text-muted-foreground xl:text-sm">
          Detalle completo de la devolución
        </p>
      </div>

      <div className="grid shrink-0 gap-3 xl:grid-cols-3">
        <Card className="flex min-h-[170px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Información</CardTitle>
          </CardHeader>

          <CardContent className="grid flex-1 grid-cols-2 gap-2 p-3 pt-0 text-xs">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Fecha</p>
              <p className="font-semibold">
                {formatDate(devolucion.fecha_hora)}
              </p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Hora</p>
              <p className="font-semibold">
                {formatTime(devolucion.fecha_hora)}
              </p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Venta</p>
              <p className="font-semibold">
                V-{String(devolucion.id_venta).padStart(5, "0")}
              </p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Estatus</p>
              <Badge className="mt-1 px-2 py-0 text-[11px]">
                {devolucion.estatus || "sin estatus"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-[170px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserRound className="h-4 w-4" />
              Cliente
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-2 p-3 pt-0 text-xs">
            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Nombre</p>
              <p className="font-semibold">
                {devolucion.cliente_nombre || "Cliente general"}
              </p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Teléfono</p>
              <p>{devolucion.cliente_telefono || "—"}</p>
            </div>

            <div className="rounded-lg border p-2">
              <p className="text-muted-foreground">Correo</p>
              <p className="break-all">{devolucion.cliente_correo || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-[170px] flex-col border-border/60 shadow-sm">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Resumen</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col justify-between p-3 pt-0 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(devolucion.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos</span>
                <span>{devolucion.items.length}</span>
              </div>

              <div className="rounded-lg border p-2">
                <p className="text-muted-foreground">Motivo</p>
                <p className="line-clamp-2">{devolucion.motivo || "—"}</p>
              </div>
            </div>

            <div className="flex justify-between border-t pt-2 text-sm font-bold">
              <span>Total</span>
              <span>{formatCurrency(devolucion.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col border-border/60 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ReceiptText className="h-4 w-4" />
            Productos devueltos
          </CardTitle>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-3 pt-0">
          <div className="h-full overflow-auto rounded-lg border">
            <table className="w-full table-fixed text-xs">
              <thead className="sticky top-0 z-10 bg-muted/40">
                <tr className="h-8">
                  <th className="w-[44px] px-2 text-left">#</th>
                  <th className="px-2 text-left">Producto</th>
                  <th className="w-[120px] px-2 text-left">Código</th>
                  <th className="w-[70px] px-2 text-center">Cant.</th>
                  <th className="w-[100px] px-2 text-right">Precio</th>
                  <th className="w-[110px] px-2 text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {devolucion.items.length > 0 ? (
                  devolucion.items.map((item, index) => (
                    <tr key={item.id} className="h-9 border-t">
                      <td className="px-2">{index + 1}</td>
                      <td className="truncate px-2 font-medium">
                        {item.nombre}
                      </td>
                      <td className="truncate px-2 text-muted-foreground">
                        {item.codigo_producto}
                      </td>
                      <td className="px-2 text-center">{item.cantidad}</td>
                      <td className="px-2 text-right">
                        {formatCurrency(item.precio_unitario)}
                      </td>
                      <td className="px-2 text-right font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Esta devolución no tiene productos cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
